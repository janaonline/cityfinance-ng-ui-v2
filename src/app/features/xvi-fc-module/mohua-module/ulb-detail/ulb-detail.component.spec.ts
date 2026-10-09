import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MohuaStateDetailService } from '../state-detail/mohua-state-detail.service';
import { MohuaUlbFormsService } from './mohua-ulb-forms.service';
import { UlbFormsData } from './ulb-detail.models';
import { UlbDetailComponent } from './ulb-detail.component';

const loaded = <T>(data: T | null) => ({ data, failed: false });

const status = (statusCode: number | null, statusLabel: string, submitted: boolean) => ({
  statusCode,
  statusLabel,
  submitted,
});

/** A ULB with audited under State review (approved by MoHUA), no provisional, a PFMS account, and nothing else. */
const forms = {
  audited: loaded({
    annualAccountId: 'aa-1',
    ulbName: 'Kekri Municipality',
    ulbCode: '800123',
    data: {
      form_status: 'UNDER_REVIEW_BY_STATE',
      form_status_id: 3,
      stateDecision: null,
      mohuaDecision: {
        status: 'APPROVED',
        note: null,
        decidedAt: '2026-09-10T00:00:00.000Z',
        decidedBy: { name: 'Test MoHUA' },
      },
      documents: [
        {
          docId: 'bs',
          processingStatus: 'PASSED',
          currentUpload: {
            file: { originalName: 'bs.pdf', sizeKb: 10, fileUrl: 'https://files/bs' },
            uploadedAt: '2026-09-01T00:00:00.000Z',
          },
        },
        {
          docId: 'pl',
          processingStatus: 'FAILED',
          currentUpload: {
            file: { originalName: 'pl.pdf', sizeKb: 12, fileUrl: null },
            uploadedAt: '2026-09-02T00:00:00.000Z',
            ocrInfo: { failedChecks: ['Page count is below the minimum'] },
          },
        },
      ],
    },
  }),
  unaudited: loaded({ annualAccountId: 'aa-1', ulbName: 'Kekri Municipality', ulbCode: '800123', data: null }),
  auditedConfig: loaded({
    type: 'audited',
    documentYear: '2024-25',
    documents: [
      { id: 'bs', title: 'Balance Sheet', subtitle: 'Signed', required: true },
      { id: 'pl', title: 'Profit and Loss', subtitle: '', required: true },
      { id: 'sch', title: 'Schedules', subtitle: '', required: false },
    ],
  }),
  provisionalConfig: loaded({ type: 'provisional', documentYear: '2025-26', documents: [] }),
  bank: loaded({
    ifscCode: 'SBIN0041032',
    bankDetails: { name: 'State Bank of India', branch: 'Thekkatte', city: 'Udipi' },
    accountNumberMasked: '******3219',
    proofFile: { originalName: 'proof.pdf', fileUrl: 'https://files/proof' },
    currentFormStatus: 3,
    currentFormStatusLabel: 'Under Review by State',
    stateDecision: { status: 'APPROVED', note: null, decidedAt: '2026-09-11T00:00:00.000Z', decidedBy: null },
    mohuaDecision: null,
  }),
  slb: loaded({ ulbName: 'Kekri Municipality', currentFormStatus: 1 }),
  dur: loaded(null),
  statuses: loaded({
    forms: {
      audited: status(3, 'Under Review by State', true),
      unaudited: status(null, 'Not started', false),
      pfms: status(3, 'Under Review by State', true),
      slb: status(1, 'Not Started', false),
      dur: status(null, 'Not started', false),
    },
  }),
} as unknown as UlbFormsData;

