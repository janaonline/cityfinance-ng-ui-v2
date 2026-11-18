import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { IState } from '../../../../../../core/models/state/state';
import { StateService } from '../../../../../../core/services/state/state.service';
import { noHtmlOrScript, noMongoOperators } from '../../../../../../auth/validators/auth-security.validators';
import { AdcInviteAction, AdcService, IAdcRow } from '../../../../shared/adc/adc.service';
import { ADC_NAME_MAX_LENGTH, AdcRemovedMember, adcAdminControls, readAdcError } from '../adc-dialog.utils';

export type AdcFormDialogData = { mode: 'create' } | { mode: 'edit'; adc: IAdcRow };

/**
 * Add ADC (state, name and its ADC Admin, who gets the invite email) or Edit ADC (name only - the state is
 * fixed once created). Calls the API itself, shows errors inline and closes with `true` only on success.
 */
@Component({
  selector: 'app-adc-form-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './adc-form-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdcFormDialogComponent implements OnInit {
  private readonly adcService = inject(AdcService);
  private readonly stateService = inject(StateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(MatDialogRef<AdcFormDialogComponent, boolean>);
  readonly data = inject<AdcFormDialogData>(MAT_DIALOG_DATA);

  readonly isEdit = this.data.mode === 'edit';
  readonly editedAdc = this.data.mode === 'edit' ? this.data.adc : null;
  readonly nameMaxLength = ADC_NAME_MAX_LENGTH;

  readonly states = signal<IState[]>([]);
  readonly isSubmitting = signal(false);
  readonly formError = signal<string | null>(null);
  readonly removedMember = signal<AdcRemovedMember | null>(null);

  readonly form = new FormGroup({
    stateId: new FormControl('', { nonNullable: true, validators: this.isEdit ? [] : [Validators.required] }),
    name: new FormControl(this.editedAdc?.name ?? '', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(ADC_NAME_MAX_LENGTH),
        Validators.pattern(/\S/),
        noHtmlOrScript,
        noMongoOperators,
      ],
    }),
    ...adcAdminControls(),
  });

  ngOnInit(): void {
    if (this.isEdit) {
      // Only the name is editable; the admin's details belong to the create form.
      (['stateId', 'adminName', 'email', 'mobile', 'designation'] as const).forEach((c) => this.form.controls[c].disable());
      return;
    }
    this.stateService
      .getStates()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => this.states.set(response?.data ?? []),
        error: () => this.formError.set('Unable to load states. Please close and try again.'),
      });
  }

  submit(): void {
    if (this.isSubmitting()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.editedAdc && this.form.controls.name.value.trim() === this.editedAdc.name) {
      this.dialogRef.close(false);
      return;
    }
    this.send('invite');
  }

  /** Re-sends the create with `restore`, after the email turned out to belong to a removed member. */
  restore(): void {
    this.send('restore');
  }

  backToForm(): void {
    this.removedMember.set(null);
    this.formError.set(null);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  private send(action: AdcInviteAction): void {
    this.isSubmitting.set(true);
    this.formError.set(null);
    this.removedMember.set(null);

    const value = this.form.getRawValue();
    const request$ = this.editedAdc
      ? this.adcService.rename(this.editedAdc._id, value.name.trim())
      : this.adcService.create({
          stateId: value.stateId,
          name: value.name.trim(),
          admin: { name: value.adminName, email: value.email, mobile: value.mobile, designation: value.designation },
          action,
        });

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.dialogRef.close(true);
      },
      error: (err: unknown) => {
        this.isSubmitting.set(false);
        const { removed, message } = readAdcError(
          err,
          this.isEdit ? 'Unable to rename this ADC. Please try again.' : 'Unable to add the ADC. Please try again.',
        );
        if (removed) this.removedMember.set(removed);
        else this.formError.set(message ?? null);
      },
    });
  }
}
