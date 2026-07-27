import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { UtilityService } from '../../../../../core/services/utility.service';
import { ConfirmDialogService } from '../../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { UploadedFileMetadata } from '../../../../../shared/dynamic-form/components/file/file-metadata.types';
import { ConditionalFieldConfig } from '../../../dynamic-form-visibility.service';
import { XvifcModuleService } from '../../../xvi-fc-module.service';
import { createClaimUlbRowGroup } from '../components/claim-ulb-table/claim-ulb-table.component';
import { ClaimLetterBatchSummary, ClaimLetterEligibilitySummary, ClaimLetterUlbRow } from '../claim-letter.models';
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
    ...overrides,
  };
}

function buildEligibility(overrides: Partial<ClaimLetterEligibilitySummary> = {}): ClaimLetterEligibilitySummary {
  return {
    installment: 1,
    stateLevelGate: { passed: true, sources: [] },
    expectedUlbCount: 10,
    batchSlotsUsed: 0,
    batchSlotsMax: 3,
    nextBatchNumber: 1,
    financialOverview: { totalInstallmentAllocation: 25, totalAlreadyAcknowledged: 5 },
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

  async function setup(routeParam: string | null): Promise<void> {
    localStorage.setItem('userData', JSON.stringify({ state: 'state-test-id' }));

    const moduleService = jasmine.createSpyObj<XvifcModuleService>('XvifcModuleService', ['yearId']);
    moduleService.yearId.and.returnValue('year-test-id');

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, ClaimLetterDetailComponent],
      providers: [
        { provide: XvifcModuleService, useValue: moduleService },
        { provide: ActivatedRoute, useValue: routeWithParam(routeParam) },
      ],
    }).compileComponents();

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
      spyOn(claimLetterService, 'getEligibilitySummary').and.returnValue(of(buildEligibility()));
      fixture.detectChanges();
    });

    it('is create mode with no claimLetterId and editable by default', () => {
      expect(component.isCreateMode).toBe(true);
      expect(component.claimLetterId()).toBeNull();
      expect(component.canEdit()).toBe(true);
    });

    it('loads the state-wide financial overview (but never getDetail/getUlbs) on init', () => {
      expect(claimLetterService.getEligibilitySummary).toHaveBeenCalledWith('state-test-id', 'year-test-id', 1);
      expect(component.summaryTiles()).toEqual([
        { label: 'Total Allocation', value: 25 },
        { label: 'Already Claimed (Acknowledged)', value: 5 },
        { label: 'Available to Claim', value: 20 },
      ]);
    });

    it('shows no summary tiles when the financial overview has not loaded (e.g. the request failed)', () => {
      component.eligibilityOverview.set(null);
      expect(component.summaryTiles()).toEqual([]);
    });

    it('breadcrumb reads Claim Letter > New Claim Letter, linking back to the list', () => {
      expect(component.breadcrumbLinks()).toEqual([
        { label: 'Claim Letter', routerLink: ['/xvifc', 'year-test-id', 'claim-letter'] },
        { label: 'New Claim Letter' },
      ]);
    });

    it('never calls getDetail/getUlbs on init', () => {
      const getDetailSpy = spyOn(claimLetterService, 'getDetail');
      const getUlbsSpy = spyOn(claimLetterService, 'getUlbs');
      expect(getDetailSpy).not.toHaveBeenCalled();
      expect(getUlbsSpy).not.toHaveBeenCalled();
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
      spyOn(claimLetterService, 'getUlbs').and.returnValue(of({ rows: SAVED_ULB_ROWS, page: 1, limit: 20, total: 1 }));
      fixture.detectChanges();
    }

    it('is not create mode, and loads detail + ulbs on init, hydrating the table', async () => {
      await setupEdit();

      expect(component.isCreateMode).toBe(false);
      expect(component.claimLetterId()).toBe('claim-1');
      expect(claimLetterService.getDetail).toHaveBeenCalledWith('claim-1');
      expect(claimLetterService.getUlbs).toHaveBeenCalledWith('claim-1', {});
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

    it('shows all four financial-summary tiles straight from the loaded claim', async () => {
      await setupEdit(
        buildClaim({
          financialSummary: {
            totalInstallmentAllocation: 25,
            totalAlreadyAcknowledged: 5,
            selectedAllocation: 20,
            currentSelectedClaim: 21,
            remainingIfAcknowledged: -1,
          },
        }),
      );

      expect(component.summaryTiles()).toEqual([
        { label: 'Total Allocation', value: 25 },
        { label: 'Already Claimed (Acknowledged)', value: 5 },
        { label: 'Claimed in This Batch', value: 21 },
        { label: 'Remaining After This Batch', value: -1 },
      ]);
    });

    it('recomputes Claimed in This Batch / Remaining After This Batch live as the claim amount is edited', async () => {
      await setupEdit(
        buildClaim({
          financialSummary: {
            totalInstallmentAllocation: 25,
            totalAlreadyAcknowledged: 5,
            selectedAllocation: 20,
            currentSelectedClaim: 21,
            remainingIfAcknowledged: -1,
          },
        }),
      );

      component.rows.at(0).controls.claimedAmount.setValue(10);
      fixture.detectChanges();

      const tiles = component.summaryTiles();
      expect(tiles.find((t) => t.label === 'Claimed in This Batch')?.value).toBe(10);
      expect(tiles.find((t) => t.label === 'Remaining After This Batch')?.value).toBe(10); // 25 - 5 - 10
    });

    it('is editable while IN_PROGRESS and not abandoned', async () => {
      await setupEdit(buildClaim({ currentFormStatus: 2, isAbandoned: false }));
      expect(component.canEdit()).toBe(true);
    });

    it('is read-only once no longer IN_PROGRESS', async () => {
      await setupEdit(buildClaim({ currentFormStatus: 5 })); // UNDER_REVIEW_BY_MOHUA
      expect(component.canEdit()).toBe(false);
    });

    it('is read-only once abandoned, even if still nominally IN_PROGRESS', async () => {
      await setupEdit(buildClaim({ isAbandoned: true }));
      expect(component.canEdit()).toBe(false);
    });

    it('sets loadError and shows a snackbar when the initial load fails', async () => {
      await setup('claim-1');
      spyOn(claimLetterService, 'getDetail').and.returnValue(throwError(() => new Error('boom')));
      spyOn(claimLetterService, 'getUlbs').and.returnValue(of({ rows: [], page: 1, limit: 20, total: 0 }));

      fixture.detectChanges();

      expect(component.loadError()).toBe(true);
      expect(component.isLoading()).toBe(false);
      expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(jasmine.any(String), 'snackbar-danger');
    });

    it('saveChanges sends the current expectedRevision and reloads on success', async () => {
      await setupEdit(buildClaim({ revision: 4 }));
      (claimLetterService.getDetail as jasmine.Spy).calls.reset();
      (claimLetterService.getUlbs as jasmine.Spy).calls.reset();
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
      expect(claimLetterService.getUlbs).toHaveBeenCalledWith('claim-1', {});
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
      await setupEdit(buildClaim({ isAbandoned: true }));
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

    // ─── Status stepper ───────────────────────────────────────────────────────────

    it('exposes the claim status as a FormStatusValue for the stepper', async () => {
      await setupEdit(buildClaim({ currentFormStatus: 5 }));
      expect(component.currentFormStatusValue()).toBe(5);
    });
  });
});
