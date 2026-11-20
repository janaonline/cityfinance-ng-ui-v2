import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { REVIEW_REMARKS_MAX_LENGTH } from '../../../common/constants/review-remarks.constants';
import { joinWithAnd } from '../../../common/utils/xvi-fc-text.utils';
import type {
  ClaimLetterReturnableStateForm,
  ClaimLetterSoDecision,
  ClaimLetterUlbExemption,
} from '../claims-submission.models';

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
const EXEMPTION_REJECTED = 6;
const EXEMPTION_APPROVED = 7;

/** A State form the letter took as exempted through the State's own request, still under review: ticking it rejects it. */
const REJECT_STATE_EXEMPTION_NOTE: StateFormLock = {
  tag: 'Reject exemption',
  reason:
    'The State asked to be exempted from this form, and this letter relies on that request, which is still under ' +
    'review. Ticking this rejects the request; the State must then file the form.',
};
const EXEMPTION_STATUS_TEXT: Readonly<Record<number, string>> = {
  5: 'exemption under review',
  6: 'exemption rejected',
  7: 'exemption approved',
};

/** A State item the SO can't tick: the short tag beside it and the reason its (i) icon shows. */
export interface StateFormLock {
  tag: string;
  reason: string;
}

function lockFor(form: ClaimLetterReturnableStateForm): StateFormLock {
  switch (form.lockReason) {
    case 'ACCEPTED':
      return {
        tag: 'Accepted',
        reason: form.acceptedWithLetter
          ? `Accepted when ${form.acceptedWithLetter} was approved. It is settled for this installment and can no longer be returned.`
          : 'Already accepted by MoHUA for this installment, so it can no longer be returned.',
      };
    case 'EXEMPTED':
      // The State's own request, already decided: say how, since the SO can no longer act on it here.
      if (form.exemptionStatus === EXEMPTION_APPROVED) {
        return {
          tag: 'Exemption approved',
          reason: "MoHUA approved the State's exemption for this form, so there is no form to return.",
        };
      }
      if (form.exemptionStatus === EXEMPTION_REJECTED) {
        return {
          tag: 'Exemption rejected',
          reason:
            "MoHUA already rejected the State's exemption for this form, so there is nothing left to return here.",
        };
      }
      return {
        tag: 'Exempted',
        reason: "This letter relies on the State's exemption for this form, so there is no form to return.",
      };
    default:
      return {
        tag: 'Not in review',
        reason: "This form is not under review with this letter, so it can't be returned here.",
      };
  }
}

export function exemptionFormLabel(formId: number): string {
  return EXEMPTION_FORM_LABELS[formId] ?? `Form ${formId}`;
}

/**
 * `ulb`: mark one ULB returned (its forms, its rows, a remark); an "Eligible via exemption" ULB (`exemptions` not
 * empty) instead lists only its exemptions, to be rejected. `letter`: return the whole letter.
 */
export type ReturnClaimLetterDialogData =
  | { mode: 'ulb'; ulbName: string; decision: ClaimLetterSoDecision | null; exemptions: ClaimLetterUlbExemption[] }
  | {
      mode: 'letter';
      returnedUlbCount: number;
      /** Marked ULBs with a State-form row picked: each reopens that whole form for the State. */
      returnedRowUlbCount: number;
      stateForms: ClaimLetterReturnableStateForm[];
      /** The State's other letters under SO review: returned too when this return reopens a State form. */
      otherLetters: { id: string; number: string }[];
    };

export interface ReturnUlbDialogResult {
  ulbFormIds: number[];
  rowFormIds: number[];
  rejectExemptionFormIds: number[];
  remark: string;
}

export interface ReturnLetterDialogResult {
  stateFormIds: number[];
  stateRemark: string;
  /** The letters the dialog said this return also returns; the API refuses if they changed meanwhile. */
  affectedLetterIds: string[];
}

export type ReturnClaimLetterDialogResult = ReturnUlbDialogResult | ReturnLetterDialogResult;

/** Every return says why: at least this many characters once trimmed (the API enforces the same). */
export const RETURN_REMARK_MIN_LENGTH = 10;

/**
 * The SO's return choices. In `ulb` mode it marks one ULB returned with its own forms, rows and remark (prefilled from
 * an earlier mark); in `letter` mode it returns the letter with the State-wide items, the marked ULBs going with it.
 * Closes with the choices on confirm and `undefined` on cancel; the caller saves them.
 */
