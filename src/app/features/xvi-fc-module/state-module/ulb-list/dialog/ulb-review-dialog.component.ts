import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../../../material.module';
import { IExemptableForm, IUlbMaster, IUlbYearAccessEntry } from '../../../../../core/models/ulb-master';
import { SignedUrlDirective } from '../../../../../core/directives/storage-url.directive';
import {
  UploadedFileMetadata,
  normalizeUploadedFileMetadata,
} from '../../../../../shared/dynamic-form/components/file/file-metadata.types';
import { environment } from '../../../../../../environments/environment';
import { UlbMasterService } from '../ulb-master.service';
import { UserUtility } from '../../../../../core/util/user/user';

export interface UlbReviewDialogData {
  ulb: IUlbMaster;
  /** When true, shows the ULB details with only a Close button — no Approve/Reject actions. */
  readOnly?: boolean;
}

interface YearItem {
  _id: string;
  year: string;
}

export interface UlbReviewDialogResponse {
  decision: 'APPROVED' | 'REJECTED';
  reason?: string;
}

interface IReviewField {
  label: string;
  value: string;
}

@Component({
  selector: 'app-ulb-review-dialog',
  imports: [MatDialogModule, MaterialModule, FormsModule, SignedUrlDirective],
  templateUrl: './ulb-review-dialog.component.html',
  styleUrl: './ulb-review-dialog.component.scss',
})
export class UlbReviewDialogComponent {
  /** true once Reject is clicked, to reveal the reason step in place of the view. */
  rejecting = false;
  reason = '';
  submitted = false;

  readonly fields: IReviewField[];

  // xvi-fc dynamic year access — see cf-nest-api-v2's src/module/xvi-fc/common/services/CLAUDE.md
  // for the mechanism this drives (startYear + the seed year's disabledFormIds). Optional,
  // edit-anytime, never blocks Approve/Reject — its own "Save Year Access" action below is
  // independent of the dialog's decision flow.
  years: YearItem[] = [];
  selectedYearId: string | null = null;
  exemptableForms: IExemptableForm[] = [];
  disabledFormIds = new Set<number>();
  yearAccessLoading = false;
  yearAccessSaving = false;
  yearAccessSaved = false;
  yearAccessError: string | null = null;

  constructor(
    private dialogRef: MatDialogRef<UlbReviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UlbReviewDialogData,
    private ulbMasterService: UlbMasterService,
    private http: HttpClient,
  ) {
    this.fields = this.buildFields(this.data.ulb);
    this.gazetteFile = normalizeUploadedFileMetadata(this.data.ulb.gazetteNotificationFile);
    if (this.showYearAccess) this.loadYearAccess();
  }

  /**
   * Dynamic Year Access exists for genuinely new ULBs that lack prior-year data - an "Existing
   * ULB" (isExistingUser, predates the approval workflow) has historical data by definition, so
   * the exemption mechanism does not apply and this section is hidden for them entirely.
   * Also ADMIN-only: `GET/PATCH master/ulb/:id/year-access` are `@Roles([Role.ADMIN])` on the
   * backend - a STATE user (who can also open this dialog via "View") would otherwise get a 403
   * the moment the dialog tries to fetch it.
   */
  get showYearAccess(): boolean {
    return !this.data.ulb.isExistingUser && new UserUtility().getLoggedInUserDetails()?.role === 'ADMIN';
  }

  /** Mirrors the Register ULB page's field set (see DEFAULT_ULB_REGISTER_SECTIONS server-side) — not the full Ulb schema. */
  private buildFields(ulb: IUlbMaster): IReviewField[] {
    return [
      { label: 'ULB Type', value: ulb.ulbTypeName || ulb.ulbType || '—' },
      { label: 'District', value: ulb.district || '—' },
      { label: 'Census Code / Sb Code', value: ulb.censusCode || ulb.sbCode || '—' },
      { label: 'Date of Constitution', value: this.formatDate(ulb.dateOfConstitution) },
      { label: 'Gazette Notification Number', value: ulb.gazetteNotificationNumber || '—' },
    ];
  }

