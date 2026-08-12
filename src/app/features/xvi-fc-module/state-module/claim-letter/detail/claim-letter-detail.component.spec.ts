import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, throwError } from 'rxjs';
import { UtilityService } from '../../../../../core/services/utility.service';
import { ConfirmDialogService } from '../../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { UploadedFileMetadata } from '../../../../../shared/dynamic-form/components/file/file-metadata.types';
import { FieldSupportingContent } from '../../../../../shared/dynamic-form/field.interface';
import { ConditionalFieldConfig } from '../../../dynamic-form-visibility.service';
import { XvifcModuleService } from '../../../xvi-fc-module.service';
import { createClaimUlbRowGroup } from '../components/claim-ulb-table/claim-ulb-table.component';
import { ClaimLetterDocumentPreviewDialogComponent } from '../components/document-preview-dialog/claim-letter-document-preview-dialog.component';
import {
  ClaimLetterBatchSummary,
  ClaimLetterClaimContext,
  ClaimLetterDocumentData,
  ClaimLetterUlbRow,
} from '../claim-letter.models';
import { ClaimLetterService } from '../claim-letter.service';
import { formatCrore } from '../claim-letter.utils';
import FileSaver from 'file-saver';
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
      expect(narrative[2]).toContain('10 Cr.'); // 15 (availableToClaim) - 5 (live claim)
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
      expect(narrative[2]).toContain(formatCrore(25 - 5 - 0 - 0 - 21));
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
        buildClaim({ currentFormStatus: 2, isAbandoned: false, permissions: { canView: true, canEdit: true, canFinalSubmit: true } }),
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

    it('saveChanges surfaces a revision-conflict message on failure without reloading', async () => {
      await setupEdit();
      (claimLetterService.getDetail as jasmine.Spy).calls.reset();
      spyOn(claimLetterService, 'updateDraft').and.returnValue(
        throwError(() => ({ success: false, message: 'This claim letter was modified elsewhere. Please reload.' })),
      );

      component.saveChanges();

      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
        'This claim letter was modified elsewhere. Please reload.',
        'snackbar-danger',
      );
      expect(claimLetterService.getDetail).not.toHaveBeenCalled();
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

    // ─── Preview / Download Template ───────────────────────────────────────────────

    describe('Preview Template / Download Template', () => {
      const SIGNED_FILE_FIELD_WITH_ACTIONS: ConditionalFieldConfig = {
        ...SIGNED_FILE_FIELD,
        supportingContent: [
          {
            type: 'actions',
            position: 'before',
            layout: 'inline',
            separator: 'dot',
            description: 'Preview or download the claim letter for this batch, then upload the signed copy below.',
            actions: [
              { id: 'preview-template', label: 'Preview Template', icon: 'bi bi-eye', tone: 'primary', visible: true },
              {
                id: 'download-template',
                label: 'Download Template',
                icon: 'bi bi-file-earmark-arrow-down',
                tone: 'primary',
                visible: true,
              },
            ],
          },
        ],
      };

      const sampleDocumentData: ClaimLetterDocumentData = {
        refNo: 'CL/AP/2026-27/1-1',
        letterDate: '2026-06-30T00:00:00.000Z',
        stateName: 'Andhra Pradesh',
        departmentName: 'Directorate of Municipal Administration',
        designYearLabel: '2026-27',
        installment: 1,
        batchNumber: 1,
        priorFcCycleLabel: '14th FC',
        subjectLine: 'Subject',
        introParagraph: 'Intro',
        closingParagraph: 'Closing',
        signatoryName: 'Vikram Rao',
        signatoryDesignation: 'Finance Analyst',
        coveringLetterRows: [],
        totalClaimAmount: 0,
        annexure1Rows: [],
        annexure2Columns: [],
        annexure2Rows: [],
      };

      it('onSupportingAction ignores events for fields other than signedClaimFile', async () => {
        await setupEdit(buildClaim({ questions: [SIGNED_FILE_FIELD] }));
        const getDocumentDataSpy = spyOn(claimLetterService, 'getDocumentData');

        component.onSupportingAction({ fieldKey: 'someOtherField', actionId: 'preview-template' });

        expect(getDocumentDataSpy).not.toHaveBeenCalled();
      });

      it('onSupportingAction routes preview-template to previewTemplate()', async () => {
        await setupEdit(buildClaim({ questions: [SIGNED_FILE_FIELD] }));
        spyOn(claimLetterService, 'getDocumentData').and.returnValue(of(sampleDocumentData));

        component.onSupportingAction({ fieldKey: 'signedClaimFile', actionId: 'preview-template' });

        expect(claimLetterService.getDocumentData).toHaveBeenCalledWith('claim-1');
        expect(dialogOpenSpy).toHaveBeenCalledOnceWith(
          ClaimLetterDocumentPreviewDialogComponent,
          jasmine.objectContaining({ data: { documentData: sampleDocumentData } }),
        );
      });

      it('onSupportingAction routes download-template to downloadTemplate()', async () => {
        await setupEdit(buildClaim({ questions: [SIGNED_FILE_FIELD] }));
        spyOn(claimLetterService, 'getDocumentData').and.returnValue(of(sampleDocumentData));
        const sampleBlob = new Blob(['pdf-bytes'], { type: 'application/pdf' });
        spyOn(claimLetterService, 'downloadDocumentPdf').and.returnValue(of(sampleBlob));
        const saveAsSpy = spyOn(FileSaver, 'saveAs');

        component.onSupportingAction({ fieldKey: 'signedClaimFile', actionId: 'download-template' });

        expect(claimLetterService.getDocumentData).toHaveBeenCalledWith('claim-1');
        expect(claimLetterService.downloadDocumentPdf).toHaveBeenCalledWith('claim-1');
        expect(saveAsSpy).toHaveBeenCalledWith(sampleBlob, 'claim-letter-CL-AP-2026-27-1-1.pdf');
      });

      it('shares one fetch between previewTemplate() and downloadTemplate() (single-flight cache)', async () => {
        await setupEdit(buildClaim({ questions: [SIGNED_FILE_FIELD] }));
        const getDocumentDataSpy = spyOn(claimLetterService, 'getDocumentData').and.returnValue(of(sampleDocumentData));
        spyOn(claimLetterService, 'downloadDocumentPdf').and.returnValue(
          of(new Blob(['pdf-bytes'], { type: 'application/pdf' })),
        );
        spyOn(FileSaver, 'saveAs');

        component.previewTemplate();
        component.downloadTemplate();

        expect(getDocumentDataSpy).toHaveBeenCalledTimes(1);
      });

      it('previewTemplate() surfaces an error snackbar and does not open the dialog on failure', async () => {
        await setupEdit(buildClaim({ questions: [SIGNED_FILE_FIELD] }));
        spyOn(claimLetterService, 'getDocumentData').and.returnValue(
          throwError(() => ({ success: false, message: 'Not found.' })),
        );

        component.previewTemplate();

        expect(dialogOpenSpy).not.toHaveBeenCalled();
        expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(jasmine.any(String), 'snackbar-danger');
      });

      it('invalidates the cached document once the claim revision changes after a reload (e.g. a save)', async () => {
        await setupEdit(buildClaim({ questions: [SIGNED_FILE_FIELD], revision: 2 }));
        const getDocumentDataSpy = spyOn(claimLetterService, 'getDocumentData').and.returnValue(
          of(sampleDocumentData),
        );

        component.previewTemplate();
        expect(getDocumentDataSpy).toHaveBeenCalledTimes(1);

        // Simulate the post-save reload: loadDetail() re-fetches getDetail(), which now reflects the
        // bumped revision from the edited/saved claimed amounts.
        (claimLetterService.getDetail as jasmine.Spy).and.returnValue(
          of(buildClaim({ questions: [SIGNED_FILE_FIELD], revision: 3 })),
        );
        component.loadDetail();

        component.previewTemplate();
        expect(getDocumentDataSpy).toHaveBeenCalledTimes(2);
      });

      it('hasUnsavedRowChanges() is false right after load and true once a claimed amount is edited', async () => {
        await setupEdit(buildClaim({ questions: [SIGNED_FILE_FIELD] }));

        expect(component.hasUnsavedRowChanges()).toBe(false);

        component.rows.at(0).controls.claimedAmount.setValue(99);

        expect(component.hasUnsavedRowChanges()).toBe(true);
      });

      it('effectiveSignedClaimFileField() disables Preview/Download and swaps the description while dirty', async () => {
        await setupEdit(buildClaim({ questions: [SIGNED_FILE_FIELD_WITH_ACTIONS] }));

        expect(component.effectiveSignedClaimFileField()).toBe(component.signedClaimFileField());

        component.rows.at(0).controls.claimedAmount.setValue(99);

        const actionsBlock = component
          .effectiveSignedClaimFileField()
          ?.supportingContent?.find(
            (block): block is Extract<FieldSupportingContent, { type: 'actions' }> => block.type === 'actions',
          );
        expect(actionsBlock?.description).toBe('Save your changes to update the claim letter preview and download.');
        expect(actionsBlock?.actions.every((action) => action.disabled)).toBe(true);

        // Unaffected: the backend-supplied field config itself is never mutated.
        expect(
          (component.signedClaimFileField()?.supportingContent?.[0] as { actions: { disabled?: boolean }[] })
            .actions[0].disabled,
        ).toBeFalsy();
      });

      function findAction(actionId: string) {
        const block = component
          .effectiveSignedClaimFileField()
          ?.supportingContent?.find(
            (b): b is Extract<FieldSupportingContent, { type: 'actions' }> => b.type === 'actions',
          );
        return block?.actions.find((a) => a.id === actionId);
      }

      it('previewTemplate() shows loading only on preview-template while in flight, then clears it', async () => {
        await setupEdit(buildClaim({ questions: [SIGNED_FILE_FIELD_WITH_ACTIONS] }));
        const pending = new Subject<ClaimLetterDocumentData>();
        spyOn(claimLetterService, 'getDocumentData').and.returnValue(pending);

        component.previewTemplate();

        expect(findAction('preview-template')?.loading).toBeTrue();
        expect(findAction('preview-template')?.loadingLabel).toBe('Loading preview…');
        expect(findAction('download-template')?.loading).toBeFalsy();

        pending.next(sampleDocumentData);
        pending.complete();

        expect(findAction('preview-template')?.loading).toBeFalsy();
        expect(dialogOpenSpy).toHaveBeenCalledOnceWith(
          ClaimLetterDocumentPreviewDialogComponent,
          jasmine.objectContaining({ data: { documentData: sampleDocumentData } }),
        );
      });

      it('downloadTemplate() shows loading only on download-template while in flight, then clears it', async () => {
        await setupEdit(buildClaim({ questions: [SIGNED_FILE_FIELD_WITH_ACTIONS] }));
        spyOn(claimLetterService, 'getDocumentData').and.returnValue(of(sampleDocumentData));
        const pending = new Subject<Blob>();
        spyOn(claimLetterService, 'downloadDocumentPdf').and.returnValue(pending);
        spyOn(FileSaver, 'saveAs');

        component.downloadTemplate();

        expect(findAction('download-template')?.loading).toBeTrue();
        expect(findAction('download-template')?.loadingLabel).toBe('Preparing download…');
        expect(findAction('preview-template')?.loading).toBeFalsy();

        pending.next(new Blob(['pdf-bytes'], { type: 'application/pdf' }));
        pending.complete();

        expect(findAction('download-template')?.loading).toBeFalsy();
        expect(FileSaver.saveAs).toHaveBeenCalled();
      });

      it('never shows loading on either action while there are unsaved changes (both are disabled instead)', async () => {
        await setupEdit(buildClaim({ questions: [SIGNED_FILE_FIELD_WITH_ACTIONS] }));

        component.rows.at(0).controls.claimedAmount.setValue(99);

        expect(findAction('preview-template')?.disabled).toBeTrue();
        expect(findAction('download-template')?.disabled).toBeTrue();
        expect(findAction('preview-template')?.loading).toBeFalsy();
        expect(findAction('download-template')?.loading).toBeFalsy();
      });

      it('onSupportingAction is a no-op for preview-template/download-template while there are unsaved edits', async () => {
        await setupEdit(buildClaim({ questions: [SIGNED_FILE_FIELD] }));
        const getDocumentDataSpy = spyOn(claimLetterService, 'getDocumentData').and.returnValue(of(sampleDocumentData));
        component.rows.at(0).controls.claimedAmount.setValue(99);

        component.onSupportingAction({ fieldKey: 'signedClaimFile', actionId: 'preview-template' });
        component.onSupportingAction({ fieldKey: 'signedClaimFile', actionId: 'download-template' });

        expect(getDocumentDataSpy).not.toHaveBeenCalled();
      });
    });

    // ─── Submit to MoHUA ──────────────────────────────────────────────────────────

    it('submitToMohua is a no-op when no signed file has been uploaded yet', async () => {
      await setupEdit(buildClaim({ hasSignedFile: false }));
      const confirmSpy = spyOn(TestBed.inject(ConfirmDialogService), 'confirm');

      component.submitToMohua();

      expect(confirmSpy).not.toHaveBeenCalled();
    });

    it('submitToMohua confirms, then submits and reloads on success', async () => {
      await setupEdit(buildClaim({ hasSignedFile: true }));
      (claimLetterService.getDetail as jasmine.Spy).calls.reset();
      spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
      spyOn(claimLetterService, 'submit').and.returnValue(of(buildClaim({ currentFormStatus: 5 })));

      component.submitToMohua();

      expect(claimLetterService.submit).toHaveBeenCalledWith('claim-1');
      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(jasmine.any(String), 'snackbar-success');
      expect(claimLetterService.getDetail).toHaveBeenCalledWith('claim-1');
    });

    it('submitToMohua does not call the service when the user declines the confirmation', async () => {
      await setupEdit(buildClaim({ hasSignedFile: true }));
      spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(false));
      const submitSpy = spyOn(claimLetterService, 'submit');

      component.submitToMohua();

      expect(submitSpy).not.toHaveBeenCalled();
    });

    it('submitToMohua surfaces the backend message on failure', async () => {
      await setupEdit(buildClaim({ hasSignedFile: true }));
      spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
      spyOn(claimLetterService, 'submit').and.returnValue(
        throwError(() => ({ success: false, message: 'Eligibility gate is no longer satisfied.' })),
      );

      component.submitToMohua();

      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
        'Eligibility gate is no longer satisfied.',
        'snackbar-danger',
      );
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
      const confirmSpy = spyOn(TestBed.inject(ConfirmDialogService), 'confirm');

      component.submitToMohua();

      expect(confirmSpy).not.toHaveBeenCalled();
    });

    // ─── Status stepper ───────────────────────────────────────────────────────────

    it('exposes the claim status as a FormStatusValue for the stepper', async () => {
      await setupEdit(buildClaim({ currentFormStatus: 5 }));
      expect(component.currentFormStatusValue()).toBe(5);
    });
  });
});
