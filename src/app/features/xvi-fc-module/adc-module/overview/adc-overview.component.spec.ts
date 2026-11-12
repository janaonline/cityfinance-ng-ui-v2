import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AdcOverviewComponent } from './adc-overview.component';

describe('AdcOverviewComponent', () => {
  let fixture: ComponentFixture<AdcOverviewComponent>;
  let component: AdcOverviewComponent;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.setItem('userData', JSON.stringify({ role: 'STATE', adc: 'a1', adcName: 'ADC One', stateName: 'Assam' }));
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, AdcOverviewComponent],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AdcOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  /** Annual accounts reply with status names; the other three forms with the numeric form_status ids. */
  function flushAll(counts: { named: Record<string, number>; numeric: Record<number, number> }): void {
    httpMock.match((r) => r.url.includes('state/ulb-submissions')).forEach((req) => {
      const isAnnual = req.request.url.includes('annual-account');
      req.flush({
        data: { total: 0, page: 1, pageSize: 1, rows: [], counts: isAnnual ? counts.named : counts.numeric },
      });
    });
  }

  it('asks for one row per form and shows the ADC and state in the heading', () => {
    const requests = httpMock.match((r) => r.url.includes('state/ulb-submissions'));

    expect(requests.length).toBe(5);
    requests.forEach((req) => expect(req.request.params.get('pageSize')).toBe('1'));
    expect(fixture.nativeElement.textContent).toContain('ADC One');
    expect(fixture.nativeElement.textContent).toContain('Assam');
    requests.forEach((req) => req.flush({ data: { total: 0, page: 1, pageSize: 1, rows: [], counts: {} } }));
  });

  it('builds one card per form from the per-status counts', () => {
    flushAll({ named: { UNDER_REVIEW_BY_STATE: 4, APPROVED_BY_STATE: 2 }, numeric: { 3: 1, 8: 7 } });
    fixture.detectChanges();

    const cards = component.cards();
    expect(cards.length).toBe(5);

    const audited = cards.find((c) => c.form === 'AUDITED_STATEMENTS');
    expect(audited?.buckets.find((b) => b.key === 'UNDER_STATE_REVIEW')?.count).toBe(4);
    expect(audited?.buckets.find((b) => b.key === 'APPROVED_BY_STATE')?.count).toBe(2);

    const bank = cards.find((c) => c.form === 'PFMS_BANK_ACCOUNT');
    expect(bank?.buckets.find((b) => b.key === 'UNDER_STATE_REVIEW')?.count).toBe(1);
    expect(bank?.buckets.find((b) => b.key === 'APPROVED_BY_STATE')?.count).toBe(7);
  });

  it('leaves out the buckets that do not apply to a form (SLB has no review step, PFMS no exemption)', () => {
    flushAll({ named: {}, numeric: {} });

    const slb = component.cards().find((c) => c.form === 'SERVICE_LEVEL_BENCHMARKS');
    expect(slb?.buckets.some((b) => b.key === 'UNDER_STATE_REVIEW')).toBeFalse();
    expect(slb?.buckets.some((b) => b.key === 'RETURNED_BY_STATE')).toBeFalse();

    const bank = component.cards().find((c) => c.form === 'PFMS_BANK_ACCOUNT');
    expect(bank?.buckets.some((b) => b.key === 'EXEMPTED')).toBeFalse();
    expect(bank?.buckets.some((b) => b.key === 'UNDER_STATE_REVIEW')).toBeTrue();
  });

  it('links each count to the review table on that form and status bucket', () => {
    flushAll({ named: {}, numeric: {} });

    const dur = component.cards().find((c) => c.form === 'DUR');
    const bucket = dur?.buckets.find((b) => b.key === 'UNDER_STATE_REVIEW');
    expect(dur && bucket && component.queryParamsFor(dur, bucket)).toEqual({ form: 'DUR', status: 'UNDER_STATE_REVIEW' });
  });

  it('marks a form whose request failed, and shows a retry only when every form failed', () => {
    const requests = httpMock.match((r) => r.url.includes('state/ulb-submissions'));
    requests.forEach((req) => req.flush('boom', { status: 500, statusText: 'Server Error' }));

    expect(component.cards().every((c) => c.failed)).toBeTrue();
    expect(component.hasError()).toBeTrue();
  });
});
