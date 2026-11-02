import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject, of, throwError } from 'rxjs';
import { AmountDisplayModeService } from '../../../../../core/services/amount-display-mode.service';
import { UtilityService } from '../../../../../core/services/utility.service';
import { ConfirmDialogService } from '../../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { UploadedFileMetadata } from '../../../../../shared/dynamic-form/components/file/file-metadata.types';
import { FieldSupportingContent } from '../../../../../shared/dynamic-form/field.interface';
import { ConditionalFieldConfig } from '../../../dynamic-form-visibility.service';
import { XvifcModuleService } from '../../../xvi-fc-module.service';
import { createClaimUlbRowGroup } from '../components/claim-ulb-table/claim-ulb-table.component';
import { ClaimLetterDocumentPreviewDialogComponent } from '../components/document-preview-dialog/claim-letter-document-preview-dialog.component';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import {
  ClaimLetterBatchSummary,
  ClaimLetterClaimContext,
  ClaimLetterFinalPdf,
  ClaimLetterUlbRow,
} from '../claim-letter.models';
import { ClaimLetterService } from '../claim-letter.service';
import { ClaimLetterDetailComponent } from './claim-letter-detail.component';

const SIGNED_FILE_FIELD: ConditionalFieldConfig = {
  formFieldType: 'file',
  key: 'signedClaimFile',
  label: 'Upload Signed Claim Letter',
  value: null,
  allowedFileTypes: ['pdf'],
  maxFileSize: 20,
  folderPath: 'claim-letter/signed-file',
  validations: [{ name: 'required', validator: null, message: 'A signed claim letter file is required.' }],
};

const SAMPLE_FILE_METADATA: UploadedFileMetadata = {
  originalName: 'signed-claim-letter.pdf',
  path: 'claim-letter/signed-file/signed-claim-letter.pdf',
  mimeType: 'application/pdf',
  sizeKb: 512,
  pageCount: 3,
};

const financialSummary = {
  totalInstallmentAllocation: 0,
  totalAlreadyAcknowledged: 0,
  totalClaimInProgress: 0,
  totalClaimInDraft: 0,
  availableToClaim: 0,
  selectedAllocation: 0,
  currentSelectedClaim: 21,
  remainingIfAcknowledged: 0,
};

function buildClaim(overrides: Partial<ClaimLetterBatchSummary> = {}): ClaimLetterBatchSummary {
  return {
    claimLetterId: 'claim-1',
    installment: 1,
    batchNumber: 1,
    version: 1,
    currentFormStatus: 2, // FORM_STATUS.IN_PROGRESS
    currentFormStatusLabel: 'In Progress',
    assemblyStatus: 'READY',
    ulbCount: 1,
    isAbandoned: false,
    hasSignedFile: false,
    finalClaimLetterStage: null,
    financialSummary,
    revision: 2,
    submittedAt: null,
    resolvedAt: null,
    supersedes: null,
    supersededBy: null,
    createdAt: '2026-07-01T00:00:00.000Z',
    // Backend-driven gates — canEdit()/canFinalSubmit() read these directly now, not
    // currentFormStatus/isAbandoned. Default to "fully editable" so existing tests that only care
    // about other behavior don't also have to specify permissions explicitly.
    permissions: { canView: true, canEdit: true, canFinalSubmit: true },
    stateName: 'Test State',
    ...overrides,
  };
}

function buildClaimContext(overrides: Partial<ClaimLetterClaimContext> = {}): ClaimLetterClaimContext {
  return {
    stateName: 'Test State',
    expectedUlbCount: 10,
    batchSlotsUsed: 0,
    batchSlotsMax: 3,
    nextBatchNumber: 1,
    financialOverview: {
      totalInstallmentAllocation: 25,
      totalAlreadyAcknowledged: 5,
      totalClaimInProgress: 3,
      totalClaimInDraft: 2,
      availableToClaim: 15,
    },
    remainingUlbCount: 0,
    varianceLowerPercent: 90,
    varianceUpperPercent: 110,
    // Create-mode's canEdit() reads this — default to creatable for the same reason as above.
    canCreate: true,
    createBlockedReason: null,
    ...overrides,
  };
}

const SAVED_ULB_ROWS: ClaimLetterUlbRow[] = [
  {
    ulbId: 'ulb-1',
    ulbName: 'Sample Municipal Corporation',
    censusCode: '800123',
    sbCode: null,
    allocationAmount: 20,
    claimAmount: 21,
    differencePercentage: 5,
    eligible: true,
  },
];

function routeWithParam(claimLetterId: string | null): ActivatedRoute {
  return {
    snapshot: { paramMap: convertToParamMap(claimLetterId === null ? {} : { claimLetterId }) },
  } as unknown as ActivatedRoute;
}

