import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { AdcInviteAction, AdcService, IAdcMember, IAdcRow, ISetAdcAdminBody } from '../../../../shared/adc/adc.service';
import { AdcRemovedMember, adcAdminControls, readAdcError } from '../adc-dialog.utils';

export interface ChangeAdminDialogData {
  adc: IAdcRow;
}

type ChangeAdminMode = 'promote' | 'invite';

const SUBROLE_LABEL: Record<IAdcMember['subRole'], string> = {
  SUBMITTER: 'Admin',
  EDITOR: 'Reviewer',
  VIEWER: 'Viewer',
};

/**
 * Sets or replaces an ADC's Admin: promote a verified member, or invite a new person. The current Admin, if
 * any, becomes a Reviewer. Closes with `true` only after the API confirms.
 */
@Component({
  selector: 'app-change-admin-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
  ],
  templateUrl: './change-admin-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeAdminDialogComponent implements OnInit {
  private readonly adcService = inject(AdcService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(MatDialogRef<ChangeAdminDialogComponent, boolean>);
  readonly data = inject<ChangeAdminDialogData>(MAT_DIALOG_DATA);

  readonly adc = this.data.adc;
  readonly actionLabel = this.adc.admin ? 'Change Admin' : 'Set Admin';

  readonly mode = signal<ChangeAdminMode>('promote');
  readonly members = signal<IAdcMember[]>([]);
  readonly membersLoading = signal(true);
  readonly isSubmitting = signal(false);
  readonly formError = signal<string | null>(null);
  readonly removedMember = signal<AdcRemovedMember | null>(null);

  /** Only a verified member who is not already the Admin can be promoted. */
  readonly promotable = computed(() =>
    this.members().filter((m) => m.subRole !== 'SUBMITTER' && m.isXVIFCProfileVerified),
  );

  readonly promoteControl = new FormControl('', { nonNullable: true });
  readonly inviteForm = new FormGroup(adcAdminControls());

  ngOnInit(): void {
    this.adcService
      .members(this.adc._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (members) => {
          this.members.set(members);
          this.membersLoading.set(false);
          if (this.promotable().length === 0) this.mode.set('invite');
        },
        error: () => {
          this.membersLoading.set(false);
          this.mode.set('invite');
          this.formError.set('Unable to load this ADC\'s members. You can still invite a new person.');
        },
      });
  }

  memberLabel(member: IAdcMember): string {
    return `${member.name} (${SUBROLE_LABEL[member.subRole]})`;
  }

  onModeChange(mode: ChangeAdminMode): void {
    this.mode.set(mode);
    this.formError.set(null);
  }

  submit(): void {
    if (this.isSubmitting()) return;
    if (this.mode() === 'promote') {
      if (!this.promoteControl.value) {
        this.formError.set('Select the member to make Admin.');
        return;
      }
    } else if (this.inviteForm.invalid) {
      this.inviteForm.markAllAsTouched();
      return;
    }
    this.send('invite');
  }

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

    const invite = this.inviteForm.getRawValue();
    const body: ISetAdcAdminBody =
      this.mode() === 'promote'
        ? { mode: 'promote', userId: this.promoteControl.value }
        : {
            mode: 'invite',
            name: invite.adminName,
            email: invite.email,
            mobile: invite.mobile,
            designation: invite.designation,
            action,
          };

    this.adcService
      .setAdmin(this.adc._id, body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.dialogRef.close(true);
        },
        error: (err: unknown) => {
          this.isSubmitting.set(false);
          const { removed, message } = readAdcError(err, 'Unable to change the ADC Admin. Please try again.');
          if (removed) this.removedMember.set(removed);
          else this.formError.set(message ?? null);
        },
      });
  }
}
