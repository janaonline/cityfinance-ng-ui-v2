import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

// ─── Status constant ─────────────────────────────────────────────────────────

/** Numeric status values shared across all XVI-FC form types. */
export const FORM_STATUS = {
  NO_STATUS: 0,
  NOT_STARTED: 1,
  IN_PROGRESS: 2,
  UNDER_REVIEW_BY_STATE: 3,
  RETURNED_BY_STATE: 4,
  UNDER_REVIEW_BY_MOHUA: 5,
  RETURNED_BY_MOHUA: 6,
  SUBMISSION_ACKNOWLEDGED_BY_MOHUA: 7,
} as const;

// ─── Public API types ─────────────────────────────────────────────────────────

/** Determines which lifecycle steps and status labels the form-progress component renders. */
export type FormType = 'state' | 'ulb';

/** Union of all numeric form-status values from {@link FORM_STATUS}. */
export type FormStatusValue = (typeof FORM_STATUS)[keyof typeof FORM_STATUS];

/** Color tone applied to the status pill and stepper via BEM modifier classes. */
export type StatusTone = 'primary' | 'tertiary' | 'error';

/** Visual state of a single stepper step: `done` = completed, `active` = current, `inactive` = future/pending, `error` = rejected. */
export type StepState = 'done' | 'active' | 'inactive' | 'error';

/** A single lifecycle step rendered in the form-progress stepper. */
export interface FormStatusStep {
  readonly label: string;
  readonly state: StepState;
}

/** Audit actor record shown in the bottom section of the form-progress card. */
export interface FormActor {
  readonly action: string;
  readonly by: string;
  readonly designation: string;
  readonly date: string | Date;
}

// ─── Step atom constants ──────────────────────────────────────────────────────

const NS_ACTIVE: FormStatusStep = { label: 'Not Started', state: 'active' };
const NS_DONE: FormStatusStep = { label: 'Not Started', state: 'done' };
const IP_ACTIVE: FormStatusStep = { label: 'In Progress', state: 'active' };
const IP_DONE: FormStatusStep = { label: 'In Progress', state: 'done' };
// State form atoms
// const MOHUA_SUBMIT_ACTIVE: FormStatusStep = { label: 'Submitted to MoHUA', state: 'active' };
const MOHUA_SUBMIT_DONE: FormStatusStep = { label: 'Submitted to MoHUA', state: 'done' };
const MOHUA_ACKNOWLEDGED: FormStatusStep = { label: 'Acknowledged by MoHUA', state: 'done' };
const MOHUA_REJECTED: FormStatusStep = { label: 'Returned by MoHUA', state: 'error' };
// Inactive (future/pending) atoms
const IP_INACTIVE: FormStatusStep = { label: 'In Progress', state: 'inactive' };
const MOHUA_SUBMIT_INACTIVE: FormStatusStep = { label: 'Submitted to MoHUA', state: 'inactive' };
const MOHUA_ACKNOWLEDGED_INACTIVE: FormStatusStep = { label: 'Acknowledged by MoHUA', state: 'inactive' };
const STATE_SUBMIT_INACTIVE: FormStatusStep = { label: 'Submitted to State', state: 'inactive' };
const STATE_APPROVED_INACTIVE: FormStatusStep = { label: 'Approved by State', state: 'inactive' };
const MOHUA_APPROVED_INACTIVE: FormStatusStep = { label: 'Approved by MoHUA', state: 'inactive' };
// ULB form atoms
const STATE_SUBMIT_ACTIVE: FormStatusStep = { label: 'Submitted to State', state: 'active' };
const STATE_SUBMIT_DONE: FormStatusStep = { label: 'Submitted to State', state: 'done' };
const STATE_APPROVED_ACTIVE: FormStatusStep = { label: 'Approved by State', state: 'active' };
const STATE_APPROVED_DONE: FormStatusStep = { label: 'Approved by State', state: 'done' };
const STATE_REJECTED: FormStatusStep = { label: 'Returned by State', state: 'error' };
const MOHUA_APPROVED: FormStatusStep = { label: 'Approved by MoHUA', state: 'done' };

/** Maps each numeric status to the pill color tone. */
const STATUS_TONE_MAP: Readonly<Record<FormStatusValue, StatusTone>> = {
  0: 'tertiary',
  1: 'tertiary',
  2: 'tertiary',
  3: 'primary',
  4: 'error',
  5: 'primary',
  6: 'error',
  7: 'primary',
};

