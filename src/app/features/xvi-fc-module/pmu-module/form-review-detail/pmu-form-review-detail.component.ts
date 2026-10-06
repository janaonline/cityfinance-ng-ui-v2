import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { DynamicFormComponent } from '../../../../shared/dynamic-form/dynamic-form.component';
import { DynamicFormService } from '../../../../shared/dynamic-form/dynamic-form.service';
import { ReviewAcknowledgmentComponent } from '../../shared/review-acknowledgment/review-acknowledgment.component';
import { XvifcBreadcrumbComponent, XvifcBreadcrumbLink } from '../../shared/breadcrumb/breadcrumb.component';
import { XvifcModuleService } from '../../xvi-fc-module.service';
import { PreLoaderComponent } from '../../../../shared/components/pre-loader/pre-loader.component';
import {
  findReviewRow,
  formLevelQuestionsFor,
  PMU_REVIEW_STATUS_BADGE_CLASS,
  PmuReviewFormId,
  PmuReviewStatus,
  pmuFormOption,
} from '../pmu-review.dummy-data';

/**
 * One generic form-level PMU review detail, serving SFC Status / GTC / Devolution Formula — only
 * the route's `data.form` and the dummy question set differ per form, never this component's own
 * code (Component-reuse architecture, Option C).
 */
@Component({
  selector: 'app-pmu-form-review-detail',
  standalone: true,
  imports: [DynamicFormComponent, ReviewAcknowledgmentComponent, XvifcBreadcrumbComponent, PreLoaderComponent],
  templateUrl: './pmu-form-review-detail.component.html',
  styleUrl: './pmu-form-review-detail.component.scss',
})
export class PmuFormReviewDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly dynamicFormService = inject(DynamicFormService);
  private readonly moduleService = inject(XvifcModuleService);

  private readonly form = this.route.snapshot.data['form'] as PmuReviewFormId;
  private readonly stateId = this.route.snapshot.paramMap.get('stateId') ?? '';

  readonly formOption = pmuFormOption(this.form);
  readonly stateName = findReviewRow(this.stateId, this.form)?.stateName ?? 'Selected State';

  readonly breadcrumbLinks = computed<XvifcBreadcrumbLink[]>(() => [
    {
      label: 'Review State Submissions',
      routerLink: ['/xvifc', this.moduleService.yearId(), 'review-state-submissions'],
      queryParams: { ...this.route.snapshot.queryParams, form: this.form },
    },
    { label: this.formOption.label },
  ]);

  readonly fields = signal(formLevelQuestionsFor(this.form));
  readonly formGroup: FormGroup = this.dynamicFormService.toFormGroup(this.fields());

  /** Simulated — this is still the static dummy-data mockup, so there's no real fetch to await yet.
   *  Phase 9.3 replaces this timer with a real HTTP subscribe; the template/signal shape stays the same. */
  readonly isLoading = signal(true);

  readonly status = signal<PmuReviewStatus>(findReviewRow(this.stateId, this.form)?.status ?? 'Pending Review');
  readonly rejectionRemarks = signal<string | null>(null);

  constructor() {
    setTimeout(() => this.isLoading.set(false), 500);
  }

  readonly statusBadgeClass = computed(() => PMU_REVIEW_STATUS_BADGE_CLASS[this.status()]);
  readonly canApprove = computed(() => this.status() === 'Pending Review');
  readonly canReject = computed(() => this.status() === 'Pending Review');

  onApprove(): void {
    this.status.set('Approved');
    this.rejectionRemarks.set(null);
  }

  onReject(remarks: string): void {
    this.status.set('Returned');
    this.rejectionRemarks.set(remarks);
  }
}
