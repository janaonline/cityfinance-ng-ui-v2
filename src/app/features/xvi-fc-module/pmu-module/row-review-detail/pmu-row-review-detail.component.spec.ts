import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { UtilityService } from '../../../../core/services/utility.service';
import { XvifcModuleService } from '../../xvi-fc-module.service';
import { PmuFormReviewData, PmuRow } from '../pmu-review.models';
import { PmuRowReviewService } from '../pmu-row-review.service';
import { PmuRowReviewDetailComponent } from './pmu-row-review-detail.component';

const review = (canAct: boolean): PmuFormReviewData => ({
  formId: 'form-1',
  stateId: 'state-1',
  stateName: 'Rajasthan',
  yearId: 'year-1',
  currentFormStatus: 13,
  currentFormStatusLabel: 'Under Review by PMU',
  pmuRemarks: null,
  questions: [],
  rowSummary: { total: 1, active: 1, updatePending: 0, rejected: 0, needsUpdate: 0 },
  permissions: { canView: true, canApproveForm: canAct, canRejectForm: canAct, canReviewRows: canAct },
  actors: [],
});

const rows = (canAct: boolean): PmuRow[] => [
  {
    _id: 'row-1',
    rowNumber: 1,
    ulbId: 'ulb-1',
    censusCode: '800123',
    ulbName: 'Kekri Municipality',
    rowStatus: 13,
    rejectionRemark: null,
    electedBodyStatus: 'Constituted',
    permissions: { canApprove: canAct, canReject: canAct },
  },
];

/** Renders the screen the way each route does: PMU's own route has no `viewOnly`; MoHUA's route sets it. */
describe('PmuRowReviewDetailComponent — PMU review vs MoHUA view-only', () => {
  const create = (options: { viewOnly: boolean; canAct: boolean }) => {
    const data: Record<string, unknown> = { form: 'ELECTED_BODY', ...(options.viewOnly ? { viewOnly: true } : {}) };
    TestBed.configureTestingModule({
      imports: [PmuRowReviewDetailComponent, HttpClientTestingModule],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: XvifcModuleService, useValue: { yearId: () => 'year-1' } },
        { provide: UtilityService, useValue: { triggerSnackbar: () => undefined } },
        {
          provide: PmuRowReviewService,
          useValue: {
            getReview: () => of(review(options.canAct)),
            getRows: () => of({ rows: rows(options.canAct), page: 1, limit: 25, total: 1, pendingTotal: 1 }),
          },
        },
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
    const fixture = TestBed.createComponent(PmuRowReviewDetailComponent);
    fixture.detectChanges();
    return fixture;
  };

  const text = (fixture: ReturnType<typeof create>) => (fixture.nativeElement as HTMLElement).textContent ?? '';

  describe("PMU's own route (no viewOnly) is unchanged", () => {
    it('keeps the approve and reject controls and the selection column', () => {
      const fixture = create({ viewOnly: false, canAct: true });

      expect(fixture.componentInstance.viewOnly).toBeFalse();
      expect(text(fixture)).toContain('Approve Selected');
      expect(text(fixture)).toContain('Reject Selected');
      expect(text(fixture)).toContain('Approve Form');
      expect(fixture.nativeElement.querySelectorAll('input[type="checkbox"]').length).toBe(2); // header + 1 row
      expect(fixture.componentInstance.colSpan).toBe(4 + 4); // checkbox column + the 4 elected-body columns
    });

    it('keeps the "then approve or reject" wording and the PMU breadcrumb', () => {
      const fixture = create({ viewOnly: false, canAct: true });

      expect(text(fixture)).toContain('then approve or reject');
      expect(fixture.componentInstance.breadcrumbLinks().map((link) => link.label)).toEqual([
        'Review State Submissions',
        'Elected Body Status',
      ]);
    });
  });

  describe("MoHUA's route (viewOnly) is read-only", () => {
    it('hides every approve and reject control and the selection column', () => {
      const fixture = create({ viewOnly: true, canAct: false });

      expect(fixture.componentInstance.viewOnly).toBeTrue();
      expect(text(fixture)).not.toContain('Approve Selected');
      expect(text(fixture)).not.toContain('Reject Selected');
      expect(text(fixture)).not.toContain('Approve Form');
      expect(text(fixture)).not.toContain('Reject Form');
      expect(fixture.nativeElement.querySelectorAll('input[type="checkbox"]').length).toBe(0);
      expect(fixture.componentInstance.colSpan).toBe(3 + 4);
    });

    it('still shows the form and its rows', () => {
      const fixture = create({ viewOnly: true, canAct: false });

      expect(text(fixture)).toContain('Viewing the state');
      expect(text(fixture)).toContain('Kekri Municipality');
      expect(text(fixture)).toContain('800123');
    });

    it('links back to the MoHUA overview and the state, not to the PMU worklist', () => {
      const fixture = create({ viewOnly: true, canAct: false });

      expect(fixture.componentInstance.breadcrumbLinks()).toEqual([
        { label: 'All States', routerLink: ['/xvifc', 'year-1', 'overview'] },
        { label: 'Rajasthan', routerLink: ['/xvifc', 'year-1', 'review-state-submissions', 'state-1'] },
        { label: 'Elected Body Status' },
      ]);
    });
  });
});
