import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { EulbStatusSummaryComponent } from './eulb-status-summary.component';
import { EulbStatusSummary } from '../../eulb-status.models';

function createStatusSummary(overrides: Partial<EulbStatusSummary> = {}): EulbStatusSummary {
  return {
    totalUlbCount: 10,
    constitutedCount: 7,
    notConstitutedCount: 2,
    exemptCount: 1,
    ...overrides,
  };
}

describe('EulbStatusSummaryComponent', () => {
  let fixture: ComponentFixture<EulbStatusSummaryComponent>;

  function setup(summary: EulbStatusSummary | null): void {
    TestBed.configureTestingModule({ imports: [EulbStatusSummaryComponent] });
    fixture = TestBed.createComponent(EulbStatusSummaryComponent);
    fixture.componentRef.setInput('summary', summary);
    fixture.detectChanges();
  }

  it('renders nothing when summary is null', () => {
    setup(null);
    expect(fixture.debugElement.query(By.css('[data-testid="status-summary-section"]'))).toBeNull();
  });

  it('renders the summary section when summary is present', () => {
    setup(createStatusSummary());
    expect(fixture.debugElement.query(By.css('[data-testid="status-summary-section"]'))).not.toBeNull();
  });

  it('renders the summary message with constitutedCount and totalUlbCount', () => {
    setup(createStatusSummary({ constitutedCount: 7, totalUlbCount: 10 }));
    const msg = fixture.debugElement.query(By.css('[data-testid="status-summary-message"]'));
    expect(msg.nativeElement.textContent).toContain('7');
    expect(msg.nativeElement.textContent).toContain('10');
  });

  it('renders exactly three summary cards', () => {
    setup(createStatusSummary());
    const cards = fixture.debugElement.queryAll(By.css('[data-testid="status-summary-card"]'));
    expect(cards).toHaveSize(3);
  });

  it('constituted card shows count and border-success class', () => {
    setup(createStatusSummary({ constitutedCount: 7 }));
    const cards = fixture.debugElement.queryAll(By.css('[data-testid="status-summary-card"]'));
    expect(cards[0].nativeElement.classList).toContain('border-success');
    expect(cards[0].nativeElement.textContent).toContain('7');
  });

  it('not-constituted card shows count and border-danger class', () => {
    setup(createStatusSummary({ notConstitutedCount: 2 }));
    const cards = fixture.debugElement.queryAll(By.css('[data-testid="status-summary-card"]'));
    expect(cards[1].nativeElement.classList).toContain('border-danger');
    expect(cards[1].nativeElement.textContent).toContain('2');
  });

  it('exempt card shows count and border-secondary class', () => {
    setup(createStatusSummary({ exemptCount: 1 }));
    const cards = fixture.debugElement.queryAll(By.css('[data-testid="status-summary-card"]'));
    expect(cards[2].nativeElement.classList).toContain('border-secondary');
    expect(cards[2].nativeElement.textContent).toContain('1');
  });
});
