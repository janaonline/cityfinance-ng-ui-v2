import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReturnedReasonBannerComponent } from './returned-reason-banner.component';
import { FORM_STATUS } from '../../common/constants/form-status.constants';

describe('ReturnedReasonBannerComponent', () => {
  let fixture: ComponentFixture<ReturnedReasonBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnedReasonBannerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReturnedReasonBannerComponent);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders nothing when the form has never been returned', () => {
    fixture.componentRef.setInput('currentFormStatus', FORM_STATUS.UNDER_REVIEW_BY_PMU);
    fixture.componentRef.setInput('pmuRemarks', 'Should not show.');
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent?.trim()).toBe('');
  });

  it('shows pmuRemarks when currentFormStatus is RETURNED_BY_PMU', () => {
    fixture.componentRef.setInput('currentFormStatus', FORM_STATUS.RETURNED_BY_PMU);
    fixture.componentRef.setInput('pmuRemarks', 'Missing supporting document.');
    fixture.componentRef.setInput('mohuaRemarks', null);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Return Reason:');
    expect(text).toContain('Missing supporting document.');
  });

  it('shows mohuaRemarks when currentFormStatus is RETURNED_BY_MOHUA, ignoring pmuRemarks', () => {
    fixture.componentRef.setInput('currentFormStatus', FORM_STATUS.RETURNED_BY_MOHUA);
    fixture.componentRef.setInput('pmuRemarks', 'Stale reason from an earlier PMU reject.');
    fixture.componentRef.setInput('mohuaRemarks', 'Allocation figures do not reconcile.');
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Allocation figures do not reconcile.');
    expect(text).not.toContain('Stale reason from an earlier PMU reject.');
  });

  it('renders nothing once the form moves past Returned, even if a stale remark is still present', () => {
    fixture.componentRef.setInput('currentFormStatus', FORM_STATUS.UNDER_REVIEW_BY_MOHUA);
    fixture.componentRef.setInput('pmuRemarks', 'Old reject reason from a prior cycle.');
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent?.trim()).toBe('');
  });
});
