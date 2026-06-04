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

import { DialogComponent } from '../../../../../shared/components/dialog/dialog.component';
import { IDialogConfiguration } from '../../../../../shared/components/dialog/models/dialogConfiguration';
import { EmailTemplate, UpdateTemplatePayload } from '../scheduled-reminders.models';
import { ScheduledRemindersService } from '../scheduled-reminders.service';

export interface EditDialogData { template: EmailTemplate; }
export interface EditDialogResult { updated: EmailTemplate; }

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

  get preview(): SafeHtml {
    return this.san.bypassSecurityTrustHtml(this.form?.get('body')?.value ?? '');
  }

  ngOnInit(): void {
    const t = this.data.template;
    this.form = this.fb.group({
      name:     [t.name,     [Validators.required, Validators.maxLength(120)]],
      slug:     [t.slug,     [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      subject:  [t.subject,  [Validators.required, Validators.maxLength(256)]],
      body:     [t.body,      Validators.required],
      isActive: [t.isActive],
    });
  }

  togglePreview(): void { this.showPreview.update(v => !v); }

  onSave(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const cfg: IDialogConfiguration = {
      message: 'Save changes to this template?',
      buttons: { confirm: { text: 'Save' }, cancel: { text: 'Cancel' } },
    };
    this.matDialog
      .open(DialogComponent, { data: cfg, width: '380px', panelClass: 'xvifc-theme' })
      .afterClosed()
      .subscribe((r: { buttonClicked: string }) => {
        if (r?.buttonClicked === 'confirm') this.save();
      });
  }

  private save(): void {
    this.saving.set(true);
    this.saveError.set('');
    const payload: UpdateTemplatePayload = this.form.getRawValue();
    this.svc.updateTemplate(this.data.template._id, payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: updated => this.ref.close({ updated } as EditDialogResult),
        error: (e: Error) => this.saveError.set(e.message),
      });
  }

  onCancel(): void { this.ref.close(); }
}