  private formatDate(value?: string | null): string {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  /** Normalizes records persisted before the canonical shape (fileName/fileUrl) alongside canonical ones. */
  readonly gazetteFile: UploadedFileMetadata | null;

  /** Reason recorded the last time this ULB was rejected, if any — shown for context during re-review. */
  get previousRejectReason(): string | null {
    return this.data.ulb.approval?.rejectReason ?? null;
  }

  startReject(): void {
    this.rejecting = true;
    this.submitted = false;
  }

  cancelReject(): void {
    this.rejecting = false;
    this.reason = '';
    this.submitted = false;
  }

  approve(): void {
    this.dialogRef.close({ decision: 'APPROVED' } as UlbReviewDialogResponse);
  }

  confirmReject(): void {
    this.submitted = true;
    if (!this.reason.trim()) return;

    this.dialogRef.close({
      decision: 'REJECTED',
      reason: this.reason.trim(),
    } as UlbReviewDialogResponse);
  }

  isExemptChecked(formId: number): boolean {
    return this.disabledFormIds.has(formId);
  }

  toggleExempt(formId: number): void {
    if (this.disabledFormIds.has(formId)) this.disabledFormIds.delete(formId);
    else this.disabledFormIds.add(formId);
  }

  saveYearAccess(): void {
    const selected = this.years.find((y) => y._id === this.selectedYearId);
    if (!selected) return;

    this.yearAccessSaving = true;
    this.yearAccessSaved = false;
    this.yearAccessError = null;
    this.ulbMasterService
      .updateYearAccess(this.data.ulb._id, {
        startYear: this.startCalendarYear(selected.year),
        disabledFormIds: Array.from(this.disabledFormIds),
      })
      .subscribe({
        next: () => {
          this.yearAccessSaved = true;
        },
        error: (error: unknown) => {
          this.yearAccessError = this.extractErrorMessage(error) ?? 'Unable to save year access. Please try again.';
        },
      })
      .add(() => {
        this.yearAccessSaving = false;
      });
  }

  /**
   * Fetches the current startYear/yearAccess/exemptableForms plus the design-year list (for the
   * startYear picker), then pre-fills the picker and checklist: startYear defaults to the earliest
   * currently-open design year when the ULB has none set yet (years[] is already sorted ascending
   * by the backend); the exemption checklist defaults to fully checked when there's no seed
   * yearAccess entry yet (a brand-new ULB structurally lacks prior-year data for these forms),
   * otherwise it reflects the existing seed entry's disabledFormIds.
   */
  private loadYearAccess(): void {
    this.yearAccessLoading = true;
    forkJoin({
      access: this.ulbMasterService.getYearAccess(this.data.ulb._id),
      years: this.http.get<unknown>(`${environment.api.url2}xvi-fc/years`),
    })
      .subscribe({
        next: ({ access, years }) => {
          const items = Array.isArray(years) ? years : ((years as { data?: YearItem[] })?.data ?? []);
          this.years = items as YearItem[];

          const { startYear, yearAccess, exemptableForms } = access.data;
          this.exemptableForms = exemptableForms;

          const matchedYear =
            startYear != null ? this.years.find((y) => this.startCalendarYear(y.year) === startYear) : undefined;
          const seedYear = matchedYear ?? this.years[0];
          this.selectedYearId = seedYear?._id ?? null;

          const seedEntry: IUlbYearAccessEntry | undefined = seedYear ? yearAccess[seedYear.year] : undefined;
          this.disabledFormIds = new Set(
            seedEntry ? seedEntry.disabledFormIds : exemptableForms.map((f) => f.formId),
          );
        },
        error: () => {
          this.yearAccessError = 'Unable to load year access.';
        },
      })
      .add(() => {
        this.yearAccessLoading = false;
      });
  }

  private startCalendarYear(label: string): number | null {
    const match = /^(\d{4})-\d{2}$/.exec(label);
    return match ? Number(match[1]) : null;
  }

  /** Surfaces the backend's actual rejection reason (e.g. "already has SLB data submitted for
   *  2026-27") instead of a generic failure message — same pattern xvi-fc-bank-account.component.ts
   *  uses for its own submit errors. */
  private extractErrorMessage(error: unknown): string | null {
    const message = (error as { error?: { message?: string | string[] } })?.error?.message;
    if (Array.isArray(message)) return message.join(' ');
    return message ?? null;
  }
}