@Component({
  selector: 'app-mohua-return-claim-letter-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatTooltipModule],
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
  readonly remarksMinLength = RETURN_REMARK_MIN_LENGTH;

  private readonly previous =
    this.data.mode === 'ulb' && this.data.decision?.status === 'RETURNED' ? this.data.decision : null;

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
  private readonly otherLetters = this.data.mode === 'letter' ? this.data.otherLetters : [];

  /** SFC / GTC that can't be returned with this letter: shown with a short tag, the full reason in a tooltip. */
  private readonly lockedStateForms = new Map(
    (this.data.mode === 'letter' ? this.data.stateForms : [])
      .filter((form) => !form.returnable)
      .map((form) => [form.formId, lockFor(form)]),
  );

  /** Why a State item cannot be ticked, or null when it can. */
  stateFormLock(formId: number): StateFormLock | null {
    return this.lockedStateForms.get(formId) ?? null;
  }

  /** State items whose tick rejects the State's own exemption request rather than reopening a form. */
  private readonly exemptionStateFormIds = new Set(
    (this.data.mode === 'letter' ? this.data.stateForms : []).filter((f) => f.rejectsExemption).map((f) => f.formId),
  );

  /** The tag and reason beside a State item whose tick rejects the State's exemption; null otherwise. */
  stateFormExemptionNote(formId: number): StateFormLock | null {
    return this.exemptionStateFormIds.has(formId) ? REJECT_STATE_EXEMPTION_NOTE : null;
  }

  /** How a picked State item reads in the outcome and the cascade warning. */
  private stateFormPhrase(option: ReturnFormOption): string {
    return this.exemptionStateFormIds.has(option.formId) ? `${option.label} (its exemption is rejected)` : option.label;
  }

  /** Before confirming: a return that reopens a State form also returns the State's other letters under review. */
  readonly cascadeWarning = computed<string | null>(() => {
    if (this.data.mode !== 'letter' || !this.otherLetters.length) return null;
    const forms = this.stateFormOptions
      .filter((o) => o.formId !== CLAIM_LETTER_FORM_ID && this.selected().has(o.formId))
      .map((o) => this.stateFormPhrase(o));
    if (this.data.returnedRowUlbCount) forms.push('the State forms of the ULB rows marked for return');
    if (!forms.length) return null;
    const letters = this.otherLetters.map((l) => l.number);
    const many = letters.length > 1;
    // "the State forms of the ULB rows..." is plural on its own.
    const formsWord = forms.length > 1 || this.data.returnedRowUlbCount ? 'them' : 'it';
    return (
      `Returning ${joinWithAnd(forms)} reopens ${formsWord} for the State. ` +
      `${many ? 'Claim letters' : 'Claim letter'} ${joinWithAnd(letters)} of this State ${many ? 'are' : 'is'} also ` +
      `under review and rel${many ? 'y' : 'ies'} on ${formsWord}, so ${many ? 'they' : 'it'} ` +
      `will be returned too. The State must correct ${formsWord} and submit again.`
    );
  });

  /** Every return needs a remark of at least `RETURN_REMARK_MIN_LENGTH` characters, in all three modes. */
  private readonly remarkValue = signal(this.remark.value);
  readonly hasSelection = computed(() => this.selected().size > 0 || this.returnedUlbCount > 0);
  readonly remarkTooShort = computed(() => this.remarkValue().trim().length < RETURN_REMARK_MIN_LENGTH);

  readonly canConfirm = computed(() => this.hasSelection() && !this.remarkTooShort());

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
    const picked = this.stateFormOptions.filter(
      (o) => this.selected().has(o.formId) && o.formId !== CLAIM_LETTER_FORM_ID,
    );
    const stateForms = picked.filter((o) => !this.exemptionStateFormIds.has(o.formId)).map((o) => o.label);
    if (stateForms.length) {
      parts.push(`${stateForms.join(', ')} reopen${stateForms.length === 1 ? 's' : ''} for the State.`);
    }
    const exempted = picked.filter((o) => this.exemptionStateFormIds.has(o.formId)).map((o) => o.label);
    if (exempted.length) {
      parts.push(
        `The State's exemption for ${joinWithAnd(exempted)} is rejected; the State must file ` +
          `${exempted.length === 1 ? 'it' : 'them'}.`,
      );
    }
    parts.push('The claim letter closes; the State prepares a new one once the corrections are approved.');
    return parts.join(' ');
  });

  isSelected(formId: number): boolean {
    return this.selected().has(formId);
  }

  toggle(formId: number): void {
    if (this.stateFormLock(formId) && !this.selected().has(formId)) return;
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
        : {
            stateFormIds: picked(this.stateFormOptions),
            stateRemark: remark,
            // Only the letters the SO was warned about: a return that would reach others unannounced is a 409.
            affectedLetterIds: this.cascadeWarning() ? this.otherLetters.map((l) => l.id) : [],
          },
    );
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}
