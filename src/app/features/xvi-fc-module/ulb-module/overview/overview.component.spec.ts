import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewComponent } from './overview.component';
import { AnnualAccountStateService, FormStatusData } from '../annual-account-state.service';
import { UlbNotificationService } from '../ulb-notification.service';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;

  beforeEach(async () => {
    // Otherwise ngOnInit's one-time video-walkthrough popup would actually try to open a real
    // MatDialog on every test in this file (the "seen" flag won't exist yet on a fresh run).
    localStorage.setItem('hasSeenXvifcVideoWalkthrough', 'true');

    await TestBed.configureTestingModule({ providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} }], imports: [HttpClientTestingModule, RouterTestingModule, OverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem('hasSeenXvifcVideoWalkthrough');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the ULB notification form status on init', () => {
    const ulbNotifications = TestBed.inject(UlbNotificationService);
    const ensureLoadedSpy = spyOn(ulbNotifications, 'ensureLoadedForUlb').and.resolveTo();

    component.ngOnInit();

    expect(ensureLoadedSpy).toHaveBeenCalled();
  });

  it('does not throw when userData in localStorage is malformed JSON', () => {
    localStorage.setItem('userData', 'not-json{{{');

    expect(() => component.ngOnInit()).not.toThrow();

    localStorage.removeItem('userData');
  });

  describe('State-filed allocation', () => {
    const status = (devolution: { visible: boolean; amount: number | null }): FormStatusData => ({
      annualAccountId: null,
      auditedData: { form_status: 'NOT_STARTED', form_status_id: 1 },
      unauditedData: { form_status: 'NOT_STARTED', form_status_id: 1 },
      unspentBalanceDisclosure: { form_status: 'NOT_STARTED', form_status_id: null },
      stateConditions: {
        sfcStatus: { form_status: 'NO_STATUS', form_status_id: 0, visible: false, value: null, amount: null },
        electedBody: { form_status: 'NO_STATUS', form_status_id: 0, visible: false, value: null, amount: null },
        fcUnspent: { form_status: 'NO_STATUS', form_status_id: 0, visible: false, value: null, amount: null },
        devolution: { form_status: 'UNDER_REVIEW_BY_MOHUA', form_status_id: 5, value: null, ...devolution },
      },
    });

    function loadCard(): void {
      localStorage.setItem('userData', JSON.stringify({ ulb: 'ulb-id' }));
      component.loadOverview();
      TestBed.inject(HttpTestingController)
        .expectOne((req) => req.url.includes('xvi-fc/ulb/ulb-id'))
        .flush({ data: { ulbName: 'Test ULB', stateName: 'Test State' } });
    }

    afterEach(() => localStorage.removeItem('userData'));

    it('keeps the placeholder until the ULB-wise allocation is visible', () => {
      loadCard();
      TestBed.inject(AnnualAccountStateService).formStatus.set(status({ visible: false, amount: null }));

      expect(String(component.ulbOverviewData()?.totalAllocation)).toContain('Allocation will be displayed');
    });

    it("shows the ULB's allocation in the hero band and the Grant Estimate once visible", () => {
      loadCard();
      TestBed.inject(AnnualAccountStateService).formStatus.set(status({ visible: true, amount: 1234567 }));

      const data = component.ulbOverviewData();
      expect(data?.totalAllocation).toBe(1234567);
      expect(data?.grantSections.find((s) => s.id === 'grantEstimate')?.amount).toBe(1234567);
    });

    it('marks the card as having an allocation only once the figure is shown', () => {
      loadCard();
      const state = TestBed.inject(AnnualAccountStateService);

      state.formStatus.set(status({ visible: false, amount: null }));
      expect(component.hasAllocation()).toBeFalse();

      state.formStatus.set(status({ visible: true, amount: 1234567 }));
      expect(component.hasAllocation()).toBeTrue();
    });

    it('keeps the placeholder when the form is visible but the ULB has no allocation row', () => {
      loadCard();
      TestBed.inject(AnnualAccountStateService).formStatus.set(status({ visible: true, amount: null }));

      expect(String(component.ulbOverviewData()?.totalAllocation)).toContain('Allocation will be displayed');
    });
  });
});
