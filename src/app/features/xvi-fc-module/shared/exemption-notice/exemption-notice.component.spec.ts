import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExemptionNoticeComponent } from './exemption-notice.component';

describe('ExemptionNoticeComponent', () => {
  let fixture: ComponentFixture<ExemptionNoticeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExemptionNoticeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExemptionNoticeComponent);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('falls back to a generic "Dear ULB," greeting and the default message when the caller passes nothing', () => {
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Exempted');
    expect(text).toContain('Dear ULB,');
    expect(text).toContain('your ULB is exempted from this requirement and does not need to submit anything for it.');
  });

  it('personalizes the greeting with a caller-supplied ulbName, and renders a caller-supplied title/message', () => {
    fixture.componentRef.setInput('title', 'Exempted from Service Level Benchmarks');
    fixture.componentRef.setInput('ulbName', 'Sample Municipal Corporation');
    fixture.componentRef.setInput(
      'message',
      'your ULB is newly constituted and is automatically exempted from Service Level Benchmark reporting.',
    );
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Exempted from Service Level Benchmarks');
    expect(text).toContain('Dear Sample Municipal Corporation,');
    expect(text).toContain('automatically exempted from Service Level Benchmark reporting.');
    expect(text).not.toContain('Dear ULB,');
    expect(text).not.toContain('does not need to submit anything for it.');
  });

  it('falls back to "Dear ULB," when ulbName is set to a blank/whitespace-only string', () => {
    fixture.componentRef.setInput('ulbName', '   ');
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent ?? '').toContain('Dear ULB,');
  });
});
