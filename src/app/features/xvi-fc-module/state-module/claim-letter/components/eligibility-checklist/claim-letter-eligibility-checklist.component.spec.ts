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
    expect(summary.nativeElement.textContent).toContain('All state eligibility criteria met (2/2)');
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
    expect(summary.nativeElement.textContent).toContain('All state eligibility criteria met (1/1)');

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

  // ─── ULB-only criteria (no `result`) — own group, mirrors the state group exactly ────

  function ulbSource(overrides: Partial<ClaimLetterEligibilitySource> = {}): ClaimLetterEligibilitySource {
    return {
      formType: 'SLB',
      result: undefined,
      reasonCode: 'ULB_LEVEL_ONLY',
      ulbBreakdown: { eligible: 7, ineligible: 0, exempted: 0, total: 7 },
      ...overrides,
    };
  }

  function ulbItems() {
    return fixture.debugElement.queryAll(By.css('[data-cy="claim-letter-eligibility-checklist-ulb-items"] li'));
  }

  it('collapses the ULB-only group to its own "Submission Status" summary when ulbReadiness has at least 1 eligible ULB', () => {
    fixture.componentRef.setInput('sources', [ulbSource(), ulbSource({ formType: 'AUDITED' })]);
    fixture.componentRef.setInput('ulbReadiness', { eligible: 5, total: 7 });
    fixture.detectChanges();

    const panel = fixture.debugElement.query(By.css('[data-cy="claim-letter-eligibility-checklist"]'));
    expect(panel.nativeElement.textContent).toContain('ULB Submission Status (5/7)');
    expect(fixture.debugElement.query(By.css('[data-cy="claim-letter-eligibility-checklist-ulb-items"]'))).toBeNull();
  });

  it('expands the ULB-only itemized list when its toggle is clicked while ulbReadiness is passing', () => {
    fixture.componentRef.setInput('sources', [ulbSource()]);
    fixture.componentRef.setInput('ulbReadiness', { eligible: 7, total: 7 });
    fixture.detectChanges();

    const toggle = fixture.debugElement.query(By.css('[data-cy="claim-letter-eligibility-checklist-ulb-toggle"]'));
    expect(toggle.nativeElement.textContent).toContain('Show details');
    toggle.nativeElement.click();
    fixture.detectChanges();

    expect(ulbItems().length).toBe(1);
    expect(toggle.nativeElement.textContent).toContain('Hide details');
  });

  it('auto-expands the ULB-only list, with no toggle, the moment ulbReadiness has 0 eligible ULBs', () => {
    // The true-intersection stat is authoritative here, independent of any single item's own tally —
    // a fully-passing state gate must not hide a total ULB-level shortfall behind "Show details".
    fixture.componentRef.setInput('sources', [
      source(), // passing state item — collapses on its own
      ulbSource({ formType: 'AUDITED' }),
    ]);
    fixture.componentRef.setInput('ulbReadiness', { eligible: 0, total: 431 });
    fixture.detectChanges();

    expect(
      fixture.debugElement.query(By.css('[data-cy="claim-letter-eligibility-checklist-ulb-toggle"]')),
    ).toBeNull();
    expect(ulbItems().length).toBe(1);
  });

  it('renders a neutral primary info icon for every ULB-only item, regardless of ulbReadiness or the item\'s own tally', () => {
    fixture.componentRef.setInput('sources', [
      ulbSource({ ulbBreakdown: { eligible: 1, ineligible: 430, exempted: 0, total: 431 } }),
      ulbSource({ formType: 'AUDITED', ulbBreakdown: { eligible: 0, ineligible: 431, exempted: 0, total: 431 } }),
    ]);
    fixture.componentRef.setInput('ulbReadiness', { eligible: 0, total: 431 });
    fixture.detectChanges();

    for (const item of ulbItems()) {
      const icon = item.query(By.css('i'));
      expect(icon.nativeElement.classList).toContain('bi-info-circle-fill');
      expect(icon.nativeElement.classList).toContain('text-primary');
    }
  });

  it('excludes result-less items from the state-level "all passing" ratio and computation', () => {
    // A single passing state source + a no-result ULB-only item — the state ratio must read "1/1",
    // not "2/2", since the ULB-only item isn't a state-level pass/fail check.
    fixture.componentRef.setInput('sources', [source(), ulbSource()]);
    fixture.componentRef.setInput('ulbReadiness', { eligible: 7, total: 7 });
    fixture.detectChanges();

    const summary = fixture.debugElement.query(By.css('[data-cy="claim-letter-eligibility-checklist"]'));
    expect(summary.nativeElement.textContent).toContain('All state eligibility criteria met (1/1)');
  });

  it('appends the ULB count breakdown to the description when ulbBreakdown is present', () => {
    fixture.componentRef.setInput('sources', [
      source({
        formType: 'ELECTED_BODY',
        result: 'FAILED',
        displayLabel: 'Elected Body Constitution',
        displayDescription: 'Elected Body constitution must be submitted by the state.',
        ulbBreakdown: { eligible: 100, ineligible: 20, exempted: 3, total: 123 },
      }),
    ]);
    fixture.detectChanges();

    const text = fixture.debugElement.query(By.css('[data-cy="claim-letter-eligibility-checklist-items"]'))
      .nativeElement.textContent;
    expect(text).toContain(
      'Elected Body constitution must be submitted by the state. (100 eligible, 20 ineligible, 3 exempted out of 123 ULBs)',
    );
  });
});
