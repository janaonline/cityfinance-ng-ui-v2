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
    financialOverview: { totalInstallmentAllocation: 25, totalAlreadyAcknowledged: 5 },
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

  it('disables New Claim and surfaces failed sources when the gate fails', () => {
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
    expect(component.failedEligibilitySources().length).toBe(1);
  });

  it('derives Total Allocation, Already Claimed, and Available to Claim from financialOverview', () => {
    expect(component.summaryTiles()).toEqual([
      { label: 'Total Allocation', value: 25 },
      { label: 'Already Claimed (Acknowledged)', value: 5 },
      { label: 'Available to Claim', value: 20 },
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

  it('goToPage ignores out-of-range page numbers', () => {
    (claimLetterService.listHistory as jasmine.Spy).calls.reset();

    component.goToPage(0);
    component.goToPage(999);

    expect(claimLetterService.listHistory).not.toHaveBeenCalled();
  });
});