/** Human-readable status pill labels for State forms. */
const STATE_STATUS_LABEL: Readonly<Record<FormStatusValue, string>> = {
  0: 'Not Started',
  1: 'Not Started',
  2: 'In Progress',
  3: 'In Progress',
  4: 'In Progress',
  5: 'Under Review by MoHUA',
  6: 'Returned by MoHUA',
  7: 'Acknowledged by MoHUA',
};

/** Human-readable status pill labels for ULB forms. */
const ULB_STATUS_LABEL: Readonly<Record<FormStatusValue, string>> = {
  0: 'Not Started',
  1: 'Not Started',
  2: 'In Progress',
  3: 'Under Review by State',
  4: 'Returned by State',
  5: 'Approved by State',
  6: 'Returned by MoHUA',
  7: 'Approved by MoHUA',
};

/**
 * Ordered stepper steps for each numeric status on State forms.
 * Statuses 3 and 4 are not part of the state workflow; they defensively fall back to In Progress.
 */
const STATE_FORM_STEPS: Readonly<Record<FormStatusValue, readonly FormStatusStep[]>> = {
  0: [NS_ACTIVE, IP_INACTIVE, MOHUA_SUBMIT_INACTIVE],
  1: [NS_ACTIVE, IP_INACTIVE, MOHUA_SUBMIT_INACTIVE],
  2: [NS_DONE, IP_ACTIVE, MOHUA_SUBMIT_INACTIVE],
  3: [NS_DONE, IP_ACTIVE, MOHUA_SUBMIT_INACTIVE], // Status not possible
  4: [NS_DONE, IP_ACTIVE, MOHUA_SUBMIT_INACTIVE], // Status not possible
  5: [NS_DONE, IP_DONE, MOHUA_SUBMIT_DONE, MOHUA_ACKNOWLEDGED_INACTIVE],
  6: [NS_DONE, IP_DONE, MOHUA_SUBMIT_DONE, MOHUA_REJECTED],
  7: [NS_DONE, IP_DONE, MOHUA_SUBMIT_DONE, MOHUA_ACKNOWLEDGED],
};

/** Ordered stepper steps for each numeric status on ULB forms. */
const ULB_FORM_STEPS: Readonly<Record<FormStatusValue, readonly FormStatusStep[]>> = {
  0: [NS_ACTIVE, IP_INACTIVE, STATE_SUBMIT_INACTIVE],
  1: [NS_ACTIVE, IP_INACTIVE, STATE_SUBMIT_INACTIVE],
  2: [NS_DONE, IP_ACTIVE, STATE_SUBMIT_INACTIVE],
  3: [NS_DONE, IP_DONE, STATE_SUBMIT_ACTIVE, STATE_APPROVED_INACTIVE],
  4: [NS_DONE, IP_DONE, STATE_SUBMIT_DONE, STATE_REJECTED],
  5: [NS_DONE, IP_DONE, STATE_SUBMIT_DONE, STATE_APPROVED_ACTIVE, MOHUA_APPROVED_INACTIVE],
  6: [NS_DONE, IP_DONE, STATE_SUBMIT_DONE, STATE_APPROVED_DONE, MOHUA_REJECTED],
  7: [NS_DONE, IP_DONE, STATE_SUBMIT_DONE, STATE_APPROVED_DONE, MOHUA_APPROVED],
};

// ─── Pure helper functions ────────────────────────────────────────────────────

/**
 * Returns the {@link StatusTone} for the given form status.
 *
 * @param status - Numeric form status from {@link FORM_STATUS}.
 * @returns Color tone for the status pill: `'primary'`, `'tertiary'`, or `'error'`.
 */
function getFormStatusTone(status: FormStatusValue): StatusTone {
  return STATUS_TONE_MAP[status] ?? 'tertiary';
}

/**
 * Returns the ordered list of {@link FormStatusStep}s for the given form type and status.
 * Resolution is O(1) via precomputed {@link Record} maps.
 *
 * @param formType - `'state'` or `'ulb'`.
 * @param status - Numeric form status from {@link FORM_STATUS}.
 * @returns Immutable array of lifecycle steps with their visual state.
 */
function getFormStatusSteps(formType: FormType, status: FormStatusValue): readonly FormStatusStep[] {
  const map = formType === 'state' ? STATE_FORM_STEPS : ULB_FORM_STEPS;
  return map[status] ?? [NS_ACTIVE];
}

