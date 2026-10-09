import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { DynamicFormComponent } from '../../../../shared/dynamic-form/dynamic-form.component';
import { DynamicFormService } from '../../../../shared/dynamic-form/dynamic-form.service';
import { UtilityService } from '../../../../core/services/utility.service';
import { ReviewAcknowledgmentComponent } from '../../shared/review-acknowledgment/review-acknowledgment.component';
import { XvifcBreadcrumbComponent, XvifcBreadcrumbLink } from '../../shared/breadcrumb/breadcrumb.component';
import { XvifcModuleService } from '../../xvi-fc-module.service';
import { PreLoaderComponent } from '../../../../shared/components/pre-loader/pre-loader.component';
import { AmountDisplayToggleComponent } from '../../../../shared/components/amount-display-toggle/amount-display-toggle.component';
import { AmountDisplayModeService } from '../../../../core/services/amount-display-mode.service';
import {
  ConditionalFieldConfig,
  DependencyIndex,
  DynamicFormVisibilityService,
} from '../../dynamic-form-visibility.service';
import { PmuReviewFormId, pmuFormOption, pmuStatusBadgeClass, pmuStatusLabel } from '../pmu-review.config';
import { FORM_STATUS } from '../../common/constants/form-status.constants';
import { PmuDevolutionRow, PmuFormReviewData } from '../pmu-review.models';
import { PmuFormReviewService } from '../pmu-form-review.service';
import { extractApiErrorResponse, extractFormLevelErrorMessage } from '../pmu-review.utils';

/**
 * One generic form-level PMU review detail, serving SFC Status / GTC / Devolution Formula — only
 * the route's `data.form` (and whether that form is installment-scoped) differ per form, never
 * this component's own code (Component-reuse architecture, Option C).
 */
