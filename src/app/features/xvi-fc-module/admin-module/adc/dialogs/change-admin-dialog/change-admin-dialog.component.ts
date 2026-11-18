import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { Observable, catchError, debounceTime, distinctUntilChanged, filter, map, of, switchMap, tap } from 'rxjs';
import { AdcInviteAction, AdcService, IAdcMember, IAdcRow, IPage, ISetAdcAdminBody } from '../../../../shared/adc/adc.service';
import { ADC_MAX_PAGE_SIZE } from '../../../../shared/adc/adc-paging.constants';
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
 * Sets or replaces an ADC's Admin: promote a verified member (searched on the server), or invite a new person.
 * The current Admin, if any, becomes a Reviewer. Closes with `true` only after the API confirms.
 */
@Component({
  selector: 'app-change-admin-dialog',
  imports: [
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
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
  /** True until the first search says whether anyone can be promoted at all. */
  readonly membersLoading = signal(true);
  readonly hasPromotable = signal(false);
  readonly searching = signal(false);
  readonly results = signal<IAdcMember[]>([]);
  readonly selected = signal<IAdcMember | null>(null);
  readonly isSubmitting = signal(false);
  readonly formError = signal<string | null>(null);
  readonly removedMember = signal<AdcRemovedMember | null>(null);

  /** Text while typing; the member once one is picked. */
  readonly memberSearch = new FormControl<string | IAdcMember>('', { nonNullable: true });
  readonly inviteForm = new FormGroup(adcAdminControls());

  readonly displayMember = (member: IAdcMember | string | null): string =>
    typeof member === 'string' ? member : member ? member.name : '';

  ngOnInit(): void {
    this.search('').subscribe({
      next: (page) => {
        this.membersLoading.set(false);
        this.hasPromotable.set(page.total > 0);
        if (page.total === 0) this.mode.set('invite');
      },
      error: () => {
        this.membersLoading.set(false);
        this.mode.set('invite');
        this.formError.set("Unable to load this ADC's members. You can still invite a new person.");
      },
    });

    this.memberSearch.valueChanges
      .pipe(
        // Picking an option sets the member object; only typed text searches, and it clears the pick.
        filter((value): value is string => typeof value === 'string'),
        tap(() => this.selected.set(null)),
        map((text) => text.trim()),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((text) => this.search(text).pipe(catchError(() => of(null)))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  memberLabel(member: IAdcMember): string {
    return `${member.name} (${SUBROLE_LABEL[member.subRole]})`;
  }

  onMemberSelected(event: MatAutocompleteSelectedEvent): void {
    this.selected.set(event.option.value as IAdcMember);
    this.formError.set(null);
  }

  onModeChange(mode: ChangeAdminMode): void {
    this.mode.set(mode);
    this.formError.set(null);
  }

  submit(): void {
    if (this.isSubmitting()) return;
    if (this.mode() === 'promote') {
      if (!this.selected()) {
        this.formError.set('Search for and select the member to make Admin.');
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

  /** Verified members other than the Admin: the only ones the API lets us promote. */
  private search(text: string): Observable<IPage<IAdcMember>> {
    this.searching.set(true);
    return this.adcService
      .members(this.adc._id, {
        page: 1,
        limit: ADC_MAX_PAGE_SIZE,
        status: 'ACTIVE',
        excludeAdmin: true,
        search: text || undefined,
      })
      .pipe(
        tap({
          next: (page) => {
            this.results.set(page.data);
            this.searching.set(false);
          },
          error: () => {
            this.results.set([]);
            this.searching.set(false);
          },
        }),
        takeUntilDestroyed(this.destroyRef),
      );
  }

  private send(action: AdcInviteAction): void {
    this.isSubmitting.set(true);
    this.formError.set(null);
    this.removedMember.set(null);

    const invite = this.inviteForm.getRawValue();
    const body: ISetAdcAdminBody =
      this.mode() === 'promote'
        ? { mode: 'promote', userId: this.selected()!._id }
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
