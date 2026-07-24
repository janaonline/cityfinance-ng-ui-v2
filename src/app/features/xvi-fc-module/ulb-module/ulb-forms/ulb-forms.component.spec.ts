import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { convertToParamMap, ActivatedRoute, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AnnualAccountStateService, FormStatusData } from '../annual-account-state.service';
import { UlbFormsComponent } from './ulb-forms.component';

describe('UlbFormsComponent', () => {
  let fixture: ComponentFixture<UlbFormsComponent>;
  let formStatus: ReturnType<typeof signal<FormStatusData | null>>;
  let router: jasmine.SpyObj<Router>;
  let loadFormStatus: jasmine.Spy;
  let parentRoute: ActivatedRoute;

  const baseStatus = (overrides: Partial<FormStatusData> = {}): FormStatusData => ({
    annualAccountId: 'annual-account-id',
    auditedData: { form_status: 'NOT_STARTED', form_status_id: 1 },
    unauditedData: { form_status: 'NOT_STARTED', form_status_id: 1 },
    unspentBalanceDisclosure: { form_status: 'NOT_STARTED', form_status_id: null },
    xviFcBankAccount: {
      form_status: 'NOT_STARTED',
      form_status_id: 1,
    },
    ...overrides,
  });

  beforeEach(async () => {
    localStorage.setItem(
      'xvifc_ulb_details',
      JSON.stringify({ ulbName: 'Test ULB', stateName: 'Test State', selectedYear: 'FY 2026-27' }),
    );
    localStorage.setItem('xvifc_selectedYearId', 'year-id');
    localStorage.setItem('userData', JSON.stringify({ ulb: 'ulb-id' }));

    formStatus = signal<FormStatusData | null>(null);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    router.navigate.and.resolveTo(true);
    loadFormStatus = jasmine.createSpy('loadFormStatus').and.resolveTo();
    parentRoute = {
      snapshot: {
        paramMap: convertToParamMap({ yearId: 'year-id', entityId: 'ulb-id' }),
      } as ActivatedRoute['snapshot'],
    } as ActivatedRoute;

    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, UlbFormsComponent],
      providers: [
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({}) },
            parent: parentRoute,
          },
        },
        {
          provide: AnnualAccountStateService,
          useValue: {
            formStatus,
            loadError: signal<string | null>(null),
            loadFormStatus,
          },
        },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.clear();
  });

  function createComponent(status: FormStatusData): void {
    formStatus.set(status);
    fixture = TestBed.createComponent(UlbFormsComponent);
    fixture.detectChanges();
  }

  function rowFor(title: string): HTMLElement {
    const rows = Array.from(fixture.nativeElement.querySelectorAll('.condition-row')) as HTMLElement[];
    const row = rows.find((candidate) => candidate.textContent?.includes(title));
    expect(row).withContext(`Expected row for ${title}`).toBeTruthy();
    return row!;
  }

  it('shows Start Upload button for PFMS when status is NOT_STARTED (1), no preview icon yet', () => {
    createComponent(baseStatus());

    const row = rowFor('XVI-FC Bank Account (PFMS)');

    expect(row.textContent).toContain('Start Upload');
    expect(row.querySelector('.submitted-badge')).toBeNull();
    expect(row.querySelector('.preview-icon-btn')).toBeNull();
  });

  it('shows Continue Uploading + preview icon for PFMS when status is IN_PROGRESS (2)', () => {
    createComponent(
      baseStatus({ xviFcBankAccount: { form_status: 'IN_PROGRESS', form_status_id: 2 } }),
    );

    const row = rowFor('XVI-FC Bank Account (PFMS)');

    expect(row.textContent).toContain('Continue Uploading');
    expect(row.querySelector('.preview-icon-btn')).toBeTruthy();
  });

  it('shows Submitted button for PFMS when status is UNDER_REVIEW_BY_STATE (3)', () => {
    createComponent(
      baseStatus({ xviFcBankAccount: { form_status: 'UNDER_REVIEW_BY_STATE', form_status_id: 3 } }),
    );

    const row = rowFor('XVI-FC Bank Account (PFMS)');

    expect(row.textContent).toContain('Submitted');
    expect(row.textContent).not.toContain('Start Upload');
  });

  it('shows Reupload button in warning colour for PFMS when status is RETURNED_BY_STATE (4)', () => {
    createComponent(
      baseStatus({ xviFcBankAccount: { form_status: 'RETURNED_BY_STATE', form_status_id: 4 } }),
    );

    const row = rowFor('XVI-FC Bank Account (PFMS)');

    expect(row.textContent).toContain('Reupload');
    expect(row.querySelector('.condition-action-btn--warning')).toBeTruthy();
  });

  it('shows Approved by MoHUA button for PFMS when status is SUBMISSION_ACKNOWLEDGED_BY_MOHUA (7)', () => {
    createComponent(
      baseStatus({
        xviFcBankAccount: { form_status: 'SUBMISSION_ACKNOWLEDGED_BY_MOHUA', form_status_id: 7 },
      }),
    );

    const row = rowFor('XVI-FC Bank Account (PFMS)');

    expect(row.textContent).toContain('Approved by MoHUA');
  });

  it('shows view icon for PFMS when status is UNDER_REVIEW_BY_STATE', () => {
    createComponent(
      baseStatus({ xviFcBankAccount: { form_status: 'UNDER_REVIEW_BY_STATE', form_status_id: 3 } }),
    );

    const row = rowFor('XVI-FC Bank Account (PFMS)');

    expect(row.querySelector('.preview-icon-btn')).toBeTruthy();
    expect(row.querySelector('.preview-icon')?.textContent).toContain('visibility');
  });

  it('navigates PFMS view icon to the PFMS route', () => {
    createComponent(
      baseStatus({ xviFcBankAccount: { form_status: 'UNDER_REVIEW_BY_STATE', form_status_id: 3 } }),
    );

    const row = rowFor('XVI-FC Bank Account (PFMS)');
    (row.querySelector('.preview-icon-btn') as HTMLButtonElement).click();

    expect(router.navigate).toHaveBeenCalledOnceWith(['xvi-fc-bank-account'], { relativeTo: parentRoute });
  });

  // The 'unspent-balance' condition row is currently commented out of CONDITION_GROUPS in
  // ulb-forms.component.ts (feature temporarily disabled), so this row does not render. Re-enable
  // this test once that condition is uncommented again.
  xit('keeps Balance Disclosure submitted behaviour unchanged', () => {
    createComponent(
      baseStatus({
        unspentBalanceDisclosure: { form_status: 'SUBMITTED', form_status_id: null },
      }),
    );

    const row = rowFor('FC Unspent Balance Disclosure');

    expect(row.querySelector('.submitted-badge')?.textContent).toContain('SUBMITTED');
    expect(row.querySelector('.preview-icon-btn')).toBeTruthy();
  });
});
