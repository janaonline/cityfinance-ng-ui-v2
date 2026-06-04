import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { finalize } from 'rxjs/operators';

import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog/confirm-dialog.component';
import { EmailReminder, EmailTemplate, ReminderStatus, SendEmailPayload } from './scheduled-reminders.models';
import { ScheduledRemindersService } from './scheduled-reminders.service';
import { EditDialogData, EditDialogResult, TemplateEditDialogComponent } from './template-edit-dialog/template-edit-dialog.component';

function urlValidator(): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    const v = (c.value ?? '').trim();
    if (!v) return null;
    try { new URL(v); return null; } catch { return { invalidUrl: true }; }
  };
}

const STATUS_CONFIG: Record<ReminderStatus, { label: string; cls: string }> = {
  PENDING:   { label: 'Pending',   cls: 'text-bg-warning'   },
  SENT:      { label: 'Sent',      cls: 'text-bg-success'   },
  FAILED:    { label: 'Failed',    cls: 'text-bg-danger'    },
  CANCELLED: { label: 'Cancelled', cls: 'text-bg-secondary' },
};

@Component({
  selector: 'app-scheduled-reminders',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatExpansionModule,
    MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatIconModule, MatProgressSpinnerModule, MatTooltipModule,
    MatDialogModule, MatSnackBarModule,
  ],
  templateUrl: './scheduled-reminders.component.html',
  styleUrl: './scheduled-reminders.component.scss',
})
export class ScheduledRemindersComponent implements OnInit {
  private readonly fb      = inject(FormBuilder);
  private readonly svc     = inject(ScheduledRemindersService);
  private readonly dialog  = inject(MatDialog);
  private readonly snack   = inject(MatSnackBar);
  private readonly san     = inject(DomSanitizer);
  private readonly destroy = inject(DestroyRef);

  // ── Signals ──────────────────────────────────────────────────────────────
  readonly templates    = signal<EmailTemplate[]>([]);
  readonly tplLoading   = signal(false);
  readonly tplError     = signal('');

  readonly reminders    = signal<EmailReminder[]>([]);
  readonly remLoading   = signal(false);
  readonly remError     = signal('');

  readonly sending      = signal(false);
  readonly sendError    = signal('');
  readonly chips        = signal<string[]>([]);
  readonly chipErr      = signal('');

  readonly activeTpls = computed(() => this.templates().filter(t => t.isActive && !t.isDeleted));
  readonly statusConfig = STATUS_CONFIG;

  // ── Form ─────────────────────────────────────────────────────────────────
  sendForm!: FormGroup;

  ngOnInit(): void {
    this.sendForm = this.fb.group({
      templateId:  [null],
      subject:     ['', [Validators.required, Validators.maxLength(256)]],
      body:        ['', Validators.required],
      varName:     [''],
      varFy:       [''],
      varDeadline: [''],
      varDashUrl:  ['', urlValidator()],
    });

    this.sendForm.get('templateId')!.valueChanges
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe((id: string | null) => {
        const tpl = this.templates().find(t => t._id === id);
        if (tpl) this.sendForm.patchValue({ subject: tpl.subject, body: tpl.body });
      });

    this.loadTemplates();
    this.loadReminders();
  }

  // ── Data loaders ─────────────────────────────────────────────────────────
  loadTemplates(): void {
    this.tplLoading.set(true); this.tplError.set('');
    this.svc.getTemplates()
      .pipe(finalize(() => this.tplLoading.set(false)), takeUntilDestroyed(this.destroy))
      .subscribe({ next: d => this.templates.set(d), error: (e: Error) => this.tplError.set(e.message) });
  }

  loadReminders(): void {
    this.remLoading.set(true); this.remError.set('');
    this.svc.getReminders()
      .pipe(finalize(() => this.remLoading.set(false)), takeUntilDestroyed(this.destroy))
      .subscribe({ next: d => this.reminders.set(d), error: (e: Error) => this.remError.set(e.message) });
  }

  // ── Chip input ───────────────────────────────────────────────────────────
  addChip(input: HTMLInputElement): void {
    const email = input.value.trim(); input.value = '';
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { this.chipErr.set(`"${email}" is not a valid email`); return; }
    if (!this.chips().includes(email)) this.chips.update(c => [...c, email]);
    this.chipErr.set('');
  }