/**
 * Returns the human-readable status label for the pill.
 * The label differs per form type: e.g. status 5 is `'Under Review by MoHUA'` for State
 * but `'Approved by State'` for ULB.
 *
 * @param formType - `'state'` or `'ulb'`.
 * @param status - Numeric form status from {@link FORM_STATUS}.
 * @returns Display label for the status pill.
 */
function getCurrentStatusLabel(formType: FormType, status: FormStatusValue): string {
  const map = formType === 'state' ? STATE_STATUS_LABEL : ULB_STATUS_LABEL;
  return map[status] ?? 'Not Started';
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Displays the current form lifecycle status as a pill + stepper,
 * and an optional audit-actor trail in a Bootstrap card.
 *
 * @example
 * <app-form-progress
 *   formType="ulb"
 *   [formStatus]="FORM_STATUS.UNDER_REVIEW_BY_MOHUA"
 *   [actors]="actors">
 * </app-form-progress>
 */
@Component({
  selector: 'app-form-progress',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, DatePipe, MatIconModule, MatTooltipModule],
  template: `
    <section class="card border-0 shadow-sm rounded-4 overflow-hidden">
      <!-- Status pill + stepper -->
      <div class="card-body border-bottom bg-light-subtle p-3">
        <div class="d-flex flex-column flex-md-row justify-content-between gap-3">
          <!-- Pill -->
          <div>
            <small class="text-uppercase text-muted fw-bold">Current Form Status</small>
            <div class="mt-1">
              <span class="badge rounded-pill px-3 py-2" [ngClass]="'form-progress__pill--' + statusTone()">
                <span class="form-progress__dot me-2"></span>
                {{ statusLabel() }}
              </span>
            </div>
          </div>

          <!-- Stepper -->
          <div class="flex-grow-1">
            <div class="d-flex align-items-start">
              @for (step of steps(); track $index; let i = $index, last = $last) {
                <div class="form-progress__step-wrapper text-center flex-fill">
                  <div
                    class="form-progress__circle mx-auto"
                    [ngClass]="[
                      'form-progress__step--' + step.state,
                      step.state === 'active' ? 'form-progress__step--active-' + statusTone() : '',
                    ]"
                  >
                    @if (step.state === 'done') {
                      <mat-icon>check</mat-icon>
                    } @else if (step.state === 'error') {
                      <mat-icon>close</mat-icon>
                    } @else {
                      {{ i + 1 }}
                    }
                  </div>
                  <small
                    class="d-block mt-1 form-progress__step-label"
                    [ngClass]="[
                      'form-progress__step-label--' + step.state,
                      step.state === 'active' ? 'form-progress__step-label--active-' + statusTone() : '',
                    ]"
                    >{{ step.label }}</small
                  >
                </div>
                @if (!last) {
                  <div
                    class="form-progress__connector mt-3"
                    [class.form-progress__connector--primary]="
                      step.state === 'done' &&
                      steps()[i + 1].state !== 'inactive' &&
                      steps()[i + 1].state !== 'error' &&
                      steps()[i + 1].state !== 'active'
                    "
                    [class.form-progress__connector--active-primary]="
                      steps()[i + 1].state === 'active' && statusTone() === 'primary'
                    "
                    [class.form-progress__connector--active-tertiary]="
                      steps()[i + 1].state === 'active' && statusTone() === 'tertiary'
                    "
                    [class.form-progress__connector--active-error]="
                      steps()[i + 1].state === 'active' && statusTone() === 'error'
                    "
                    [class.form-progress__connector--error]="steps()[i + 1].state === 'error'"
                  ></div>
                }
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Audit actors -->
      @if (actors().length) {
        <div class="card-body p-0">
          <div class="row g-0">
            @for (actor of actors(); track actor.action) {
              @if (actor.by) {
                <div class="col-12 col-md border-end form-progress__audit-item p-3">
                  <div class="d-flex align-items-center gap-2 mb-1">
                    <mat-icon class="form-progress__audit-icon">person</mat-icon>
                    <small class="text-uppercase fw-bold text-muted">{{ actor.action }}</small>
                    <small class="ms-auto text-muted" [matTooltip]="(actor.date | date: 'medium') ?? ''">{{
                      actor.date | date: 'dd MMM yyyy'
                    }}</small>
                  </div>
                  <div class="fw-bold">{{ actor.by || '-' }}</div>
                  <small class=" text-muted">{{ actor.designation }}</small>
                </div>
              }
            }
          </div>
        </div>
      }
    </section>
  `,
  styles: [
    `
      .form-progress__dot {
        display: inline-block;
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 50%;
        vertical-align: middle;
        background: currentColor;
        box-shadow: 0 0 0 0.2rem color-mix(in srgb, currentColor 20%, transparent);
      }

      .form-progress__pill--primary {
        background-color: var(--mat-sys-primary-container);
        color: var(--mat-sys-on-primary-container);
      }

      .form-progress__pill--tertiary {
        background-color: var(--mat-sys-tertiary-container);
        color: var(--mat-sys-on-tertiary-container);
      }

      .form-progress__pill--error {
        background-color: var(--mat-sys-error-container);
        color: var(--mat-sys-on-error-container);
      }

      .form-progress__circle {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        border: 2px solid var(--mat-sys-outline-variant);
        background: transparent;
        color: var(--mat-sys-outline-variant);
        font-size: 12px;
        font-weight: 700;
      }

      .form-progress__circle mat-icon {
        width: 12px;
        height: 12px;
        font-size: 12px;
        line-height: 12px;
      }

      .form-progress__step--done {
        background: var(--mat-sys-primary);
        border-color: var(--mat-sys-primary);
        color: var(--mat-sys-on-primary);
      }

      .form-progress__step--active-primary {
        background: var(--mat-sys-primary-container);
        border-color: var(--mat-sys-primary);
        color: var(--mat-sys-on-primary-container);
      }

      .form-progress__step--active-tertiary {
        background: var(--mat-sys-tertiary-container);
        border-color: var(--mat-sys-tertiary);
        color: var(--mat-sys-on-tertiary-container);
      }

      .form-progress__step--active-error {
        background: var(--mat-sys-error-container);
        border-color: var(--mat-sys-error);
        color: var(--mat-sys-on-error-container);
      }

      .form-progress__step--inactive {
        background: var(--mat-sys-surface-container-highest);
        border-color: var(--mat-sys-outline-variant);
        color: var(--mat-sys-on-surface-variant);
      }

      .form-progress__step--error {
        background: var(--mat-sys-error);
        border-color: var(--mat-sys-error);
        color: var(--mat-sys-on-error);
      }

      .form-progress__step-label--done {
        color: var(--mat-sys-primary);
        font-weight: 700;
      }

      .form-progress__step-label--active {
        font-weight: 800;
      }

      .form-progress__step-label--active-primary {
        color: var(--mat-sys-primary);
      }

      .form-progress__step-label--active-tertiary {
        color: var(--mat-sys-tertiary);
      }

      .form-progress__step-label--active-error {
        color: var(--mat-sys-error);
      }

      .form-progress__step-label--inactive {
        color: var(--mat-sys-on-surface-variant);
        font-weight: 600;
      }

      .form-progress__step-label--error {
        color: var(--mat-sys-error);
        font-weight: 800;
      }

      .form-progress__connector {
        height: 2px;
        min-width: 32px;
        background: var(--mat-sys-outline-variant);
        flex: 0.5;
      }

      .form-progress__connector--primary,
      .form-progress__connector--active-primary {
        background: var(--mat-sys-primary);
      }

      .form-progress__connector--active-tertiary {
        background: var(--mat-sys-tertiary);
      }

      .form-progress__connector--active-error,
      .form-progress__connector--error {
        background: var(--mat-sys-error);
      }

      .form-progress__audit-icon {
        width: 18px;
        height: 18px;
        font-size: 18px;
        color: var(--mat-sys-primary);
      }

      .form-progress__audit-item:last-child {
        border-right: 0 !important;
      }

      @media (max-width: 767px) {
        .form-progress__step-wrapper small {
          font-size: 10px;
        }

        .form-progress__connector {
          min-width: 12px;
        }
      }
    `,
  ],
})
export class FormProgressComponent {
  /** Form type: drives which lifecycle steps and status labels to display. */
  readonly formType = input.required<FormType>();

  /** Numeric form status from {@link FORM_STATUS}: drives the pill tone and stepper state. */
  readonly formStatus = input.required<FormStatusValue>();

  /** Audit trail entries rendered in the bottom section of the card. Defaults to an empty list. */
  readonly actors = input<readonly FormActor[]>([]);

  /** Human-readable label for the status pill; recomputed when inputs change. */
  readonly statusLabel = computed(() => getCurrentStatusLabel(this.formType(), this.formStatus()));

  /** Color tone modifier for the status pill; recomputed when inputs change. */
  readonly statusTone = computed(() => getFormStatusTone(this.formStatus()));

  /** Ordered stepper steps for the current form type and status; recomputed when inputs change. */
  readonly steps = computed(() => getFormStatusSteps(this.formType(), this.formStatus()));
}
