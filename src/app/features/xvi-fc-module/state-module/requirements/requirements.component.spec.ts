import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthService } from '../../../../core/services/auth.service';
import { IUserLoggedInDetails } from '../../../../core/models/login/userLoggedInDetails';
import { XvifcModuleService } from '../../xvi-fc-module.service';
import { RequirementsComponent } from './requirements.component';

describe('RequirementsComponent', () => {
  let component: RequirementsComponent;
  let fixture: ComponentFixture<RequirementsComponent>;

  beforeEach(async () => {
    // AuthService is provided app-wide (app.config.ts), not `providedIn: 'root'` on the class
    // itself, so TestBed needs an explicit provider — XvifcModuleService (root-provided) also
    // injects it transitively. A stub with no current user is enough: the component's `load()`
    // guard just surfaces a "context unavailable" error state without calling any HTTP service.
    const authService = jasmine.createSpyObj<AuthService>('AuthService', ['getCurrentUserSnapshot']);
    authService.getCurrentUserSnapshot.and.returnValue(null);

    await TestBed.configureTestingModule({
      providers: [
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: AuthService, useValue: authService },
      ],
      imports: [HttpClientTestingModule, RouterTestingModule, RequirementsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RequirementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('RequirementsComponent — status tooltip', () => {
  let component: RequirementsComponent;
  let fixture: ComponentFixture<RequirementsComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    const authService = jasmine.createSpyObj<AuthService>('AuthService', ['getCurrentUserSnapshot']);
    authService.getCurrentUserSnapshot.and.returnValue({ state: 'state-1' } as IUserLoggedInDetails);

    const moduleService = jasmine.createSpyObj<XvifcModuleService>('XvifcModuleService', ['yearId']);
    moduleService.yearId.and.returnValue('year-1');

    await TestBed.configureTestingModule({
      providers: [
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: AuthService, useValue: authService },
        { provide: XvifcModuleService, useValue: moduleService },
      ],
      imports: [HttpClientTestingModule, RouterTestingModule, RequirementsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RequirementsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('collapses UNDER_REVIEW_BY_PMU to the state-facing MoHUA label, never showing "PMU"', () => {
    const dashboardReq = httpMock.expectOne((req) => req.url.endsWith('/dashboard'));
    dashboardReq.flush({
      success: true,
      message: '',
      data: { context: { financialYear: '2026-27' }, metrics: { allocatedAmount: 1000 } },
    });

    const eligibilityReq = httpMock.expectOne((req) => req.url.endsWith('/eligibility-summary'));
    eligibilityReq.flush({
      success: true,
      message: '',
      data: {
        stateName: 'Test State',
        expectedUlbCount: 10,
        stateLevelGate: {
          passed: false,
          sources: [
            {
              formType: 'devolutionFormula',
              result: 'FAILED',
              reasonCode: 'pending',
              statusAtEvaluation: 13, // FORM_STATUS.UNDER_REVIEW_BY_PMU
            },
          ],
        },
      },
    });

    fixture.detectChanges();

    const conditions = component.conditionsToBeMet();
    expect(conditions.length).toBe(1);
    expect(conditions[0].statusLabel).toBe('Under Review by MoHUA');
    expect(conditions[0].statusLabel).not.toContain('PMU');
  });

  it('disables the status tooltip when a source has no statusAtEvaluation', () => {
    const dashboardReq = httpMock.expectOne((req) => req.url.endsWith('/dashboard'));
    dashboardReq.flush({
      success: true,
      message: '',
      data: { context: { financialYear: '2026-27' }, metrics: { allocatedAmount: 1000 } },
    });

    const eligibilityReq = httpMock.expectOne((req) => req.url.endsWith('/eligibility-summary'));
    eligibilityReq.flush({
      success: true,
      message: '',
      data: {
        stateName: 'Test State',
        expectedUlbCount: 10,
        stateLevelGate: {
          passed: false,
          sources: [{ formType: 'slb', result: undefined, reasonCode: 'ulbOnly' }],
        },
      },
    });

    fixture.detectChanges();

    expect(component.conditionsToBeMet()[0].statusLabel).toBe('');
  });

  it('derives each row button from the source status, and counts submitted rows as submitted', () => {
    httpMock
      .expectOne((req) => req.url.endsWith('/dashboard'))
      .flush({
        success: true,
        message: '',
        data: { context: { financialYear: '2026-27' }, metrics: { allocatedAmount: 1000 } },
      });

    httpMock
      .expectOne((req) => req.url.endsWith('/eligibility-summary'))
      .flush({
        success: true,
        message: '',
        data: {
          stateName: 'Test State',
          expectedUlbCount: 10,
          stateLevelGate: {
            passed: false,
            sources: [
              { formType: 'a', result: 'FAILED', reasonCode: 'x', statusAtEvaluation: null },
              { formType: 'b', result: 'FAILED', reasonCode: 'x', statusAtEvaluation: 2 },
              { formType: 'c', result: 'FAILED', reasonCode: 'x', statusAtEvaluation: 13 },
              { formType: 'd', result: 'FAILED', reasonCode: 'x', statusAtEvaluation: 14 },
              { formType: 'e', result: 'PASSED', reasonCode: 'x', statusAtEvaluation: 7 },
              { formType: 'f', result: 'EXEMPTED', reasonCode: 'x', statusAtEvaluation: null },
            ],
          },
        },
      });

    fixture.detectChanges();

    expect(component.conditionsToBeMet().map((c) => c.buttonLabel)).toEqual([
      'Start',
      'Continue',
      'Submitted',
      'Resubmit',
      'Acknowledged',
      'Exempted',
    ]);
    expect(component.conditionsToBeMet().map((c) => c.passed)).toEqual([false, false, true, false, true, true]);
  });
});
