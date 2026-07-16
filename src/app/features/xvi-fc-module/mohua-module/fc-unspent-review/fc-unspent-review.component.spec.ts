import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { StateService } from '../../../../core/services/state/state.service';
import { UtilityService } from '../../../../core/services/utility.service';
import { XvifcModuleService } from '../../xvi-fc-module.service';
import { FcUnspentMohuaReviewComponent } from './fc-unspent-review.component';
import { FcUnspentMohuaReviewService } from './fc-unspent-review.service';
import { FcUnspentMohuaReviewData, FcUnspentMohuaRow, FcUnspentMohuaRowsResult } from './fc-unspent-review.models';

function makeReview(overrides: Partial<FcUnspentMohuaReviewData> = {}): FcUnspentMohuaReviewData {
  return {
    formId: 'form-1',
    stateId: 'state-1',
    stateName: 'Test State',
    yearId: 'year-1',
    designYear: '2025-26',
    applicableFc: '14TH_FC',
    isFcUnspent: true,
    fcDeclaration: null,
    checkboxConfirmation: true,
    currentFormStatus: 5,
    currentFormStatusLabel: 'Under Review by MoHUA',
    threshold: 10,
    rowSummary: { total: 2, active: 0, updatePending: 2, rejected: 0, needsUpdate: 0, eligible: 1, ineligible: 1 },
    permissions: { canView: true, canApproveForm: true, canRejectForm: true, canReviewRows: true },
    actors: [],
    ...overrides,
  };
}

function makeRow(overrides: Partial<FcUnspentMohuaRow> = {}): FcUnspentMohuaRow {
  return {
    _id: 'row-1',
    rowNumber: 1,
    ulbId: 'ulb-1',
    censusCode: '800123',
    sbCode: null,
    ulbName: 'Alpha ULB',
    allocationAmount: 20,
    unspentAmount: 1.5,
    allocationPerc: 7.5,
    eligibility: true,
    rowStatus: 'update_pending',
    rejectionRemark: null,
    permissions: { canApprove: true, canReject: true },
    ...overrides,
  };
}

function rowsResult(rows: FcUnspentMohuaRow[], total = rows.length): FcUnspentMohuaRowsResult {
  return { rows, page: 1, limit: 20, total };
}