@Component({
  selector: 'app-pmu-form-review-detail',
  standalone: true,
  imports: [
    DynamicFormComponent,
    ReviewAcknowledgmentComponent,
    XvifcBreadcrumbComponent,
    PreLoaderComponent,
    AmountDisplayToggleComponent,
  ],
  templateUrl: './pmu-form-review-detail.component.html',
  styleUrl: './pmu-form-review-detail.component.scss',
})
export class PmuFormReviewDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly dynamicFormService = inject(DynamicFormService);
  private readonly moduleService = inject(XvifcModuleService);
  private readonly reviewService = inject(PmuFormReviewService);
  private readonly utilityService = inject(UtilityService);
  private readonly visibilityService = inject(DynamicFormVisibilityService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly amountDisplay = inject(AmountDisplayModeService);
  /** Emitted right before each `bindVisibility()` rebuild so subscriptions bound to the previous
   *  `FormGroup` instance (after a mutation reload) are torn down cleanly — mirrors
   *  `SfcStatusComponent`'s own `formSubscriptionsTeardown$`. */
  private readonly formSubscriptionsTeardown$ = new Subject<void>();
  private dependencyIndex: DependencyIndex<ConditionalFieldConfig> = new Map();

  private readonly form = this.route.snapshot.data['form'] as PmuReviewFormId;
  private readonly stateId = this.route.snapshot.paramMap.get('stateId') ?? '';
  private readonly installment = this.route.snapshot.paramMap.get('installment');

  readonly formOption = pmuFormOption(this.form);

  readonly breadcrumbLinks = computed<XvifcBreadcrumbLink[]>(() => [
    {
      label: 'Review State Submissions',
      routerLink: ['/xvifc', this.moduleService.yearId(), 'review-state-submissions'],
      queryParams: { ...this.route.snapshot.queryParams, form: this.form },
    },
    { label: this.formOption.label },
  ]);

  readonly review = signal<PmuFormReviewData | null>(null);
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly isApproving = signal(false);
  readonly isRejecting = signal(false);
  /** Set when approve/reject fails — distinct from `loadError`, which blocks the whole page on the
   *  initial GET and would hide the very form/actions the user needs to retry or fix. Cleared at
   *  the start of the next attempt. */
  readonly mutationError = signal<string | null>(null);

  /** Writable (not `computed`) — `bindVisibility()` calls `fieldsSignal.update(...)` to flip each
   *  field's `hidden` flag as `visibleWhen` conditions are evaluated against the live form. */
  readonly fields = signal<ConditionalFieldConfig[]>([]);
  /** Rebuilt whenever `review` loads/reloads — `DynamicFieldViewComponent` reads each field's value
   *  via `group.get(field.key)`, not off the `FieldConfig` object directly, so a `FormGroup` built
   *  before the async response arrives would render every field permanently blank. */
  readonly formGroup = signal<FormGroup>(this.dynamicFormService.toFormGroup([]));
  /** The only array templates should ever iterate — filters out fields whose `visibleWhen`
   *  conditions evaluate to false, mirroring every other real xvi-fc-module form (e.g.
   *  `SfcStatusComponent`'s own `visibleFields`). */
  readonly visibleFields = computed(() => this.visibilityService.getVisibleFields(this.fields()));

  readonly stateName = computed(() => this.review()?.stateName ?? 'Selected State');
  readonly statusLabel = computed(() => pmuStatusLabel(this.review()?.currentFormStatus ?? 0));
  readonly statusBadgeClass = computed(() => pmuStatusBadgeClass(this.review()?.currentFormStatus ?? 0));
  /** Only shown while the form is currently Returned — `pmuRemarks` itself is never cleared on
   *  approve (confirmed on the backend), so without this gate a stale reason from an earlier
   *  reject-then-resubmit-then-approve cycle would keep surfacing forever. */
  readonly rejectionRemarks = computed(() =>
    this.review()?.currentFormStatus === FORM_STATUS.RETURNED_BY_PMU ? (this.review()?.pmuRemarks ?? null) : null,
  );

  readonly canApprove = computed(() => this.review()?.permissions.canApproveForm ?? false);
  readonly canReject = computed(() => this.review()?.permissions.canRejectForm ?? false);
  readonly isBusy = computed(() => this.isApproving() || this.isRejecting());

  /** Only populated when `formOption.hasReadOnlyRows` (Devolution Formula today) — a read-only
   *  per-ULB allocation table shown in place of the (always-empty, for this form) `questions`
   *  field list, so PMU isn't approving/rejecting blind. Server-paginated — one page == one
   *  backend request, same convention as `request-exemption-list.component.ts`. */
  readonly rows = signal<PmuDevolutionRow[]>([]);
  readonly isLoadingRows = signal(false);
  readonly page = signal(1);
  readonly total = signal(0);
  readonly limit = 25;
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit)));
  readonly hasPrev = computed(() => this.page() > 1);
  readonly hasNext = computed(() => this.page() < this.totalPages());

  readonly formatAmount = (value: number | null | undefined) => this.amountDisplay.format(value, 'inr');
  readonly formatAmountExact = (value: number | null | undefined) => this.amountDisplay.formatExact(value);
  readonly unitSuffix = () => this.amountDisplay.unitSuffix('inr');

  constructor() {
    this.loadReview();
  }

  private loadReview(): void {
    const yearId = this.moduleService.yearId();
    if (!yearId) {
      this.loadError.set('Missing year context. Please navigate here from the PMU menu.');
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.loadError.set(null);

    this.reviewService
      .getReview(this.formOption, this.stateId, yearId, this.resolveInstallment())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.review.set(data);
          this.applyQuestions(data.questions ?? []);
          this.isLoading.set(false);
          if (this.formOption.hasReadOnlyRows) this.loadRows(yearId, 1);
        },
        error: (err: unknown) => {
          this.isLoading.set(false);
          const response = extractApiErrorResponse(err);
          this.loadError.set(response?.message ?? 'Unable to load the review data. Please try again.');
          this.utilityService.triggerSnackbar('Unable to load the review data.', 'snackbar-danger');
        },
      });
  }

  private loadRows(yearId: string, page: number): void {
    this.isLoadingRows.set(true);
    this.reviewService
      .getRows(this.formOption, this.stateId, yearId, this.resolveInstallment(), { page, limit: this.limit })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.rows.set(result.rows);
          this.page.set(result.page);
          this.total.set(result.total);
          this.isLoadingRows.set(false);
        },
        error: () => {
          this.isLoadingRows.set(false);
          this.utilityService.triggerSnackbar('Unable to load the ULB-wise allocation rows.', 'snackbar-danger');
        },
      });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.page() || this.isLoadingRows()) return;
    const yearId = this.moduleService.yearId();
    if (!yearId) return;
    this.loadRows(yearId, page);
  }

  /** Reloads metadata after a mutation — never locally patches status/remarks; the reloaded
   *  response is the only source of truth (mirrors mohua-module/fc-unspent-review's own discipline). */
  private reloadAfterMutation(): void {
    const yearId = this.moduleService.yearId();
    if (!yearId) return;

    this.reviewService
      .getReview(this.formOption, this.stateId, yearId, this.resolveInstallment())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.review.set(data);
          this.applyQuestions(data.questions ?? []);
        },
        error: () =>
          this.utilityService.triggerSnackbar('Review data may be stale — please reload the page.', 'snackbar-danger'),
      });
  }

  /** Rebuilds the form group + re-applies `visibleWhen` visibility for a freshly (re)loaded
   *  question set — tears down the previous load's visibility subscriptions first so they don't
   *  pile up across reloads (same reasoning as `SfcStatusComponent`'s own `formSubscriptionsTeardown$`). */
  private applyQuestions(questions: ConditionalFieldConfig[]): void {
    this.formSubscriptionsTeardown$.next();

    this.formGroup.set(this.dynamicFormService.toFormGroup(questions));
    this.fields.set(questions);

    this.dependencyIndex = this.visibilityService.createDependencyIndex(questions);
    this.visibilityService.bindVisibility({
      form: this.formGroup(),
      fieldsSignal: this.fields,
      dependencyIndex: this.dependencyIndex,
      destroyRef: this.destroyRef,
      preserveHiddenValue: true,
      formTeardown$: this.formSubscriptionsTeardown$,
    });
  }

  private resolveInstallment(): 1 | 2 | undefined {
    if (!this.formOption.installmentScoped) return undefined;
    const n = Number(this.installment);
    return n === 1 || n === 2 ? n : undefined;
  }

  onApprove(): void {
    if (!this.canApprove() || this.isBusy()) return;
    const yearId = this.moduleService.yearId();
    if (!yearId) return;

    this.mutationError.set(null);
    this.isApproving.set(true);
    this.reviewService
      .approveForm(this.formOption, this.stateId, yearId, this.resolveInstallment())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isApproving.set(false);
          this.utilityService.triggerSnackbar('Form approved.');
          this.reloadAfterMutation();
        },
        error: (err: unknown) => {
          this.isApproving.set(false);
          this.applyMutationError(err, 'Unable to approve the form. Please try again.');
        },
      });
  }

  onReject(remarks: string): void {
    if (!this.canReject() || this.isBusy()) return;
    const yearId = this.moduleService.yearId();
    if (!yearId) return;

    this.mutationError.set(null);
    this.isRejecting.set(true);
    this.reviewService
      .rejectForm(this.formOption, this.stateId, yearId, remarks, this.resolveInstallment())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isRejecting.set(false);
          this.utilityService.triggerSnackbar('Form rejected.', 'snackbar-danger');
          this.reloadAfterMutation();
        },
        error: (err: unknown) => {
          this.isRejecting.set(false);
          this.applyMutationError(err, 'Unable to reject the form. Please try again.');
        },
      });
  }

  /** Reads the `_form`-keyed error message off the response (falling back to the generic
   *  `message`) and surfaces it both as a persistent banner (`mutationError`, rendered above the
   *  actions so it survives past a toast's auto-dismiss) and a toast — see
   *  `extractFormLevelErrorMessage`'s own doc comment for why `_form` specifically was being lost
   *  before this fix. */
  private applyMutationError(err: unknown, fallbackMessage: string): void {
    const message = extractFormLevelErrorMessage(err, fallbackMessage);
    this.mutationError.set(message);
    this.utilityService.triggerSnackbar(message, 'snackbar-danger');
  }
}