  removeChip(email: string): void { this.chips.update(c => c.filter(x => x !== email)); }

  pasteEmails(e: ClipboardEvent): void {
    e.preventDefault();
    const valid = (e.clipboardData?.getData('text') ?? '').split(/[,;\n\s]+/).map(s => s.trim())
      .filter(s => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));
    this.chips.update(c => [...new Set([...c, ...valid])]);
  }

  // ── Send email ───────────────────────────────────────────────────────────
  onSend(): void {
    if (!this.chips().length) { this.chipErr.set('Add at least one recipient'); return; }
    if (this.sendForm.invalid) { this.sendForm.markAllAsTouched(); return; }
    this.confirm({
      message: `Send email to <strong>${this.chips().length}</strong> recipient(s)?`,
      confirmText: 'Send Email',
    }, () => this.doSend());
  }

  private doSend(): void {
    this.sending.set(true); this.sendError.set('');
    const f = this.sendForm.getRawValue();
    const vars: Record<string, string> = {};
    if (f.varName)     vars['name']        = f.varName;
    if (f.varFy)       vars['fy']           = f.varFy;
    if (f.varDeadline) vars['deadline']     = f.varDeadline;
    if (f.varDashUrl)  vars['dashboardUrl'] = f.varDashUrl;
    const tpl = this.templates().find(t => t._id === f.templateId);
    const payload: SendEmailPayload = {
      to: this.chips(), subject: f.subject, body: f.body,
      ...(tpl && { templateId: tpl._id, templateSlug: tpl.slug }),
      ...(Object.keys(vars).length && { variables: vars }),
    };
    this.svc.sendEmail(payload).pipe(finalize(() => this.sending.set(false))).subscribe({
      next: () => { this.toast('Email sent successfully'); this.sendForm.reset(); this.chips.set([]); },
      error: (e: Error) => this.sendError.set(e.message),
    });
  }

  // ── Template actions ─────────────────────────────────────────────────────
  openEdit(tpl: EmailTemplate): void {
    const data: EditDialogData = { template: tpl };
    this.dialog.open(TemplateEditDialogComponent, { data, width: '700px', maxWidth: '95vw', disableClose: true, panelClass: 'xvifc-theme' })
      .afterClosed().subscribe((r: EditDialogResult | undefined) => {
        if (r?.updated) { this.templates.update(l => l.map(t => t._id === r.updated._id ? r.updated : t)); this.toast('Template updated'); }
      });
  }

  toggleActive(tpl: EmailTemplate): void {
    const enable = !tpl.isActive;
    this.confirm({
      message: enable ? `Enable "<strong>${tpl.name}</strong>"?` : `Disable "<strong>${tpl.name}</strong>"? It will no longer be available for selection.`,
      confirmText: enable ? 'Enable' : 'Disable',
      confirmColor: enable ? 'primary' : 'warn',
    }, () => {
      this.svc.updateTemplate(tpl._id, { name: tpl.name, slug: tpl.slug, subject: tpl.subject, body: tpl.body, isActive: enable })
        .subscribe({
          next: u => { this.templates.update(l => l.map(t => t._id === u._id ? u : t)); this.toast(enable ? 'Template enabled' : 'Template disabled'); },
          error: (e: Error) => this.toast(e.message, true),
        });
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  safe(html: string): SafeHtml { return this.san.bypassSecurityTrustHtml(html); }

  getStatusCfg(status: string) {
    return STATUS_CONFIG[status as ReminderStatus] ?? { label: status, cls: 'text-bg-secondary' };
  }

  fmtDate(d: string | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
  }

  fmtDateTime(d: string | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
  }

  trackId(_: number, t: { _id: string }) { return t._id; }

  private confirm(data: ConfirmDialogData, onConfirm: () => void): void {
    this.dialog.open(ConfirmDialogComponent, { data, width: '400px', panelClass: 'xvifc-theme' })
      .afterClosed().subscribe((ok: boolean) => { if (ok) onConfirm(); });
  }

  private toast(msg: string, err = false): void {
    this.snack.open(msg, 'Close', { duration: 4000, horizontalPosition: 'end', verticalPosition: 'top', panelClass: err ? ['snack-error'] : ['snack-success'] });
  }
}
