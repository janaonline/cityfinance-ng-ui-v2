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
    fixture.componentRef.setInput('rejectionRemarks', 'Should not show.');
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent?.trim()).toBe('');
  });

  for (const status of [FORM_STATUS.RETURNED_BY_PMU, FORM_STATUS.RETURNED_BY_SO, FORM_STATUS.RETURNED_BY_MOHUA]) {
    it(`shows rejectionRemarks when currentFormStatus is ${status}`, () => {
      fixture.componentRef.setInput('currentFormStatus', status);
      fixture.componentRef.setInput('rejectionRemarks', 'Missing supporting document.');
      fixture.detectChanges();

      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(text).toContain('Return Reason:');
      expect(text).toContain('Missing supporting document.');
    });
  }

  it('renders nothing once the form moves past Returned, even if a stale remark is still present', () => {
    fixture.componentRef.setInput('currentFormStatus', FORM_STATUS.UNDER_REVIEW_BY_MOHUA);
    fixture.componentRef.setInput('rejectionRemarks', 'Old reject reason from a prior cycle.');
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent?.trim()).toBe('');
  });
});
