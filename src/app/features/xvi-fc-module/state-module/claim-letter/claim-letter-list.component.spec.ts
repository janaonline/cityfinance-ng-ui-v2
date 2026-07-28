import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { UtilityService } from '../../../../core/services/utility.service';
import { XvifcModuleService } from '../../xvi-fc-module.service';
import { ClaimLetterListComponent } from './claim-letter-list.component';
import { ClaimLetterBatchSummary, ClaimLetterEligibilitySummary } from './claim-letter.models';
import { ClaimLetterService } from './claim-letter.service';

const financialSummary = {
  totalInstallmentAllocation: 0,
  totalAlreadyAcknowledged: 0,
  totalClaimInProgress: 0,
  totalClaimInDraft: 0,
  availableToClaim: 0,
  selectedAllocation: 0,
  currentSelectedClaim: 5,
  remainingIfAcknowledged: 0,
};

const sampleClaim: ClaimLetterBatchSummary = {
  claimLetterId: 'claim-1',
  installment: 1,
  batchNumber: 1,
  version: 1,
  currentFormStatus: 2,
  currentFormStatusLabel: 'In Progress',
  assemblyStatus: 'READY',
  ulbCount: 3,
  isAbandoned: false,
  hasSignedFile: false,
  financialSummary,
  revision: 0,
  submittedAt: null,
  resolvedAt: null,
  supersedes: null,
  supersededBy: null,
  createdAt: '2026-07-01T00:00:00.000Z',
};

function buildEligibility(overrides: Partial<ClaimLetterEligibilitySummary> = {}): ClaimLetterEligibilitySummary {
  return {
    installment: 1,
    stateLevelGate: { passed: true, sources: [] },
    expectedUlbCount: 10,
    batchSlotsUsed: 1,
    batchSlotsMax: 3,
    nextBatchNumber: 2,
    financialOverview: {
      totalInstallmentAllocation: 25,
      totalAlreadyAcknowledged: 5,
      totalClaimInProgress: 3,
      totalClaimInDraft: 2,
      availableToClaim: 15,
    },
    ...overrides,
  };
}

