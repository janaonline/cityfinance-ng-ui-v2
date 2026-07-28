import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ClaimLetterEligibilitySource } from '../../claim-letter.models';
import { ClaimLetterEligibilityChecklistComponent } from './claim-letter-eligibility-checklist.component';

function source(overrides: Partial<ClaimLetterEligibilitySource> = {}): ClaimLetterEligibilitySource {
  return { formType: 'DEVOLUTION_FORMULA', result: 'PASSED', reasonCode: 'FORM_STATUS_ACCEPTED', ...overrides };
}

describe('ClaimLetterEligibilityChecklistComponent', () => {
  let fixture: ComponentFixture<ClaimLetterEligibilityChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimLetterEligibilityChecklistComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ClaimLetterEligibilityChecklistComponent);
  });

  it('renders nothing when given zero sources', () => {
    fixture.componentRef.setInput('sources', []);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-cy="claim-letter-eligibility-checklist"]'))).toBeNull();
  });

  it('collapses to a single "all met" summary line when every source passes', () => {
    fixture.componentRef.setInput('sources', [source(), source({ formType: 'SFC_STATUS' })]);
    fixture.detectChanges();

    const summary = fixture.debugElement.query(By.css('[data-cy="claim-letter-eligibility-checklist"]'));
    expect(summary.nativeElement.textContent).toContain('All eligibility criteria met (2/2)');
    expect(fixture.debugElement.query(By.css('[data-cy="claim-letter-eligibility-checklist-items"]'))).toBeNull();
  });

  it('expands the itemized list when the toggle is clicked while passing', () => {
    fixture.componentRef.setInput('sources', [source()]);
    fixture.detectChanges();

    const toggle = fixture.debugElement.query(By.css('[data-cy="claim-letter-eligibility-checklist-toggle"]'));
    expect(toggle.nativeElement.textContent).toContain('Show details');
    toggle.nativeElement.click();
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-cy="claim-letter-eligibility-checklist-items"]'))).not.toBeNull();
    expect(toggle.nativeElement.textContent).toContain('Hide details');
  });

  it('auto-expands the itemized list, with no toggle, the moment anything is failing', () => {
    fixture.componentRef.setInput('sources', [
      source(),
      source({ formType: 'SFC_STATUS', result: 'FAILED', reasonCode: 'FORM_STATUS_3_NOT_ACCEPTED' }),
    ]);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-cy="claim-letter-eligibility-checklist-toggle"]'))).toBeNull();
    const items = fixture.debugElement.queryAll(By.css('[data-cy="claim-letter-eligibility-checklist-items"] li'));
    expect(items.length).toBe(2);
  });

  it('renders an Exempted badge for EXEMPTED sources without treating them as failures', () => {
    fixture.componentRef.setInput('sources', [source({ result: 'EXEMPTED' })]);
    fixture.detectChanges();

    // EXEMPTED counts as "not failed", so this still collapses to the passing summary line.
    const summary = fixture.debugElement.query(By.css('[data-cy="claim-letter-eligibility-checklist"]'));
    expect(summary.nativeElement.textContent).toContain('All eligibility criteria met (1/1)');

    (fixture.componentInstance as unknown as { toggleExpanded(): void }).toggleExpanded();
    fixture.detectChanges();

    const badge = fixture.debugElement.query(By.css('.badge'));
    expect(badge.nativeElement.textContent).toContain('Exempted');
  });

  it('prefers displayLabel/displayDescription over the humanized fallback', () => {
    fixture.componentRef.setInput('sources', [
      source({
        result: 'FAILED',
        displayLabel: 'Devolution Formula',
        displayDescription: 'Devolution Formula must be submitted by the state.',
      }),
    ]);
    fixture.detectChanges();

    const text = fixture.debugElement.query(By.css('[data-cy="claim-letter-eligibility-checklist-items"]'))
      .nativeElement.textContent;
    expect(text).toContain('Devolution Formula must be submitted by the state.');
  });

  it('falls back to a humanized label/description when the backend configured neither', () => {
    fixture.componentRef.setInput('sources', [source({ formType: 'SFC_STATUS', result: 'FAILED' })]);
    fixture.detectChanges();

    const text = fixture.debugElement.query(By.css('[data-cy="claim-letter-eligibility-checklist-items"]'))
      .nativeElement.textContent;
    expect(text).toContain('Sfc Status');
    expect(text).toContain('Sfc Status must be submitted by the state.');
  });
});
