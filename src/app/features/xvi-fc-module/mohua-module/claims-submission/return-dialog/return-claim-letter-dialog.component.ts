import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { REVIEW_REMARKS_MAX_LENGTH } from '../../../common/constants/review-remarks.constants';
import type { ClaimLetterSoDecision, ClaimLetterUlbExemption } from '../claims-submission.models';

export interface ReturnFormOption {
  /** The form's id in the formjson registry. */
  formId: number;
  label: string;
}

/** A ULB's own forms the SO can return for it. */
export const RETURN_ULB_FORM_OPTIONS: readonly ReturnFormOption[] = [
  { formId: 30, label: 'Audited Statements' },
  { formId: 31, label: 'Provisional Statements' },
  { formId: 33, label: 'PFMS Bank Account' },
  { formId: 32, label: 'Service Level Benchmarks' },
  { formId: 36, label: 'Detailed Utilisation Report' },
];

/** State forms with a row per ULB: returned per ULB, reopening only that ULB's row. */
export const RETURN_ROW_FORM_OPTIONS: readonly ReturnFormOption[] = [
  { formId: 23, label: 'Elected Bodies' },
  { formId: 24, label: 'Devolution' },
  { formId: 25, label: 'FC Unspent Disclosure' },
];

export const RETURN_ROW_FORM_IDS: readonly number[] = RETURN_ROW_FORM_OPTIONS.map((o) => o.formId);

/** State-wide items returned with the letter: the claim letter itself (a remark only), SFC and GTC. */
export const RETURN_STATE_FORM_OPTIONS: readonly ReturnFormOption[] = [
  { formId: 26, label: 'Claim Letter' },
  { formId: 22, label: 'SFC Status' },
  { formId: 35, label: 'Grant Transfer Certificate' },
];

const CLAIM_LETTER_FORM_ID = 26;

/** Forms a ULB can hold a discretionary exemption for (request-exemption's formId registry). */
const EXEMPTION_FORM_LABELS: Readonly<Record<number, string>> = {
  23: 'Elected Bodies',
  30: 'Audited Statements',
  31: 'Provisional Statements',
};

const EXEMPTION_UNDER_REVIEW = 5;
const EXEMPTION_STATUS_TEXT: Readonly<Record<number, string>> = {
  5: 'exemption under review',
  6: 'exemption rejected',
  7: 'exemption approved',
};

export function exemptionFormLabel(formId: number): string {
  return EXEMPTION_FORM_LABELS[formId] ?? `Form ${formId}`;
}

/**
 * `ulb`: mark one ULB returned (its forms, its rows, a remark); an "Eligible via exemption" ULB (`exemptions` not
 * empty) instead lists only its exemptions, to be rejected. `letter`: return the whole letter.
 */
export type ReturnClaimLetterDialogData =
  | { mode: 'ulb'; ulbName: string; decision: ClaimLetterSoDecision | null; exemptions: ClaimLetterUlbExemption[] }
  | { mode: 'letter'; returnedUlbCount: number };

export interface ReturnUlbDialogResult {
  ulbFormIds: number[];
  rowFormIds: number[];
  rejectExemptionFormIds: number[];
  remark: string;
}

export interface ReturnLetterDialogResult {
  stateFormIds: number[];
  stateRemark: string;
}

export type ReturnClaimLetterDialogResult = ReturnUlbDialogResult | ReturnLetterDialogResult;

/**
 * The SO's return choices. In `ulb` mode it marks one ULB returned with its own forms, rows and remark (prefilled from
 * an earlier mark); in `letter` mode it returns the letter with the State-wide items, the marked ULBs going with it.
 * Closes with the choices on confirm and `undefined` on cancel; the caller saves them.
 */
@Component({
  selector: 'app-mohua-return-claim-letter-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './return-claim-letter-dialog.component.html',
  styleUrl: './return-claim-letter-dialog.component.scss',
})
export class ReturnClaimLetterDialogComponent {
  private readonly dialogRef =
    inject<MatDialogRef<ReturnClaimLetterDialogComponent, ReturnClaimLetterDialogResult | undefined>>(MatDialogRef);
  readonly data = inject<ReturnClaimLetterDialogData>(MAT_DIALOG_DATA);

