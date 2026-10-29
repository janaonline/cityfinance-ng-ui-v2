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

  it('labels an Entire State exemption still under MoHUA review instead of Exempted', () => {
    fixture.componentRef.setInput('sources', [
      source({ formType: 'SFC_STATUS', result: 'EXEMPTED', exemptionStatus: 5 }),
    ]);
    fixture.detectChanges();
    (fixture.componentInstance as unknown as { toggleExpanded(): void }).toggleExpanded();
    fixture.detectChanges();

    const badge = fixture.debugElement.query(By.css('[data-cy="claim-letter-eligibility-checklist-under-review"]'));
    expect(badge.nativeElement.textContent).toContain('Exemption under review');
  });

  it('adds how many exempted ULBs are still under MoHUA review to the tally', () => {
    fixture.componentRef.setInput('sources', [
      source({
        formType: 'ELECTED_BODY',
        ulbBreakdown: { eligible: 1, ineligible: 0, exempted: 2, exemptedUnderReview: 1, total: 3 },
      }),
    ]);
    fixture.componentRef.setInput('ulbReadiness', { eligible: 3, total: 3 });
    fixture.detectChanges();
    (fixture.componentInstance as unknown as { toggleExpanded(): void }).toggleExpanded();
    fixture.detectChanges();

    const exempted = fixture.debugElement.query(
      By.css('[data-cy="claim-letter-eligibility-checklist-tally-exempted"]'),
    );
    expect(exempted.nativeElement.textContent.trim()).toBe('2 exempted (1 under review)');
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
    expect(panel.nativeElement.textContent).toContain('ULBs meeting all requirements (5/7)');
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

    expect(fixture.debugElement.query(By.css('[data-cy="claim-letter-eligibility-checklist-ulb-toggle"]'))).toBeNull();
    expect(ulbItems().length).toBe(1);
  });

  it("renders a neutral primary info icon for every ULB-only item, regardless of ulbReadiness or the item's own tally", () => {
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

  it('lists each State form that judges ULBs once under ULBs, red with its count or green when all meet it', () => {
    const electedBody = source({
      formType: 'ELECTED_BODY',
      displayLabel: 'Elected Body Constitution',
      ulbBreakdown: { eligible: 14, ineligible: 6, exempted: 0, total: 20 },
    });
    const fcUnspent = source({
      formType: 'FC_UNSPENT_STATE',
      displayLabel: '14th FC Unspent Balance Declaration',
      ulbBreakdown: { eligible: 20, ineligible: 0, exempted: 0, total: 20 },
    });
    fixture.componentRef.setInput('sources', [electedBody, fcUnspent, source(), ulbSource()]);
    fixture.componentRef.setInput('ulbReadiness', { eligible: 14, total: 20 });
    fixture.detectChanges();
    fixture.debugElement
      .query(By.css('[data-cy="claim-letter-eligibility-checklist-ulb-toggle"]'))
      .nativeElement.click();
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('[data-cy="claim-letter-eligibility-checklist-ulb-row-form"]'));
    const text = rows.map((li) => li.nativeElement.textContent.replace(/\s+/g, ' ').trim());
    expect(text).toEqual([
      'Elected Body Constitution 6 ULBs do not meet this',
      '14th FC Unspent Balance Declaration All 20 ULBs meet this',
    ]);
    expect(rows[0].query(By.css('i')).nativeElement.classList).toContain('text-danger');
    expect(rows[1].query(By.css('i')).nativeElement.classList).toContain('text-success');
    // 2 row-level State forms + the 1 ULB form (unchanged, blue info).
    expect(ulbItems().length).toBe(3);
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

    const items = fixture.debugElement.query(By.css('[data-cy="claim-letter-eligibility-checklist-items"]'));
    expect(items.nativeElement.textContent.replace(/\s+/g, ' ')).toContain(
      'Elected Body constitution must be submitted by the state. (100 eligible, 3 exempted, 20 ineligible out of 123 ULBs)',
    );
    const count = (name: string) =>
      items.query(By.css(`[data-cy="claim-letter-eligibility-checklist-tally-${name}"]`)).nativeElement.classList;
    expect(count('eligible')).toContain('text-success');
    expect(count('exempted')).toContain('text-success');
    expect(count('ineligible')).toContain('text-danger');
  });

  it('leaves a zero count in the muted text colour', () => {
    fixture.componentRef.setInput('sources', [
      source({
        formType: 'ELECTED_BODY',
        result: 'FAILED',
        ulbBreakdown: { eligible: 0, ineligible: 20, exempted: 0, total: 20 },
      }),
    ]);
    fixture.detectChanges();

    const count = (name: string) =>
      fixture.debugElement.query(By.css(`[data-cy="claim-letter-eligibility-checklist-tally-${name}"]`)).nativeElement
        .classList;
    expect(count('eligible')).not.toContain('text-success');
    expect(count('exempted')).not.toContain('text-success');
    expect(count('ineligible')).toContain('text-danger');
  });
});
