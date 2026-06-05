import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { finalize } from 'rxjs/operators';

import { ConfirmDialogComponent, ConfirmDialogData } from '../confirm-dialog/confirm-dialog.component';
import { CreateTemplatePayload, EmailTemplate, UpdateTemplatePayload } from '../scheduled-reminders.models';
import { ScheduledRemindersService } from '../scheduled-reminders.service';

export type TemplateDialogMode = 'create' | 'edit';
export interface EditDialogData { mode?: TemplateDialogMode; template?: EmailTemplate; }
export interface EditDialogResult { created?: EmailTemplate; updated?: EmailTemplate; }

@Component({
  selector: 'app-template-edit-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatIconModule, MatSlideToggleModule, MatProgressSpinnerModule,
  ],
  templateUrl: './template-edit-dialog.component.html',
  styleUrl: './template-edit-dialog.component.scss',
})
export class TemplateEditDialogComponent implements OnInit {
  private readonly fb        = inject(FormBuilder);
  private readonly svc       = inject(ScheduledRemindersService);
  private readonly matDialog = inject(MatDialog);
  private readonly san       = inject(DomSanitizer);
  readonly ref               = inject(MatDialogRef<TemplateEditDialogComponent>);
  readonly data: EditDialogData = inject(MAT_DIALOG_DATA);

  readonly saving      = signal(false);
  readonly saveError   = signal('');
  readonly showPreview = signal(false);

  form!: FormGroup;

  get isCreateMode(): boolean {
    return (this.data.mode ?? 'edit') === 'create';
  }

  get dialogTitle(): string {
    return this.isCreateMode ? 'Add Template' : 'Edit Template';
  }

  get confirmMessage(): string {
    return this.isCreateMode ? 'Create this template?' : 'Save changes to this template?';
  }

  get confirmText(): string {
    return this.isCreateMode ? 'Create' : 'Save';
  }

  get saveText(): string {
    return this.isCreateMode ? 'Create Template' : 'Save Changes';
  }

  get savingText(): string {
    return this.isCreateMode ? 'Creating...' : 'Saving...';
  }

  get preview(): SafeHtml {
    return this.san.bypassSecurityTrustHtml(this.form?.get('body')?.value ?? '');
  }

  ngOnInit(): void {
    const t = this.data.template;
    this.form = this.fb.group({
      name:     [t?.name ?? '',     [Validators.required, Validators.maxLength(120)]],
      slug:     [t?.slug ?? '',     [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      subject:  [t?.subject ?? '',  [Validators.required, Validators.maxLength(256)]],
      body:     [t?.body ?? '',      Validators.required],
      isActive: [t?.isActive ?? true],
    });
  }

  togglePreview(): void { this.showPreview.update(v => !v); }

  onSave(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const cfg: ConfirmDialogData = {
      title: this.isCreateMode ? 'Create Template' : 'Save Template',
      message: this.confirmMessage,
      confirmText: this.confirmText,
    };
    this.matDialog
      .open(ConfirmDialogComponent, { data: cfg, width: '400px', panelClass: 'xvifc-theme' })
      .afterClosed()
      .subscribe((ok: boolean) => {
        if (ok) this.save();
      });
  }

  private save(): void {
    this.saving.set(true);
    this.saveError.set('');
    const payload: CreateTemplatePayload | UpdateTemplatePayload = this.form.getRawValue();
    const request = this.isCreateMode
      ? this.svc.createTemplate(payload)
      : this.svc.updateTemplate(this.data.template!._id, payload);

    request
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: template => this.ref.close(this.isCreateMode ? { created: template } : { updated: template }),
        error: (e: Error) => this.saveError.set(e.message),
      });
  }

  onCancel(): void { this.ref.close(); }
}
