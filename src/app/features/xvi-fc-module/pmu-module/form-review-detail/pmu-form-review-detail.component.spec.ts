import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { UtilityService } from '../../../../core/services/utility.service';
import { XvifcModuleService } from '../../xvi-fc-module.service';
import { PmuFormReviewService } from '../pmu-form-review.service';
import { PmuFormReviewData } from '../pmu-review.models';
import { PmuFormReviewDetailComponent } from './pmu-form-review-detail.component';

const review = (canAct: boolean): PmuFormReviewData => ({
  formId: 'form-1',
  stateId: 'state-1',
  stateName: 'Rajasthan',
  yearId: 'year-1',
  currentFormStatus: 13,
  currentFormStatusLabel: 'Under Review by PMU',
  pmuRemarks: null,
  questions: [],
  permissions: { canView: true, canApproveForm: canAct, canRejectForm: canAct },
  actors: [],
});

/** Renders the screen the way each route does: PMU's own route has no `viewOnly`; MoHUA's route sets it. */
describe('PmuFormReviewDetailComponent — PMU review vs MoHUA view-only', () => {
  const create = (options: { viewOnly: boolean; canAct: boolean }) => {
    const data: Record<string, unknown> = { form: 'SFC_STATUS', ...(options.viewOnly ? { viewOnly: true } : {}) };
    TestBed.configureTestingModule({
      imports: [PmuFormReviewDetailComponent, HttpClientTestingModule],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: XvifcModuleService, useValue: { yearId: () => 'year-1' } },
        { provide: UtilityService, useValue: { triggerSnackbar: () => undefined } },
        { provide: PmuFormReviewService, useValue: { getReview: () => of(review(options.canAct)) } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { data, paramMap: convertToParamMap({ stateId: 'state-1' }), queryParams: {} },
            paramMap: of(convertToParamMap({ stateId: 'state-1' })),
            parent: null,
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(PmuFormReviewDetailComponent);
    fixture.detectChanges();
    return fixture;
  };

  /** The approve / reject buttons the review-acknowledgment strip renders (it renders nothing without permission). */
  const buttons = (fixture: ReturnType<typeof create>) =>
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('app-review-acknowledgment button')).map(
      (button) => (button.textContent ?? '').trim(),
    );

  const text = (fixture: ReturnType<typeof create>) => (fixture.nativeElement as HTMLElement).textContent ?? '';

  it("PMU's own route keeps the approve and reject controls, the wording and the PMU breadcrumb", () => {
    const fixture = create({ viewOnly: false, canAct: true });

    expect(fixture.componentInstance.viewOnly).toBeFalse();
    expect(text(fixture)).toContain('then approve or reject');
    expect(buttons(fixture)).toEqual(['Reject', 'Approve']);
    expect(fixture.componentInstance.breadcrumbLinks().map((link) => link.label)).toEqual([
      'Review State Submissions',
      'SFC Status',
    ]);
  });

  it("MoHUA's route is read-only: no approve or reject controls, its own wording and links back to the state", () => {
    const fixture = create({ viewOnly: true, canAct: false });

    expect(fixture.componentInstance.viewOnly).toBeTrue();
    expect(text(fixture)).toContain("Viewing the state's submitted SFC Status form");
    expect(buttons(fixture)).toEqual([]);
    expect(fixture.componentInstance.breadcrumbLinks()).toEqual([
      { label: 'All States', routerLink: ['/xvifc', 'year-1', 'overview'] },
      { label: 'Rajasthan', routerLink: ['/xvifc', 'year-1', 'review-state-submissions', 'state-1'] },
      { label: 'SFC Status' },
    ]);
  });
});