describe('UlbDetailComponent', () => {
  let formsService: { load: jasmine.Spy };

  const create = () => {
    const paramMap = convertToParamMap({ stateId: 'state-1', ulbId: 'ulb-1', yearId: 'year-1' });
    TestBed.configureTestingModule({
      imports: [UlbDetailComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: MohuaUlbFormsService, useValue: formsService },
        {
          provide: MohuaStateDetailService,
          useValue: { getDetail: () => of({ state: { name: 'Rajasthan' } }) },
        },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap, parent: null }, paramMap: of(paramMap), parent: null },
        },
      ],
    });
    const fixture = TestBed.createComponent(UlbDetailComponent);
    fixture.detectChanges();
    return fixture;
  };

  beforeEach(() => {
    formsService = { load: jasmine.createSpy('load').and.returnValue(of(forms)) };
  });

  it('loads the ULB for the ids in the route and fills in the header and breadcrumb', () => {
    const fixture = create();

    expect(formsService.load).toHaveBeenCalledOnceWith('ulb-1', 'year-1');
    expect(fixture.componentInstance.ulbName()).toBe('Kekri Municipality');
    expect(fixture.componentInstance.ulbCode()).toBe('800123');
    expect(fixture.componentInstance.stateName()).toBe('Rajasthan');
    expect(fixture.nativeElement.querySelector('.ud-crumb')?.textContent).toContain('Rajasthan');
  });

  it("takes each tab's status text and tick from the API, not from local rules", () => {
    const tabs = create().componentInstance.tabs();

    expect(tabs.map((tab) => [tab.label, tab.done, tab.statusText])).toEqual([
      ['Audited Statements', true, 'Under Review by State'],
      ['Provisional Statements', false, 'Not started'],
      ['PFMS Bank Account', true, 'Under Review by State'],
      ['Service Level Benchmarks', false, 'Not Started'],
      ['DUR', false, 'Not started'],
    ]);
  });

  it('still shows the five tabs, un-ticked, when the status call failed', () => {
    formsService.load.and.returnValue(of({ ...forms, statuses: { data: null, failed: true } }));

    const tabs = create().componentInstance.tabs();

    expect(tabs.length).toBe(5);
    expect(tabs.every((tab) => !tab.done && tab.statusText === 'Not started')).toBeTrue();
  });

  it('lists every configured document with its upload, result and failed checks', () => {
    const documents = create().componentInstance.documents();

    expect(documents.map((doc) => [doc.title, doc.status])).toEqual([
      ['Balance Sheet', 'PASSED'],
      ['Profit and Loss', 'FAILED'],
      ['Schedules', 'NOT_STARTED'],
    ]);
    expect(documents[0].fileUrl).toBe('https://files/bs');
    expect(documents[1].failedChecks).toEqual(['Page count is below the minimum']);
    expect(documents[2].uploadedAt).toBeNull();
  });

  it("shows MoHUA's decision, and falls back to the State's, as the approval line", () => {
    const component = create().componentInstance;

    expect(component.approval()?.text).toBe('Approved by Test MoHUA on 10 Sept 2026');

    component.selectTab('PFMS_BANK_ACCOUNT');
    expect(component.approval()).toEqual(jasmine.objectContaining({ tone: 'good' }));
    expect(component.approval()?.text).toContain('Approved by State on');
  });

  it('shows the bank account details, masked, on the PFMS tab', () => {
    const fixture = create();

    fixture.componentInstance.selectTab('PFMS_BANK_ACCOUNT');
    fixture.detectChanges();

    const text: string = fixture.nativeElement.querySelector('.ud-kv')?.textContent ?? '';
    expect(text).toContain('SBIN0041032');
    expect(text).toContain('******3219');
    expect(text).toContain('Udipi');
  });

  it('says a form has not been submitted when the ULB has no record for it', () => {
    const fixture = create();

    fixture.componentInstance.selectTab('DUR');
    fixture.detectChanges();

    expect(fixture.componentInstance.hasRecord()).toBeFalse();
    expect(fixture.nativeElement.querySelector('.ud-empty')?.textContent).toContain('has not been submitted yet');
  });

  it('offers a retry for a form whose own call failed, without hiding the rest of the page', () => {
    formsService.load.and.returnValue(of({ ...forms, bank: { data: null, failed: true } }));
    const fixture = create();

    fixture.componentInstance.selectTab('PFMS_BANK_ACCOUNT');
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedFailed()).toBeTrue();
    expect(fixture.nativeElement.querySelector('.ud-empty')?.textContent).toContain('Could not load');
    expect(fixture.nativeElement.querySelector('.ud-tabs')).not.toBeNull();
  });

  it('shows an error with Try again when the whole load fails', () => {
    formsService.load.and.returnValue(throwError(() => new Error('down')));

    const fixture = create();

    expect(fixture.componentInstance.error()).toBe('Could not load this ULB. Please try again.');
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('Try again');
  });
});