describe('ClaimLetterListComponent', () => {
  let fixture: ComponentFixture<ClaimLetterListComponent>;
  let component: ClaimLetterListComponent;
  let claimLetterService: ClaimLetterService;
  let router: Router;

  beforeEach(async () => {
    localStorage.setItem('userData', JSON.stringify({ state: 'state-test-id' }));

    const moduleService = jasmine.createSpyObj<XvifcModuleService>('XvifcModuleService', ['yearId']);
    moduleService.yearId.and.returnValue('year-test-id');

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, ClaimLetterListComponent],
      providers: [{ provide: XvifcModuleService, useValue: moduleService }],
    }).compileComponents();

    claimLetterService = TestBed.inject(ClaimLetterService);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    spyOn(claimLetterService, 'getEligibilitySummary').and.returnValue(of(buildEligibility()));
    spyOn(claimLetterService, 'listHistory').and.returnValue(
      of({ claims: [sampleClaim], page: 1, limit: 10, total: 1 }),
    );

    fixture = TestBed.createComponent(ClaimLetterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem('userData');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads eligibility + first history page on init', () => {
    expect(claimLetterService.getEligibilitySummary).toHaveBeenCalledWith('state-test-id', 'year-test-id', 1);
    expect(claimLetterService.listHistory).toHaveBeenCalledWith('state-test-id', 'year-test-id', {
      installment: 1,
      page: 1,
      limit: 10,
    });
    expect(component.eligibility()).toEqual(buildEligibility());
    expect(component.claims()).toEqual([sampleClaim]);
    expect(component.total()).toBe(1);
    expect(component.isLoading()).toBeFalse();
  });

  it('enables New Claim when the gate passes and slots remain', () => {
    expect(component.canCreateNewClaim()).toBeTrue();
  });

  it('disables New Claim and exposes the failing source when the gate fails', () => {
    (claimLetterService.getEligibilitySummary as jasmine.Spy).and.returnValue(
      of(
        buildEligibility({
          stateLevelGate: {
            passed: false,
            sources: [{ formType: 'DEVOLUTION_FORMULA', result: 'FAILED', reasonCode: 'FORM_STATUS_3_NOT_ACCEPTED' }],
          },
        }),
      ),
    );

    component.loadAll();

    expect(component.canCreateNewClaim()).toBeFalse();
    // The eligibility-checklist component (tested separately) derives tick/cross rendering from
    // this signal directly — the list component itself no longer filters failed sources.
    expect(component.eligibility()?.stateLevelGate.sources.length).toBe(1);
    expect(component.eligibility()?.stateLevelGate.sources[0].result).toBe('FAILED');
  });

  it('derives all 5 tiles from financialOverview, with Available to Claim emphasized first', () => {
    expect(component.summaryTiles()).toEqual([
      { label: 'Available to Claim', value: 15, emphasized: true },
      { label: 'Total Allocation', value: 25 },
      { label: 'Already Claimed (Acknowledged)', value: 5 },
      { label: 'Claim in Progress (Under Review)', value: 3 },
      { label: 'Claim in Draft', value: 2 },
    ]);
  });

  it('has no summary tiles before eligibility has loaded', () => {
    component.eligibility.set(null);
    expect(component.summaryTiles()).toEqual([]);
  });

  it('disables New Claim when batch slots are full', () => {
    (claimLetterService.getEligibilitySummary as jasmine.Spy).and.returnValue(
      of(buildEligibility({ batchSlotsUsed: 3, batchSlotsMax: 3 })),
    );

    component.loadAll();

    expect(component.canCreateNewClaim()).toBeFalse();
  });

  it('createNewClaim navigates to claim-letter/new when eligible', () => {
    component.createNewClaim();
    expect(router.navigate).toHaveBeenCalledWith(['/xvifc', 'year-test-id', 'claim-letter', 'new']);
  });

  it('createNewClaim does nothing when not eligible', () => {
    (claimLetterService.getEligibilitySummary as jasmine.Spy).and.returnValue(
      of(buildEligibility({ stateLevelGate: { passed: false, sources: [] } })),
    );

    component.loadAll();
    component.createNewClaim();

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('viewClaim navigates to claim-letter/:id', () => {
    component.viewClaim('claim-1');
    expect(router.navigate).toHaveBeenCalledWith(['/xvifc', 'year-test-id', 'claim-letter', 'claim-1']);
  });

  it('sets loadError and shows a snackbar when the initial load fails', () => {
    (claimLetterService.getEligibilitySummary as jasmine.Spy).and.returnValue(throwError(() => new Error('boom')));
    const utilityService = TestBed.inject(UtilityService);
    spyOn(utilityService, 'triggerSnackbar');

    component.loadAll();

    expect(component.loadError()).toBeTrue();
    expect(component.isLoading()).toBeFalse();
    expect(utilityService.triggerSnackbar).toHaveBeenCalled();
  });

  it('goToPage loads the requested page without refetching eligibility', () => {
    (claimLetterService.listHistory as jasmine.Spy).calls.reset();
    (claimLetterService.getEligibilitySummary as jasmine.Spy).calls.reset();
    (claimLetterService.listHistory as jasmine.Spy).and.returnValue(
      of({ claims: [sampleClaim], page: 2, limit: 10, total: 15 }),
    );
    component.total.set(15);

    component.goToPage(2);

    expect(claimLetterService.listHistory).toHaveBeenCalledWith('state-test-id', 'year-test-id', {
      installment: 1,
      page: 2,
      limit: 10,
    });
    expect(claimLetterService.getEligibilitySummary).not.toHaveBeenCalled();
    expect(component.page()).toBe(2);
  });

  it('instructions stay collapsed by default and toggle on demand', () => {
    expect(component.showInstructions()).toBeFalse();

    component.toggleInstructions();
    expect(component.showInstructions()).toBeTrue();

    component.toggleInstructions();
    expect(component.showInstructions()).toBeFalse();
  });

  it('goToPage ignores out-of-range page numbers', () => {
    (claimLetterService.listHistory as jasmine.Spy).calls.reset();

    component.goToPage(0);
    component.goToPage(999);

    expect(claimLetterService.listHistory).not.toHaveBeenCalled();
  });
});
