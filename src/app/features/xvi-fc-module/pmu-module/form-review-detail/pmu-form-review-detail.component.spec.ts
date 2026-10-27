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

const review = (canAct: boolean, canUndo = false): PmuFormReviewData => ({
  formId: 'form-1',
  stateId: 'state-1',
  stateName: 'Rajasthan',
  yearId: 'year-1',
  currentFormStatus: 13,
  currentFormStatusLabel: 'Under Review by PMU',
  pmuRemarks: null,
  questions: [],
  permissions: { canView: true, canApproveForm: canAct, canRejectForm: canAct, canUndo },
  actors: [],
});

/** Renders the screen the way each route does: PMU's own route has no `viewOnly`; MoHUA's route sets it. */
describe('PmuFormReviewDetailComponent — PMU review vs MoHUA view-only', () => {
  const create = (options: { viewOnly: boolean; canAct: boolean; canUndo?: boolean }) => {
    const data: Record<string, unknown> = { form: 'SFC_STATUS', ...(options.viewOnly ? { viewOnly: true } : {}) };
    TestBed.configureTestingModule({
      imports: [PmuFormReviewDetailComponent, HttpClientTestingModule],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: XvifcModuleService, useValue: { yearId: () => 'year-1' } },
        { provide: UtilityService, useValue: { triggerSnackbar: () => undefined } },
        { provide: PmuFormReviewService, useValue: { getReview: () => of(review(options.canAct, options.canUndo)) } },
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

  const undoButton = (fixture: ReturnType<typeof create>) =>
    (fixture.nativeElement as HTMLElement).querySelector('[data-cy="pmu-form-review-undo"]');

  it('shows an Undo button only when the backend says the decision can be undone', () => {
    expect(undoButton(create({ viewOnly: false, canAct: true, canUndo: false }))).toBeNull();
  });

  it('labels the Undo button for the decision being undone (status 13 in this fixture reads as an approval)', () => {
    const fixture = create({ viewOnly: false, canAct: true, canUndo: true });
    expect(undoButton(fixture)?.textContent).toContain('Undo approval');
  });

  it("never shows Undo on MoHUA's read-only route, even if the flag were set", () => {
    expect(undoButton(create({ viewOnly: true, canAct: false, canUndo: true }))).toBeNull();
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