  readonly ulbFormOptions = RETURN_ULB_FORM_OPTIONS;
  readonly rowFormOptions = RETURN_ROW_FORM_OPTIONS;
  readonly stateFormOptions = RETURN_STATE_FORM_OPTIONS;
  readonly remarksMaxLength = REVIEW_REMARKS_MAX_LENGTH;

  private readonly previous = this.data.mode === 'ulb' && this.data.decision?.status === 'RETURNED' ? this.data.decision : null;

  /** An "Eligible via exemption" ULB: only its exemptions are listed, and only those under review can be ticked. */
  readonly exemptionOptions =
    this.data.mode === 'ulb'
      ? this.data.exemptions.map((e) => ({
          formId: e.formId,
          label: exemptionFormLabel(e.formId),
          statusText: EXEMPTION_STATUS_TEXT[e.status] ?? 'exemption decided',
          decidable: e.status === EXEMPTION_UNDER_REVIEW,
        }))
      : [];
  readonly exemptionMode = this.exemptionOptions.length > 0;
  readonly nothingDecidable = this.exemptionMode && !this.exemptionOptions.some((o) => o.decidable);

  readonly remark = new FormControl(this.previous?.remark ?? '', {
    nonNullable: true,
    validators: [Validators.maxLength(REVIEW_REMARKS_MAX_LENGTH)],
  });

  private readonly selected = signal<ReadonlySet<number>>(
    new Set(
      this.exemptionMode
        ? (this.previous?.rejectExemptionFormIds ?? [])
        : [...(this.previous?.ulbFormIds ?? []), ...(this.previous?.rowFormIds ?? [])],
    ),
  );

  private readonly returnedUlbCount = this.data.mode === 'letter' ? this.data.returnedUlbCount : 0;

  /** Rejecting an exemption needs a remark (the exemption review requires one). */
  private readonly remarkValue = signal(this.remark.value);
  readonly remarkRequired = this.exemptionMode;

  readonly canConfirm = computed(
    () =>
      (this.selected().size > 0 || this.returnedUlbCount > 0) &&
      (!this.remarkRequired || this.remarkValue().trim().length > 0),
  );

  constructor() {
    this.remark.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => this.remarkValue.set(value));
  }

  /** Letter mode: what the return will do, in plain words, so the SO sees the outcome before confirming. */
  readonly outcome = computed(() => {
    const parts: string[] = [];
    if (this.returnedUlbCount) {
      parts.push(`${this.returnedUlbCount} ULB(s) marked returned reopen with the forms and remarks picked for each.`);
    }
    // The claim letter (26) carries a remark only; it closes either way.
    const stateForms = this.stateFormOptions
      .filter((o) => this.selected().has(o.formId) && o.formId !== CLAIM_LETTER_FORM_ID)
      .map((o) => o.label);
    if (stateForms.length) {
      parts.push(`${stateForms.join(', ')} reopen${stateForms.length === 1 ? 's' : ''} for the State.`);
    }
    parts.push('The claim letter closes; the State prepares a new one once the corrections are approved.');
    return parts.join(' ');
  });

  isSelected(formId: number): boolean {
    return this.selected().has(formId);
  }

  toggle(formId: number): void {
    const next = new Set(this.selected());
    if (!next.delete(formId)) next.add(formId);
    this.selected.set(next);
  }

  confirm(): void {
    if (!this.canConfirm() || this.remark.invalid) return;
    const picked = (options: readonly ReturnFormOption[]) =>
      options.filter((o) => this.selected().has(o.formId)).map((o) => o.formId);
    const remark = this.remark.value.trim();
    this.dialogRef.close(
      this.data.mode === 'ulb'
        ? this.exemptionMode
          ? { ulbFormIds: [], rowFormIds: [], rejectExemptionFormIds: [...this.selected()], remark }
          : {
              ulbFormIds: picked(this.ulbFormOptions),
              rowFormIds: picked(this.rowFormOptions),
              rejectExemptionFormIds: [],
              remark,
            }
        : { stateFormIds: picked(this.stateFormOptions), stateRemark: remark },
    );
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}