describe('ClaimLetterDetailComponent', () => {
  let fixture: ComponentFixture<ClaimLetterDetailComponent>;
  let component: ClaimLetterDetailComponent;
  let claimLetterService: ClaimLetterService;
  let router: Router;
  let utilityService: UtilityService;
  let dialogOpenSpy: jasmine.Spy;

  async function setup(routeParam: string | null): Promise<void> {
    localStorage.setItem('userData', JSON.stringify({ state: 'state-test-id' }));

    const moduleService = jasmine.createSpyObj<XvifcModuleService>('XvifcModuleService', ['yearId']);
    moduleService.yearId.and.returnValue('year-test-id');

    const mockDialogRef = jasmine.createSpyObj<MatDialogRef<unknown>>('MatDialogRef', ['afterClosed', 'close']);
    mockDialogRef.afterClosed.and.returnValue(of(undefined));
    dialogOpenSpy = jasmine.createSpy('MatDialog.open').and.returnValue(mockDialogRef);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, ClaimLetterDetailComponent],
      providers: [
        { provide: XvifcModuleService, useValue: moduleService },
        { provide: ActivatedRoute, useValue: routeWithParam(routeParam) },
      ],
    })
      // overrideProvider forcefully replaces even providedIn:'root' singletons
      .overrideProvider(MatDialog, { useValue: { open: dialogOpenSpy } })
      .compileComponents();

    claimLetterService = TestBed.inject(ClaimLetterService);
    router = TestBed.inject(Router);
    utilityService = TestBed.inject(UtilityService);
    spyOn(router, 'navigate');
    spyOn(utilityService, 'triggerSnackbar');

    fixture = TestBed.createComponent(ClaimLetterDetailComponent);
    component = fixture.componentInstance;
  }

  afterEach(() => {
    localStorage.removeItem('userData');
  });

  // ─── Create mode ────────────────────────────────────────────────────────────

  describe('create mode', () => {
    beforeEach(async () => {
      await setup('new');
      spyOn(claimLetterService, 'getClaimContext').and.returnValue(of(buildClaimContext()));
      fixture.detectChanges();
    });

    it('is create mode with no claimLetterId and editable by default', () => {
      expect(component.isCreateMode).toBe(true);
      expect(component.claimLetterId()).toBeNull();
      expect(component.canEdit()).toBe(true);
    });

    it('falls back to eligibilityOverview().canCreate — there is no claim yet to read permissions from', () => {
      // Simulate a claim-context response that denies canCreate (e.g. a viewer-only user).
      component.eligibilityOverview.set(buildClaimContext({ canCreate: false }));
      expect(component.canEdit()).toBe(false);
    });

    it('stateName reads from eligibilityOverview() in create mode, for the page-header eyebrow', () => {
      expect(component.stateName()).toBe('Test State');
    });

    it('loads the state-wide financial overview (but never getDetail/getUlbs) on init', () => {
      expect(claimLetterService.getClaimContext).toHaveBeenCalledWith('state-test-id', 'year-test-id', 1);
      // Same 3-tile shape as the list page — the full 5-figure breakdown lives there only; this page
      // stays lean and lets the narrative bullets carry the "in progress"/"in draft" nuance instead.
      // "Available to Claim" is the server-computed field, not a client subtraction.
      expect(component.summaryTiles()).toEqual([
        { label: 'Total Allocation', value: 25 },
        { label: 'Already Claimed (Acknowledged)', value: 5 },
        { label: 'Available to Claim', value: 15 },
      ]);
    });

    it('shows no summary tiles when the financial overview has not loaded (e.g. the request failed)', () => {
      component.eligibilityOverview.set(null);
      expect(component.summaryTiles()).toEqual([]);
    });

    it('shows a neutral placeholder narrative before any ULB rows are added', () => {
      expect(component.batchNarrative()).toEqual([
        "Add ULBs below to see how this batch affects your state's overall allocation.",
      ]);
    });

    it('builds live narrative bullets once rows exist, using dynamic Installment text', () => {
      component.rows.push(createClaimUlbRowGroup(true, { ulbId: 'ulb-1', claimedAmount: 5 }));
      fixture.detectChanges();

      const narrative = component.batchNarrative();
      // financialOverview: totalInstallmentAllocation=25, expectedUlbCount=10, availableToClaim=15.
      expect(narrative[0]).toBe('This batch includes 1 of 10 eligible ULBs (10.0%).');
      expect(narrative[1]).toContain('Installment 1 allocation');
      expect(narrative[1]).toContain('20.0%'); // 5 / 25
      // 15 (availableToClaim) - 5 (live claim)
      expect(narrative[2]).toContain(TestBed.inject(AmountDisplayModeService).format(10, 'auto'));
    });

    it('breadcrumb reads Claim Letter > New Claim Letter, linking back to the list', () => {
      expect(component.breadcrumbLinks()).toEqual([
        { label: 'Claim Letter', routerLink: ['/xvifc', 'year-test-id', 'claim-letter'] },
        { label: 'New Claim Letter' },
      ]);
    });

    it('never calls getDetail/getAllUlbs on init', () => {
      const getDetailSpy = spyOn(claimLetterService, 'getDetail');
      const getAllUlbsSpy = spyOn(claimLetterService, 'getAllUlbs');
      expect(getDetailSpy).not.toHaveBeenCalled();
      expect(getAllUlbsSpy).not.toHaveBeenCalled();
    });

    it('createDraft refuses to submit with zero rows', () => {
      const createDraftSpy = spyOn(claimLetterService, 'createDraft');

      component.createDraft();

      expect(createDraftSpy).not.toHaveBeenCalled();
      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(jasmine.any(String), 'snackbar-danger');
    });

    it('createDraft refuses to submit when a row is invalid (e.g. missing claim amount)', () => {
      component.rows.push(createClaimUlbRowGroup(true, { ulbId: 'ulb-1', claimedAmount: null }));
      const createDraftSpy = spyOn(claimLetterService, 'createDraft');

      component.createDraft();

      expect(createDraftSpy).not.toHaveBeenCalled();
      expect(component.rows.at(0).controls.claimedAmount.touched).toBe(true);
    });

    it('createDraft posts the whitelisted selections and navigates into edit mode, replacing the URL', () => {
      component.rows.push(createClaimUlbRowGroup(true, { ulbId: 'ulb-1', claimedAmount: 21 }));
      const created = buildClaim({ claimLetterId: 'claim-new' });
      spyOn(claimLetterService, 'createDraft').and.returnValue(of(created));

      component.createDraft();

      expect(claimLetterService.createDraft).toHaveBeenCalledWith('state-test-id', 'year-test-id', 1, {
        ulbSelections: [{ ulbId: 'ulb-1', claimedAmount: 21 }],
      });
      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(jasmine.any(String), 'snackbar-success');
      expect(router.navigate).toHaveBeenCalledWith(['/xvifc', 'year-test-id', 'claim-letter', 'claim-new'], {
        replaceUrl: true,
      });
    });

    it('createDraft surfaces the backend message on failure', () => {
      component.rows.push(createClaimUlbRowGroup(true, { ulbId: 'ulb-1', claimedAmount: 21 }));
      spyOn(claimLetterService, 'createDraft').and.returnValue(
        throwError(() => ({ success: false, message: 'One or more ULBs are ineligible.' })),
      );

      component.createDraft();

      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
        'One or more ULBs are ineligible.',
        'snackbar-danger',
      );
      expect(component.formLevelErrors()).toEqual(['One or more ULBs are ineligible.']);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('cancel navigates straight to the list when no rows have been added', () => {
      component.cancel();
      expect(router.navigate).toHaveBeenCalledWith(['/xvifc', 'year-test-id', 'claim-letter']);
    });

    it('cancel confirms before discarding when rows exist, and navigates only if confirmed', () => {
      component.rows.push(createClaimUlbRowGroup(true, { ulbId: 'ulb-1', claimedAmount: 21 }));
      const confirmSpy = spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(false));

      component.cancel();

      expect(confirmSpy).toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('cancel navigates to the list once the discard is confirmed', () => {
      component.rows.push(createClaimUlbRowGroup(true, { ulbId: 'ulb-1', claimedAmount: 21 }));
      spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));

      component.cancel();

      expect(router.navigate).toHaveBeenCalledWith(['/xvifc', 'year-test-id', 'claim-letter']);
    });
  });

  // ─── Edit mode ──────────────────────────────────────────────────────────────

  describe('edit mode', () => {
    async function setupEdit(claim: ClaimLetterBatchSummary = buildClaim()): Promise<void> {
      await setup('claim-1');
      spyOn(claimLetterService, 'getDetail').and.returnValue(of(claim));
      spyOn(claimLetterService, 'getAllUlbs').and.returnValue(of(SAVED_ULB_ROWS));
      // ngOnInit() now fetches the eligibility overview in edit mode too (for the narrative bullets'
      // expectedUlbCount/batch-slot figures), not just create mode — mocked here so every edit-mode
      // test has a consistent, non-dangling response.
      spyOn(claimLetterService, 'getClaimContext').and.returnValue(of(buildClaimContext()));
      fixture.detectChanges();
    }

    it('is not create mode, and loads detail + all ulbs on init, hydrating the table', async () => {
      await setupEdit();

      expect(component.isCreateMode).toBe(false);
      expect(component.claimLetterId()).toBe('claim-1');
      expect(claimLetterService.getDetail).toHaveBeenCalledWith('claim-1');
      expect(claimLetterService.getAllUlbs).toHaveBeenCalledWith('claim-1');
      expect(component.claim()?.claimLetterId).toBe('claim-1');
      expect(component.rows.length).toBe(1);
      expect(component.rows.at(0).controls.ulbId.value).toBe('ulb-1');
      expect(component.rows.at(0).controls.claimedAmount.value).toBe(21);
    });

    it('breadcrumb reads Claim Letter > Batch #n, linking back to the list', async () => {
      await setupEdit(buildClaim({ batchNumber: 2 }));
      expect(component.breadcrumbLinks()).toEqual([
        { label: 'Claim Letter', routerLink: ['/xvifc', 'year-test-id', 'claim-letter'] },
        { label: 'Batch #2' },
      ]);
    });

    it('shows all four financial-summary tiles straight from the loaded claim, netting out other concurrent batches', async () => {
      await setupEdit(
        buildClaim({
          financialSummary: {
            totalInstallmentAllocation: 25,
            totalAlreadyAcknowledged: 5,
            totalClaimInProgress: 3,
            totalClaimInDraft: 1,
            availableToClaim: 16,
            selectedAllocation: 20,
            currentSelectedClaim: 21,
            remainingIfAcknowledged: -5,
          },
        }),
      );

      expect(component.summaryTiles()).toEqual([
        { label: 'Total Allocation', value: 25 },
        { label: 'Already Claimed (Acknowledged)', value: 5 },
        { label: 'Claimed in This Batch', value: 21 },
        { label: 'Remaining After This Batch', value: -5 }, // 25 - 5 - 3 - 1 - 21
      ]);
    });

    it('recomputes Claimed in This Batch / Remaining After This Batch live as the claim amount is edited', async () => {
      await setupEdit(
        buildClaim({
          financialSummary: {
            totalInstallmentAllocation: 25,
            totalAlreadyAcknowledged: 5,
            totalClaimInProgress: 3,
            totalClaimInDraft: 1,
            availableToClaim: 16,
            selectedAllocation: 20,
            currentSelectedClaim: 21,
            remainingIfAcknowledged: -5,
          },
        }),
      );

      component.rows.at(0).controls.claimedAmount.setValue(10);
      fixture.detectChanges();

      const tiles = component.summaryTiles();
      expect(tiles.find((t) => t.label === 'Claimed in This Batch')?.value).toBe(10);
      expect(tiles.find((t) => t.label === 'Remaining After This Batch')?.value).toBe(6); // 25 - 5 - 3 - 1 - 10
    });

    // ─── Client-side pre-submit validation (known-invalid rows block Save/Create) ───

    it('has no invalid rows for a freshly-loaded, in-variance, eligible draft', async () => {
      await setupEdit(); // SAVED_ULB_ROWS: allocationAmount 20, claimAmount 21 (within ±10%), eligible true
      expect(component.hasInvalidRows()).toBe(false);
      expect(component.rowValidationMessage()).toBeNull();
    });

    it('flags the row and matches the backend wording once a claim amount drifts outside ±10%', async () => {
      await setupEdit();

      component.rows.at(0).controls.claimedAmount.setValue(100); // allocation is 20
      fixture.detectChanges();

      expect(component.hasInvalidRows()).toBe(true);
      expect(component.rowValidationMessage()).toBe(
        'The following ULBs are ineligible or have an invalid claimed amount: 800123',
      );
    });

    it('clears once the claim amount is corrected back within variance', async () => {
      await setupEdit();
      component.rows.at(0).controls.claimedAmount.setValue(100);
      fixture.detectChanges();
      expect(component.hasInvalidRows()).toBe(true);

      component.rows.at(0).controls.claimedAmount.setValue(21);
      fixture.detectChanges();

      expect(component.hasInvalidRows()).toBe(false);
      expect(component.rowValidationMessage()).toBeNull();
    });

    it('narrative uses the self-excluded financialSummary fields, not the raw eligibility overview (which would double-count this batch)', async () => {
      // eligibilityOverview (state-wide, NOT self-excluded): totalClaimInProgress=3, totalClaimInDraft=2.
      // claim().financialSummary (self-excluded already): totalClaimInProgress=0, totalClaimInDraft=0
      // — as if this very batch were the only contributor to those buckets before self-exclusion.
      await setupEdit(
        buildClaim({
          financialSummary: {
            totalInstallmentAllocation: 25,
            totalAlreadyAcknowledged: 5,
            totalClaimInProgress: 0,
            totalClaimInDraft: 0,
            availableToClaim: 20,
            selectedAllocation: 20,
            currentSelectedClaim: 21,
            remainingIfAcknowledged: -1,
          },
        }),
      );

      const narrative = component.batchNarrative();
      // If the (incorrect) raw overview totals were used instead, this would read 25-5-3-2-21=-6.
      expect(narrative[2]).toContain(TestBed.inject(AmountDisplayModeService).format(25 - 5 - 0 - 0 - 21, 'auto'));
    });

    it('narrative is empty (hidden) once the batch is no longer editable', async () => {
      // UNDER_REVIEW_BY_MOHUA, read-only — canEdit() reads permissions.canEdit directly, not status.
      await setupEdit(
        buildClaim({ currentFormStatus: 5, permissions: { canView: true, canEdit: false, canFinalSubmit: false } }),
      );
      expect(component.batchNarrative()).toEqual([]);
    });

    it('is editable when the backend grants canEdit', async () => {
      await setupEdit(
        buildClaim({
          currentFormStatus: 2,
          isAbandoned: false,
          permissions: { canView: true, canEdit: true, canFinalSubmit: true },
        }),
      );
      expect(component.canEdit()).toBe(true);
    });

    it('stateName reads from claim() in edit mode, for the page-header eyebrow', async () => {
      await setupEdit(buildClaim({ stateName: 'Andhra Pradesh' }));
      expect(component.stateName()).toBe('Andhra Pradesh');
    });

    it('is read-only once the backend denies canEdit (e.g. no longer IN_PROGRESS)', async () => {
      await setupEdit(
        buildClaim({ currentFormStatus: 5, permissions: { canView: true, canEdit: false, canFinalSubmit: false } }), // UNDER_REVIEW_BY_MOHUA
      );
      expect(component.canEdit()).toBe(false);
    });

    it('is read-only once the backend denies canEdit for an abandoned draft, even if still nominally IN_PROGRESS', async () => {
      await setupEdit(
        buildClaim({ isAbandoned: true, permissions: { canView: true, canEdit: false, canFinalSubmit: false } }),
      );
      expect(component.canEdit()).toBe(false);
    });

    it('sets loadError and shows a snackbar when the initial load fails', async () => {
      await setup('claim-1');
      spyOn(claimLetterService, 'getDetail').and.returnValue(throwError(() => new Error('boom')));
      spyOn(claimLetterService, 'getAllUlbs').and.returnValue(of([]));
      spyOn(claimLetterService, 'getClaimContext').and.returnValue(of(buildClaimContext()));

      fixture.detectChanges();

      expect(component.loadError()).toBe(true);
      expect(component.isLoading()).toBe(false);
      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(jasmine.any(String), 'snackbar-danger');
    });

    it('keeps the spinner until the claim arrives, even when claim-context answers first', async () => {
      await setup('claim-1');
      const detail$ = new Subject<ClaimLetterBatchSummary>();
      spyOn(claimLetterService, 'getDetail').and.returnValue(detail$);
      spyOn(claimLetterService, 'getAllUlbs').and.returnValue(of([]));
      spyOn(claimLetterService, 'getClaimContext').and.returnValue(of(buildClaimContext()));

      fixture.detectChanges();

      expect(component.contextLoading()).toBe(false);
      expect(component.pageLoading()).toBe(true);

      detail$.next(buildClaim());
      detail$.complete();

      expect(component.pageLoading()).toBe(false);
    });

    it('keeps the spinner until claim-context arrives, even when the claim answers first', async () => {
      await setup('claim-1');
      const context$ = new Subject<ClaimLetterClaimContext>();
      spyOn(claimLetterService, 'getDetail').and.returnValue(of(buildClaim()));
      spyOn(claimLetterService, 'getAllUlbs').and.returnValue(of([]));
      spyOn(claimLetterService, 'getClaimContext').and.returnValue(context$);

      fixture.detectChanges();

      expect(component.isLoading()).toBe(false);
      expect(component.pageLoading()).toBe(true);

      context$.next(buildClaimContext());
      context$.complete();

      expect(component.pageLoading()).toBe(false);
    });

    it('saveChanges sends the current expectedRevision and reloads on success', async () => {
      await setupEdit(buildClaim({ revision: 4 }));
      (claimLetterService.getDetail as jasmine.Spy).calls.reset();
      (claimLetterService.getAllUlbs as jasmine.Spy).calls.reset();
      spyOn(claimLetterService, 'updateDraft').and.returnValue(of(buildClaim({ revision: 5 })));

      component.rows.at(0).controls.claimedAmount.setValue(19);
      component.saveChanges();

      expect(claimLetterService.updateDraft).toHaveBeenCalledWith('claim-1', {
        ulbSelections: [{ ulbId: 'ulb-1', claimedAmount: 19 }],
        expectedRevision: 4,
      });
      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(jasmine.any(String), 'snackbar-success');
      // reloadForm-equivalent: reloads real state from the backend rather than hand-patching it
      expect(claimLetterService.getDetail).toHaveBeenCalledWith('claim-1');
      expect(claimLetterService.getAllUlbs).toHaveBeenCalledWith('claim-1');
    });

    it('saveChanges does nothing when no ULB or amount changed', async () => {
      await setupEdit(buildClaim({ revision: 4, hasSignedFile: true }));
      const updateSpy = spyOn(claimLetterService, 'updateDraft');

      component.saveChanges();

      expect(updateSpy).not.toHaveBeenCalled();
      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith('No changes to save.', 'snackbar-warn');
    });

    it('saveChanges asks before a change removes the uploaded signed letter', async () => {
      await setupEdit(buildClaim({ revision: 4, hasSignedFile: true }));
      const confirmSpy = spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(false));
      const updateSpy = spyOn(claimLetterService, 'updateDraft').and.returnValue(of(buildClaim({ revision: 5 })));

      component.rows.at(0).controls.claimedAmount.setValue(19);
      component.saveChanges();
      expect(confirmSpy).toHaveBeenCalledTimes(1);
      expect(updateSpy).not.toHaveBeenCalled();

      confirmSpy.and.returnValue(of(true));
      component.saveChanges();
      expect(updateSpy).toHaveBeenCalledOnceWith('claim-1', {
        ulbSelections: [{ ulbId: 'ulb-1', claimedAmount: 19 }],
        expectedRevision: 4,
      });
    });

    it('saveChanges surfaces a revision-conflict message on failure without reloading', async () => {
      await setupEdit();
      (claimLetterService.getDetail as jasmine.Spy).calls.reset();
      spyOn(claimLetterService, 'updateDraft').and.returnValue(
        throwError(() => ({ success: false, message: 'This claim letter was modified elsewhere. Please reload.' })),
      );

      component.rows.at(0).controls.claimedAmount.setValue(19);
      component.saveChanges();

      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
        'This claim letter was modified elsewhere. Please reload.',
        'snackbar-danger',
      );
      expect(claimLetterService.getDetail).not.toHaveBeenCalled();
    });

    it('maps a bare class-validator message array (no errors map) to the matching row control', async () => {
      await setupEdit(buildClaim({ revision: 4 }));
      spyOn(claimLetterService, 'updateDraft').and.returnValue(
        throwError(() => ({
          success: false,
          message: ['ulbSelections.0.claimedAmount must be an integer number'],
        })),
      );

      component.rows.at(0).controls.claimedAmount.setValue(19);
      component.saveChanges();

      const control = component.rows.at(0).controls.claimedAmount;
      expect(control.errors?.['apiErrors']).toEqual(['ulbSelections.0.claimedAmount must be an integer number']);
    });

    it('surfaces an unmatched bare message via the generic banner instead of dropping it', async () => {
      await setupEdit(buildClaim({ revision: 4 }));
      spyOn(claimLetterService, 'updateDraft').and.returnValue(
        throwError(() => ({
          success: false,
          message: ['expectedRevision must be an integer number'],
        })),
      );

      component.rows.at(0).controls.claimedAmount.setValue(19);
      component.saveChanges();

      expect(component.formLevelErrors()).toEqual(['expectedRevision must be an integer number']);
    });

    it('abandonDraft is a no-op when not editable', async () => {
      await setupEdit(
        buildClaim({ isAbandoned: true, permissions: { canView: true, canEdit: false, canFinalSubmit: false } }),
      );
      const confirmSpy = spyOn(TestBed.inject(ConfirmDialogService), 'confirm');

      component.abandonDraft();

      expect(confirmSpy).not.toHaveBeenCalled();
    });

    it('abandonDraft confirms, then abandons and reloads on success', async () => {
      await setupEdit();
      (claimLetterService.getDetail as jasmine.Spy).calls.reset();
      spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
      spyOn(claimLetterService, 'abandonDraft').and.returnValue(of(buildClaim({ isAbandoned: true })));

      component.abandonDraft();

      expect(claimLetterService.abandonDraft).toHaveBeenCalledWith('claim-1');
      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(jasmine.any(String), 'snackbar-success');
      expect(claimLetterService.getDetail).toHaveBeenCalledWith('claim-1');
    });

    it('abandonDraft does not call the service when the user declines the confirmation', async () => {
      await setupEdit();
      spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(false));
      const abandonSpy = spyOn(claimLetterService, 'abandonDraft');

      component.abandonDraft();

      expect(abandonSpy).not.toHaveBeenCalled();
    });

    // ─── Signed-file upload ─────────────────────────────────────────────────────

    it('builds the signed-file control from the questions returned by getDetail()', async () => {
      await setupEdit(buildClaim({ questions: [SIGNED_FILE_FIELD] }));

      expect(component.signedClaimFileField()).toEqual(SIGNED_FILE_FIELD);
      expect(component.signedFileForm.contains('signedClaimFile')).toBe(true);
    });

    it('leaves the signed-file field unset when getDetail() returns no matching question', async () => {
      await setupEdit(buildClaim({ questions: [] }));

      expect(component.signedClaimFileField()).toBeNull();
      expect(component.signedFileForm.contains('signedClaimFile')).toBe(false);
    });

    it('auto-uploads as soon as the control receives a valid file value', async () => {
      await setupEdit(buildClaim({ questions: [SIGNED_FILE_FIELD] }));
      (claimLetterService.getDetail as jasmine.Spy).calls.reset();
      spyOn(claimLetterService, 'uploadSignedFile').and.returnValue(of(buildClaim({ hasSignedFile: true })));

      (component.signedFileForm.get('signedClaimFile') as AbstractControl<unknown>).setValue(SAMPLE_FILE_METADATA);

      expect(claimLetterService.uploadSignedFile).toHaveBeenCalledWith('claim-1', SAMPLE_FILE_METADATA);
      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(jasmine.any(String), 'snackbar-success');
      expect(claimLetterService.getDetail).toHaveBeenCalledWith('claim-1'); // reloaded, not hand-patched
    });

    it('never uploads when the control value is cleared to null', async () => {
      await setupEdit(buildClaim({ questions: [SIGNED_FILE_FIELD] }));
      const uploadSpy = spyOn(claimLetterService, 'uploadSignedFile');

      (component.signedFileForm.get('signedClaimFile') as AbstractControl<unknown>).setValue(null);

      expect(uploadSpy).not.toHaveBeenCalled();
    });

    it('resets the control and surfaces the backend message when the upload fails', async () => {
      await setupEdit(buildClaim({ questions: [SIGNED_FILE_FIELD] }));
      spyOn(claimLetterService, 'uploadSignedFile').and.returnValue(
        throwError(() => ({ success: false, message: 'File exceeds the maximum allowed size.' })),
      );

      (component.signedFileForm.get('signedClaimFile') as AbstractControl<unknown>).setValue(SAMPLE_FILE_METADATA);

      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
        'File exceeds the maximum allowed size.',
        'snackbar-danger',
      );
      expect(component.signedFileForm.get('signedClaimFile')?.value).toBeNull();
    });

    // ─── Letter details & Preview ──────────────────────────────────────────────────

    describe('Letter details & Preview', () => {
      const SIGNED_FILE_FIELD_WITH_ACTION: ConditionalFieldConfig = {
        ...SIGNED_FILE_FIELD,
        supportingContent: [
          {
            type: 'actions',
            position: 'before',
            layout: 'inline',
            separator: 'dot',
            description: 'Fill in the letter details, preview and download the claim letter.',
            actions: [
              {
                id: 'preview-template',
                label: 'Letter details & Preview',
                icon: 'bi bi-pencil-square',
                tone: 'primary',
                visible: true,
              },
            ],
          },
        ],
      };

      function dialogCloses(result: unknown): void {
        dialogOpenSpy.and.returnValue({ afterClosed: () => of(result) });
      }

      it('onSupportingAction ignores events for fields other than signedClaimFile', async () => {
        await setupEdit(buildClaim({ questions: [SIGNED_FILE_FIELD] }));

        component.onSupportingAction({ fieldKey: 'someOtherField', actionId: 'preview-template' });

        expect(dialogOpenSpy).not.toHaveBeenCalled();
      });

      it('opens the letter editor full-screen with the claim id; only Close dismisses it', async () => {
        await setupEdit(buildClaim({ questions: [SIGNED_FILE_FIELD] }));

        component.onSupportingAction({ fieldKey: 'signedClaimFile', actionId: 'preview-template' });

        expect(dialogOpenSpy).toHaveBeenCalledOnceWith(
          ClaimLetterDocumentPreviewDialogComponent,
          jasmine.objectContaining({
            data: { claimLetterId: 'claim-1' },
            disableClose: true,
            width: '100vw',
            panelClass: jasmine.arrayContaining(['cl-fullscreen-dialog-panel']),
          }),
        );
      });

      it('refreshes only the summary (not every ULB page) after the dialog saved something', async () => {
        await setupEdit(buildClaim({ questions: [SIGNED_FILE_FIELD] }));
        (claimLetterService.getDetail as jasmine.Spy).calls.reset();
        (claimLetterService.getAllUlbs as jasmine.Spy).calls.reset();
        dialogCloses({ saved: true });

        component.previewTemplate();

        expect(claimLetterService.getDetail).toHaveBeenCalledOnceWith('claim-1');
        expect(claimLetterService.getAllUlbs).not.toHaveBeenCalled();
      });

      it('does not refresh when the dialog closes without saving', async () => {
        await setupEdit(buildClaim({ questions: [SIGNED_FILE_FIELD] }));
        (claimLetterService.getDetail as jasmine.Spy).calls.reset();
        dialogCloses({ saved: false });

        component.previewTemplate();

        expect(claimLetterService.getDetail).not.toHaveBeenCalled();
      });

      it('clears the signed-file control once a refresh shows the file was removed', async () => {
        await setupEdit(buildClaim({ questions: [SIGNED_FILE_FIELD], hasSignedFile: true }));
        const control = component.signedFileForm.get('signedClaimFile') as AbstractControl<unknown>;
        control.setValue(SAMPLE_FILE_METADATA, { emitEvent: false });
        (claimLetterService.getDetail as jasmine.Spy).and.returnValue(
          of(buildClaim({ questions: [SIGNED_FILE_FIELD], hasSignedFile: false })),
        );
        dialogCloses({ saved: true });

        component.previewTemplate();

        expect(control.value).toBeNull();
        expect(component.claim()?.hasSignedFile).toBeFalse();
      });

      it('hasUnsavedRowChanges() is false right after load and true once a claimed amount is edited', async () => {
        await setupEdit(buildClaim({ questions: [SIGNED_FILE_FIELD] }));

        expect(component.hasUnsavedRowChanges()).toBe(false);

        component.rows.at(0).controls.claimedAmount.setValue(99);

        expect(component.hasUnsavedRowChanges()).toBe(true);
      });

      it('effectiveSignedClaimFileField() disables the action and swaps the description while dirty', async () => {
        await setupEdit(buildClaim({ questions: [SIGNED_FILE_FIELD_WITH_ACTION] }));

        expect(component.effectiveSignedClaimFileField()).toBe(component.signedClaimFileField());

        component.rows.at(0).controls.claimedAmount.setValue(99);

        const actionsBlock = component
          .effectiveSignedClaimFileField()
          ?.supportingContent?.find(
            (block): block is Extract<FieldSupportingContent, { type: 'actions' }> => block.type === 'actions',
          );
        expect(actionsBlock?.description).toBe('Save your changes to update the claim letter preview.');
        expect(actionsBlock?.actions.every((action) => action.disabled)).toBe(true);
        expect(
          (component.signedClaimFileField()?.supportingContent?.[0] as { actions: { disabled?: boolean }[] }).actions[0]
            .disabled,
        ).toBeFalsy();
      });

      it('onSupportingAction is a no-op while there are unsaved edits', async () => {
        await setupEdit(buildClaim({ questions: [SIGNED_FILE_FIELD] }));
        component.rows.at(0).controls.claimedAmount.setValue(99);

        component.onSupportingAction({ fieldKey: 'signedClaimFile', actionId: 'preview-template' });

        expect(dialogOpenSpy).not.toHaveBeenCalled();
      });
    });

    // ─── Final claim letter and Submit ───────────────────────────────────────────

    const FINAL_PDF: ClaimLetterFinalPdf = {
      sourceKey: 'key-1',
      fileName: 'CF_Test-State_Claim-letter-1-1_2026-27.pdf',
      included: ['Signed claim letter', 'Copy of GTC'],
      missing: [],
      missingRequired: [],
      pageCount: 4,
      builtAt: '2026-10-28T10:00:00.000Z',
    };

    /** A signed draft whose final claim letter card has loaded. */
    async function setupSigned(overrides: Partial<ClaimLetterBatchSummary> = {}): Promise<void> {
      await setup('claim-1');
      // A new object per call, like an HTTP response (the card re-checks on every new summary).
      spyOn(claimLetterService, 'getDetail').and.callFake(() =>
        of(buildClaim({ hasSignedFile: true, finalClaimLetterStage: 'DRAFT', ...overrides })),
      );
      spyOn(claimLetterService, 'getAllUlbs').and.returnValue(of(SAVED_ULB_ROWS));
      spyOn(claimLetterService, 'getClaimContext').and.returnValue(of(buildClaimContext()));
      spyOn(claimLetterService, 'getFinalPdf').and.returnValue(of(FINAL_PDF));
      fixture.detectChanges();
      fixture.detectChanges();
    }

    function submitButton(): HTMLButtonElement {
      return fixture.debugElement.query(By.css('[data-cy="claim-letter-detail-submit"]')).nativeElement;
    }

    it('shows no final claim letter and keeps Submit off until the signed letter is uploaded', async () => {
      await setupEdit(buildClaim({ hasSignedFile: false }));

      component.submitToMohua();

      expect(fixture.debugElement.query(By.css('app-claim-letter-final-claim-letter'))).toBeNull();
      expect(submitButton().disabled).toBeTrue();
      expect(dialogOpenSpy).not.toHaveBeenCalled();
    });

    it('shows the final claim letter card once signed and enables Submit when its copy is ready', async () => {
      await setupSigned();

      expect(claimLetterService.getFinalPdf).toHaveBeenCalledWith('claim-1');
      expect(fixture.debugElement.query(By.css('[data-cy="claim-letter-final"]'))).not.toBeNull();
      expect(component.submittableFinalPdf()).toEqual(FINAL_PDF);
      expect(submitButton().disabled).toBeFalse();
      expect(submitButton().textContent).toContain('Submit to MoHUA');
    });

    it('keeps Submit off while a required document is missing', async () => {
      await setup('claim-1');
      spyOn(claimLetterService, 'getDetail').and.callFake(() =>
        of(buildClaim({ hasSignedFile: true, finalClaimLetterStage: 'DRAFT' })),
      );
      spyOn(claimLetterService, 'getAllUlbs').and.returnValue(of(SAVED_ULB_ROWS));
      spyOn(claimLetterService, 'getClaimContext').and.returnValue(of(buildClaimContext()));
      spyOn(claimLetterService, 'getFinalPdf').and.returnValue(of({ ...FINAL_PDF, missingRequired: ['Copy of GTC'] }));
      fixture.detectChanges();
      fixture.detectChanges();

      expect(component.submittableFinalPdf()).toBeNull();
      expect(submitButton().disabled).toBeTrue();
    });

    it('confirms with the page count, then submits the shown copy and reloads', async () => {
      await setupSigned();
      (claimLetterService.getDetail as jasmine.Spy).calls.reset();
      spyOn(claimLetterService, 'submit').and.returnValue(of(buildClaim({ currentFormStatus: 5 })));
      dialogOpenSpy.and.returnValue({ afterClosed: () => of(true) });

      component.submitToMohua();

      expect(dialogOpenSpy).toHaveBeenCalledOnceWith(
        ConfirmDialogComponent,
        jasmine.objectContaining({
          data: jasmine.objectContaining({
            message:
              'Submit the final claim letter (4 pages) to MoHUA? You cannot edit it after submission unless MoHUA returns it.',
          }),
        }),
      );
      expect(claimLetterService.submit).toHaveBeenCalledOnceWith('claim-1', 'key-1');
      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(jasmine.any(String), 'snackbar-success');
      expect(claimLetterService.getDetail).toHaveBeenCalledWith('claim-1');
    });

    it('tells the State how many ULBs rely on an exemption still under MoHUA review', async () => {
      await setupSigned({ exemptionUnderReviewUlbCount: 2 });
      dialogOpenSpy.and.returnValue({ afterClosed: () => of(false) });

      component.submitToMohua();

      expect(dialogOpenSpy).toHaveBeenCalledOnceWith(
        ConfirmDialogComponent,
        jasmine.objectContaining({
          data: jasmine.objectContaining({
            message:
              'Submit the final claim letter (4 pages) to MoHUA? You cannot edit it after submission unless MoHUA ' +
              'returns it. 2 ULBs in this claim rely on exemption requests under MoHUA review. MoHUA decides ' +
              'them during the claim review.',
          }),
        }),
      );
    });

    it("also names the State's own exemption request still under MoHUA review", async () => {
      await setupSigned({
        exemptionUnderReviewUlbCount: 1,
        stateExemptionsUnderReview: ['State Finance Commission (SFC)'],
      });
      dialogOpenSpy.and.returnValue({ afterClosed: () => of(false) });

      component.submitToMohua();

      expect(dialogOpenSpy).toHaveBeenCalledOnceWith(
        ConfirmDialogComponent,
        jasmine.objectContaining({
          data: jasmine.objectContaining({
            message:
              'Submit the final claim letter (4 pages) to MoHUA? You cannot edit it after submission unless MoHUA ' +
              "returns it. The State's exemption request for State Finance Commission (SFC) is under MoHUA review. " +
              '1 ULB in this claim relies on exemption requests under MoHUA review. MoHUA decides them during the ' +
              'claim review.',
          }),
        }),
      );
    });

    it('does not submit when the confirm is cancelled', async () => {
      await setupSigned();
      spyOn(claimLetterService, 'submit');
      dialogOpenSpy.and.returnValue({ afterClosed: () => of(false) });

      component.submitToMohua();

      expect(claimLetterService.submit).not.toHaveBeenCalled();
    });

    it('disables Abandon Draft and Save Changes while Submit is in flight', async () => {
      await setupSigned();
      spyOn(claimLetterService, 'submit').and.returnValue(new Subject<ClaimLetterBatchSummary>());
      dialogOpenSpy.and.returnValue({ afterClosed: () => of(true) });
      const button = (cy: string) =>
        fixture.debugElement.query(By.css(`[data-cy="${cy}"]`)).nativeElement as HTMLButtonElement;
      expect(button('claim-letter-detail-abandon').disabled).toBeFalse();
      expect(button('claim-letter-detail-save').disabled).toBeFalse();

      component.submitToMohua();
      fixture.detectChanges();

      expect(component.isSubmitting()).toBeTrue();
      expect(button('claim-letter-detail-abandon').disabled).toBeTrue();
      expect(button('claim-letter-detail-save').disabled).toBeTrue();
    });

    it('when the documents changed, warns and refreshes so the card loads the updated copy', async () => {
      await setupSigned();
      (claimLetterService.getDetail as jasmine.Spy).calls.reset();
      spyOn(claimLetterService, 'submit').and.returnValue(
        throwError(() => ({ error: { message: 'Changed.', code: 'FINAL_PDF_OUTDATED' } })),
      );
      dialogOpenSpy.and.returnValue({ afterClosed: () => of(true) });

      component.submitToMohua();
      fixture.detectChanges();

      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
        jasmine.stringContaining('documents changed'),
        'snackbar-warn',
      );
      expect(claimLetterService.getDetail).toHaveBeenCalledWith('claim-1');
      expect(claimLetterService.getFinalPdf).toHaveBeenCalledTimes(2);
      expect(component.isSubmitting()).toBeFalse();
    });

    it('after Submit, shows the submitted copy in place of the upload field', async () => {
      await setupSigned({
        currentFormStatus: 5,
        finalClaimLetterStage: 'SUBMITTED',
        submittedAt: '2026-10-28T10:00:00.000Z',
        questions: [SIGNED_FILE_FIELD],
        permissions: { canView: true, canEdit: false, canFinalSubmit: false },
      });

      const card = fixture.debugElement.query(By.css('[data-cy="claim-letter-final"]'));
      expect(card.nativeElement.textContent).toContain('Submitted claim letter');
      expect(fixture.debugElement.query(By.css('app-dynamic-form'))).toBeNull();
      expect(component.submittableFinalPdf()).toBeNull();
    });

    it('blocks Submit with a reason while the mandatory letter details are incomplete', async () => {
      await setupEdit(buildClaim({ hasSignedFile: true, letterDetailsComplete: false }));
      fixture.detectChanges();

      component.submitToMohua();

      expect(dialogOpenSpy).not.toHaveBeenCalled();
      expect(component.submitBlockedReason()).toContain('letter details');
      const submitButton = fixture.debugElement.query(By.css('[data-cy="claim-letter-detail-submit"]'));
      expect((submitButton.nativeElement as HTMLButtonElement).disabled).toBeTrue();
      expect(fixture.debugElement.query(By.css('[data-cy="claim-letter-submit-blocked"]'))).not.toBeNull();
    });

    it('shows why the batch is blocked by another active batch', async () => {
      await setupEdit(
        buildClaim({
          hasSignedFile: true,
          blockedByBatchNumber: 1,
          blockedReason: 'Only one claim batch can be processed at a time. Batch 1 is still in progress.',
          permissions: { canView: true, canEdit: true, canFinalSubmit: false },
        }),
      );
      fixture.detectChanges();

      const alert = fixture.debugElement.query(By.css('[data-cy="claim-letter-submit-blocked"]'));
      expect(alert.nativeElement.textContent).toContain('Batch 1');
      expect(fixture.debugElement.query(By.css('[data-cy="claim-letter-detail-submit"]'))).toBeNull();
    });

    // ─── Final-batch completeness guard (FE's first line of defense; BE is the real authority) ───

    it('finalBatchIncomplete is true on the last batch slot while ULBs remain unclaimed', async () => {
      await setup('claim-1');
      spyOn(claimLetterService, 'getDetail').and.returnValue(of(buildClaim({ batchNumber: 3, hasSignedFile: true })));
      spyOn(claimLetterService, 'getAllUlbs').and.returnValue(of(SAVED_ULB_ROWS));
      spyOn(claimLetterService, 'getClaimContext').and.returnValue(
        of(buildClaimContext({ batchSlotsMax: 3, remainingUlbCount: 2 })),
      );
      fixture.detectChanges();

      expect(component.finalBatchIncomplete()).toBeTrue();
    });

    it('finalBatchIncomplete is false once no ULBs remain unclaimed, even on the last batch slot', async () => {
      await setup('claim-1');
      spyOn(claimLetterService, 'getDetail').and.returnValue(of(buildClaim({ batchNumber: 3, hasSignedFile: true })));
      spyOn(claimLetterService, 'getAllUlbs').and.returnValue(of(SAVED_ULB_ROWS));
      spyOn(claimLetterService, 'getClaimContext').and.returnValue(
        of(buildClaimContext({ batchSlotsMax: 3, remainingUlbCount: 0 })),
      );
      fixture.detectChanges();

      expect(component.finalBatchIncomplete()).toBeFalse();
    });

    it('finalBatchIncomplete is false on a non-final batch, even with ULBs still unclaimed', async () => {
      await setup('claim-1');
      spyOn(claimLetterService, 'getDetail').and.returnValue(of(buildClaim({ batchNumber: 1, hasSignedFile: true })));
      spyOn(claimLetterService, 'getAllUlbs').and.returnValue(of(SAVED_ULB_ROWS));
      spyOn(claimLetterService, 'getClaimContext').and.returnValue(
        of(buildClaimContext({ batchSlotsMax: 3, remainingUlbCount: 2 })),
      );
      fixture.detectChanges();

      expect(component.finalBatchIncomplete()).toBeFalse();
    });

    it('disables the submit button and shows the inline warning when finalBatchIncomplete', async () => {
      await setup('claim-1');
      spyOn(claimLetterService, 'getDetail').and.returnValue(of(buildClaim({ batchNumber: 3, hasSignedFile: true })));
      spyOn(claimLetterService, 'getAllUlbs').and.returnValue(of(SAVED_ULB_ROWS));
      spyOn(claimLetterService, 'getClaimContext').and.returnValue(
        of(buildClaimContext({ batchSlotsMax: 3, remainingUlbCount: 4 })),
      );
      fixture.detectChanges();

      const submitButton = fixture.debugElement.query(By.css('[data-cy="claim-letter-detail-submit"]'));
      expect((submitButton.nativeElement as HTMLButtonElement).disabled).toBeTrue();
      const warning = fixture.debugElement.query(By.css('[data-cy="claim-letter-final-batch-blocked"]'));
      expect(warning).not.toBeNull();
      expect(warning.nativeElement.textContent).toContain('4');
    });

    it('submitToMohua is a no-op when finalBatchIncomplete, even if somehow invoked', async () => {
      await setup('claim-1');
      spyOn(claimLetterService, 'getDetail').and.returnValue(of(buildClaim({ batchNumber: 3, hasSignedFile: true })));
      spyOn(claimLetterService, 'getAllUlbs').and.returnValue(of(SAVED_ULB_ROWS));
      spyOn(claimLetterService, 'getClaimContext').and.returnValue(
        of(buildClaimContext({ batchSlotsMax: 3, remainingUlbCount: 2 })),
      );
      fixture.detectChanges();

      component.submitToMohua();

      expect(dialogOpenSpy).not.toHaveBeenCalled();
    });

    // ─── Status stepper ───────────────────────────────────────────────────────────

    it('exposes the claim status as a FormStatusValue for the stepper', async () => {
      await setupEdit(buildClaim({ currentFormStatus: 5 }));
      expect(component.currentFormStatusValue()).toBe(5);
    });
  });
});