describe('FcUnspentMohuaReviewComponent', () => {
  let fixture: ComponentFixture<FcUnspentMohuaReviewComponent>;
  let component: FcUnspentMohuaReviewComponent;
  let service: FcUnspentMohuaReviewService;
  let utilityService: UtilityService;
  let confirmDialogService: ConfirmDialogService;
  let dialog: MatDialog;
  let stateService: StateService;
  let router: Router;
  let getReviewSpy: jasmine.Spy;
  let getRowsSpy: jasmine.Spy;
  let getStatesSpy: jasmine.Spy;
  let paramMapSubject: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  /** Configures the TestBed and creates the component WITHOUT calling `detectChanges()`, so tests
   *  can override the default spy return values before `ngOnInit` actually fires. */
  function configure(stateId: string | null): void {
    paramMapSubject = new BehaviorSubject(convertToParamMap(stateId ? { stateId } : {}));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, FcUnspentMohuaReviewComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: paramMapSubject.asObservable() } },
        { provide: XvifcModuleService, useValue: jasmine.createSpyObj('XvifcModuleService', { yearId: 'year-1' }) },
      ],
    });

    fixture = TestBed.createComponent(FcUnspentMohuaReviewComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(FcUnspentMohuaReviewService);
    utilityService = TestBed.inject(UtilityService);
    confirmDialogService = TestBed.inject(ConfirmDialogService);
    dialog = TestBed.inject(MatDialog);
    stateService = TestBed.inject(StateService);
    router = TestBed.inject(Router);

    getReviewSpy = spyOn(service, 'getReview').and.returnValue(of(makeReview()));
    getRowsSpy = spyOn(service, 'getRows').and.returnValue(of(rowsResult([makeRow()])));
    getStatesSpy = spyOn(stateService, 'getStates').and.returnValue(
      of({ success: true, data: [{ _id: 'state-1', name: 'Test State' }], timestamp: '2026-01-01T00:00:00.000Z' }),
    );
  }

  function setup(stateId: string | null): void {
    configure(stateId);
    fixture.detectChanges();
  }

  // ─── State picker ────────────────────────────────────────────────────────

  it('shows the state picker and never calls the review API when no :stateId param is present', () => {
    setup(null);

    expect(getStatesSpy).toHaveBeenCalled();
    expect(getReviewSpy).not.toHaveBeenCalled();
    const select = fixture.debugElement.query(By.css('#fc-unspent-review-state-select'));
    expect(select).toBeTruthy();
  });

  it('navigates to the concrete review URL when a state is picked', () => {
    setup(null);
    const navigateSpy = spyOn(router, 'navigate');

    component.pickerStateId.set('state-1');
    component.goToState();

    expect(navigateSpy).toHaveBeenCalledWith(['/xvifc', 'year-1', 'fc-unspent-review', 'state-1']);
  });

  // ─── Metadata / branch behavior ─────────────────────────────────────────

  it('loads review metadata for the given stateId/yearId', () => {
    setup('state-1');
    expect(getReviewSpy).toHaveBeenCalledWith('state-1', 'year-1');
    expect(component.review()?.stateName).toBe('Test State');
  });

  it('No branch: does not request rows and shows no row table', () => {
    configure('state-1');
    getReviewSpy.and.returnValue(of(makeReview({ isFcUnspent: false })));
    fixture.detectChanges();

    expect(getRowsSpy).not.toHaveBeenCalled();
    expect(fixture.debugElement.query(By.css('table'))).toBeFalsy();
  });

  it('Yes branch: requests rows and renders the paginated table', () => {
    setup('state-1');
    expect(getRowsSpy).toHaveBeenCalledWith('state-1', 'year-1', jasmine.objectContaining({ page: 1, limit: 20 }));
    expect(fixture.debugElement.query(By.css('table'))).toBeTruthy();
  });

  it('acknowledged/view-only form: hides all mutation actions when every permission is false', () => {
    configure('state-1');
    getReviewSpy.and.returnValue(
      of(makeReview({ permissions: { canView: true, canApproveForm: false, canRejectForm: false, canReviewRows: false } })),
    );
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-cy="fc-unspent-review-approve-form"]'))).toBeFalsy();
    expect(fixture.debugElement.query(By.css('[data-cy="fc-unspent-review-reject-form"]'))).toBeFalsy();
    expect(fixture.debugElement.query(By.css('[data-cy="fc-unspent-review-bulk-approve"]'))).toBeFalsy();
  });

  it('permissions independently control each action', () => {
    configure('state-1');
    getReviewSpy.and.returnValue(
      of(makeReview({ permissions: { canView: true, canApproveForm: true, canRejectForm: false, canReviewRows: false } })),
    );
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-cy="fc-unspent-review-approve-form"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('[data-cy="fc-unspent-review-reject-form"]'))).toBeFalsy();
    expect(fixture.debugElement.query(By.css('[data-cy="fc-unspent-review-bulk-approve"]'))).toBeFalsy();
  });

  it('keeps eligibility and row status visually distinct badges', () => {
    configure('state-1');
    getRowsSpy.and.returnValue(of(rowsResult([makeRow({ eligibility: true, rowStatus: 'rejected' })])));
    fixture.detectChanges();

    const badges = fixture.debugElement.queryAll(By.css('tbody .badge'));
    const texts = badges.map((b) => b.nativeElement.textContent.trim());
    expect(texts).toContain('Eligible');
    expect(texts).toContain('Rejected');
  });

  // ─── Filters / pagination / request-race ────────────────────────────────

  it('debounces search input before requesting rows', (done) => {
    setup('state-1');
    getRowsSpy.calls.reset();

    component.filterForm.controls.search.setValue('nagar');
    setTimeout(() => {
      expect(getRowsSpy).not.toHaveBeenCalled();
    }, 100);
    setTimeout(() => {
      expect(getRowsSpy).toHaveBeenCalledWith('state-1', 'year-1', jasmine.objectContaining({ search: 'nagar', page: 1 }));
      done();
    }, 500);
  });

  it('resets to page 1 and clears selection when a filter changes', () => {
    setup('state-1');
    component.rowsPage.set(3);
    component.toggleRow(makeRow());

    component.filterForm.controls.rowStatus.setValue('rejected');

    expect(component.rowsPage()).toBe(1);
    expect(component.selectedCount()).toBe(0);
  });

  it('ignores a stale row response that resolves after a newer request', () => {
    setup('state-1');
    const first = new Subject<FcUnspentMohuaRowsResult>();
    const second = new Subject<FcUnspentMohuaRowsResult>();
    getRowsSpy.and.returnValues(first, second);

    component.loadRows(); // request A (first)
    component.loadRows(); // request B (second) — supersedes A

    first.next(rowsResult([makeRow({ _id: 'stale-row' })]));
    expect(component.rows().some((r) => r._id === 'stale-row')).toBe(false);

    second.next(rowsResult([makeRow({ _id: 'fresh-row' })]));
    expect(component.rows()[0]._id).toBe('fresh-row');
  });

  it('steps back one page when the current page becomes empty and page > 1', () => {
    setup('state-1');
    component.rowsPage.set(2);
    getRowsSpy.and.returnValues(of(rowsResult([], 0)), of(rowsResult([makeRow()], 1)));

    component.loadRows();

    expect(component.rowsPage()).toBe(1);
  });

  // ─── Selection ───────────────────────────────────────────────────────────

  it('cannot select a non-reviewable row', () => {
    const nonReviewable = makeRow({ _id: 'row-2', permissions: { canApprove: false, canReject: false } });
    configure('state-1');
    getRowsSpy.and.returnValue(of(rowsResult([nonReviewable])));
    fixture.detectChanges();

    component.toggleRow(nonReviewable);

    expect(component.isSelected('row-2')).toBe(false);
  });

  it('select-all-on-page selects only reviewable rows, and toggles off when all are selected', () => {
    const reviewable = makeRow({ _id: 'row-1' });
    const nonReviewable = makeRow({ _id: 'row-2', permissions: { canApprove: false, canReject: false } });
    configure('state-1');
    getRowsSpy.and.returnValue(of(rowsResult([reviewable, nonReviewable])));
    fixture.detectChanges();

    component.toggleSelectAllOnPage();
    expect(component.selectedCount()).toBe(1);
    expect(component.isSelected('row-1')).toBe(true);

    component.toggleSelectAllOnPage();
    expect(component.selectedCount()).toBe(0);
  });

  it('clears selection when the route stateId param changes', () => {
    setup('state-1');
    component.toggleRow(makeRow());
    expect(component.selectedCount()).toBe(1);

    paramMapSubject.next(convertToParamMap({ stateId: 'state-2' }));

    expect(component.selectedCount()).toBe(0);
  });

  // ─── Bulk approve ────────────────────────────────────────────────────────

  it('bulk approve requires confirmation, sends unique row ids, and reloads on success', () => {
    setup('state-1');
    const row = makeRow();
    component.toggleRow(row);
    spyOn(confirmDialogService, 'confirm').and.returnValue(of(true));
    const bulkApproveSpy = spyOn(service, 'bulkApproveRows').and.returnValue(
      of({ updatedRowCount: 1, rowSummary: makeReview().rowSummary, currentFormStatus: 5, currentFormStatusLabel: 'x', parentAcknowledged: false }),
    );
    getReviewSpy.calls.reset();

    component.onBulkApprove();

    expect(bulkApproveSpy).toHaveBeenCalledWith({ stateId: 'state-1', yearId: 'year-1', rowIds: ['row-1'] });
    expect(component.selectedCount()).toBe(0);
    expect(getReviewSpy).toHaveBeenCalled(); // reload
  });

  it('shows a danger snackbar when bulk approve fails, and a success snackbar when it succeeds', () => {
    setup('state-1');
    const snackbarSpy = spyOn(utilityService, 'triggerSnackbar');
    const row = makeRow();
    spyOn(confirmDialogService, 'confirm').and.returnValue(of(true));
    const bulkApproveSpy = spyOn(service, 'bulkApproveRows').and.returnValue(
      of({ updatedRowCount: 1, rowSummary: makeReview().rowSummary, currentFormStatus: 5, currentFormStatusLabel: 'x', parentAcknowledged: false }),
    );

    component.toggleRow(row);
    component.onBulkApprove();
    expect(snackbarSpy).toHaveBeenCalledWith(jasmine.any(String), 'snackbar-success');

    bulkApproveSpy.and.returnValue(throwError(() => ({ success: false, message: 'Failed.' })));
    component.toggleRow(row);
    component.onBulkApprove();
    expect(snackbarSpy).toHaveBeenCalledWith(jasmine.any(String), 'snackbar-danger');
  });

  it('bulk approve preserves selection and shows the _form error on failure', () => {
    setup('state-1');
    const row = makeRow();
    component.toggleRow(row);
    spyOn(confirmDialogService, 'confirm').and.returnValue(of(true));
    spyOn(service, 'bulkApproveRows').and.returnValue(
      throwError(() => ({ success: false, message: 'Failed.', errors: { _form: [{ message: 'One or more rows are already active.' }] } })),
    );

    component.onBulkApprove();

    expect(component.selectedCount()).toBe(1);
    expect(component.formError()).toBe('One or more rows are already active.');
  });

  it('does not submit bulk approve when a selected row cannot be approved', () => {
    const row = makeRow({ permissions: { canApprove: false, canReject: true } });
    configure('state-1');
    getRowsSpy.and.returnValue(of(rowsResult([row])));
    fixture.detectChanges();
    // toggleRow only allows reviewable rows (canApprove || canReject), so this row IS selectable but not approvable
    component.toggleRow(row);

    expect(component.canBulkApprove()).toBe(false);
  });

  // ─── Bulk reject ─────────────────────────────────────────────────────────

  it('bulk reject opens the dialog with selected rows and reloads on success', () => {
    setup('state-1');
    component.toggleRow(makeRow());
    const dialogRefStub = { afterClosed: () => of(true) };
    const openSpy = spyOn(dialog, 'open').and.returnValue(dialogRefStub as unknown as ReturnType<MatDialog['open']>);
    getReviewSpy.calls.reset();

    component.onBulkReject();

    expect(openSpy).toHaveBeenCalled();
    expect(getReviewSpy).toHaveBeenCalled();
  });

  it('bulk reject does nothing when the dialog is cancelled', () => {
    setup('state-1');
    component.toggleRow(makeRow());
    const dialogRefStub = { afterClosed: () => of(false) };
    spyOn(dialog, 'open').and.returnValue(dialogRefStub as unknown as ReturnType<MatDialog['open']>);
    getReviewSpy.calls.reset();

    component.onBulkReject();

    expect(getReviewSpy).not.toHaveBeenCalled();
  });

  // ─── Complete-form actions ───────────────────────────────────────────────

  it('complete approve requires confirmation and reloads backend state on success', () => {
    setup('state-1');
    spyOn(confirmDialogService, 'confirm').and.returnValue(of(true));
    spyOn(service, 'approveForm').and.returnValue(of({ currentFormStatus: 7, currentFormStatusLabel: 'Acknowledged' }));
    getReviewSpy.calls.reset();

    component.onApproveForm();

    expect(getReviewSpy).toHaveBeenCalled();
  });

  it('complete approve shows the returned _form error without local reinterpretation', () => {
    setup('state-1');
    spyOn(confirmDialogService, 'confirm').and.returnValue(of(true));
    spyOn(service, 'approveForm').and.returnValue(
      throwError(() => ({ success: false, message: 'Failed.', errors: { _form: [{ message: 'A row is already ACTIVE and blocks whole-form rejection.' }] } })),
    );

    component.onApproveForm();

    expect(component.formError()).toBe('A row is already ACTIVE and blocks whole-form rejection.');
  });

  it('complete reject opens the remarks dialog and reloads on success', () => {
    setup('state-1');
    const dialogRefStub = { afterClosed: () => of(true) };
    const openSpy = spyOn(dialog, 'open').and.returnValue(dialogRefStub as unknown as ReturnType<MatDialog['open']>);
    getReviewSpy.calls.reset();

    component.onRejectForm();

    expect(openSpy).toHaveBeenCalled();
    expect(getReviewSpy).toHaveBeenCalled();
  });

  it('prevents double-submitting complete approve while a request is pending', () => {
    setup('state-1');
    spyOn(confirmDialogService, 'confirm').and.returnValue(of(true));
    const pending = new Subject<{ currentFormStatus: number; currentFormStatusLabel: string }>();
    const approveSpy = spyOn(service, 'approveForm').and.returnValue(pending);

    component.onApproveForm();
    component.onApproveForm();

    expect(approveSpy).toHaveBeenCalledTimes(1);
  });

  // ─── Load failure ────────────────────────────────────────────────────────

  it('shows a load error and stops when getReview fails', () => {
    configure('state-1');
    getReviewSpy.and.returnValue(throwError(() => ({ success: false, message: 'Not found.' })));
    fixture.detectChanges();

    expect(component.loadError()).toBe('Not found.');
    expect(fixture.debugElement.query(By.css('[data-cy="fc-unspent-review-load-error"]'))).toBeTruthy();
  });

  it('stops all API calls and shows an error when yearId is missing', () => {
    paramMapSubject = new BehaviorSubject(convertToParamMap({ stateId: 'state-1' }));
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, FcUnspentMohuaReviewComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: paramMapSubject.asObservable() } },
        { provide: XvifcModuleService, useValue: jasmine.createSpyObj('XvifcModuleService', { yearId: null }) },
      ],
    });
    fixture = TestBed.createComponent(FcUnspentMohuaReviewComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(FcUnspentMohuaReviewService);
    const spy = spyOn(service, 'getReview');

    fixture.detectChanges();

    expect(spy).not.toHaveBeenCalled();
    expect(component.loadError()).toBeTruthy();
  });
});
