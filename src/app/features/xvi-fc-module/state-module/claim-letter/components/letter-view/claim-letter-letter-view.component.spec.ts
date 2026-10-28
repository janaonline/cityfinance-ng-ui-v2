import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ClaimLetterDocument, ClaimLetterParagraph } from '../../claim-letter.models';
import { ClaimLetterLetterViewComponent, ClaimLetterListPage } from './claim-letter-letter-view.component';

const p = (text: string, extra: Partial<ClaimLetterParagraph> = {}): ClaimLetterParagraph => ({
  runs: [{ text }],
  ...extra,
});

function documentWith(totals: { eligible: number; ineligible: number }): ClaimLetterDocument {
  return {
    refNo: 'CL/SS/2026-27/1-2',
    stateName: 'Sample State',
    designYearLabel: '2026-27',
    installment: 1,
    batchNumber: 2,
    asOn: '27 Oct 2026, 15:30',
    letter: {
      letterhead: {
        runs: [
          { text: 'GOVERNMENT OF SAMPLE STATE', bold: true },
          { text: '\n' },
          { text: '<NAME OF DEPARTMENT>', placeholder: true, field: 'departmentName' },
        ],
      },
      letterNo: p('Letter No.: UD/1'),
      refAndDate: p('CF Ref No.- CL/SS/2026-27/1-2'),
      addressee: p('To,'),
      subject: p('Subject'),
      referencesTitle: 'Reference:',
      references: [
        p('Operational Guidelines', { number: '1.' }),
        {
          runs: [
            { text: 'MoHUA letter/guidelines' },
            { text: '', field: 'mohuaReferenceDate', lead: ' dated ' },
            { text: ', if applicable.' },
          ],
          number: '2.',
        },
      ],
      salutation: p('Sir/Madam,'),
      body: [p('The undersigned')],
      complianceHeaders: ['S. No.', 'Condition', 'Status'],
      compliance: [{ key: 'A.', condition: [p('GTC')], status: [p('b) No')] }],
      note: p('Note'),
      closing: [p('Requested', { number: '5.' })],
      signOff: p('Yours faithfully,'),
      signature: { runs: [{ text: '<Signature>', placeholder: true }] },
    },
    annexure: {
      title: 'Annexure',
      columns: [
        { header: 'S. No.', kind: 'serial' },
        { header: 'ULB Name', kind: 'name' },
        { header: 'Tied (₹ lakh)', kind: 'amount' },
      ],
      lists: [
        {
          key: 'ELIGIBLE',
          heading: '1. List of Eligible ULBs',
          subheading: 'ULBs in this proposal.',
          total: totals.eligible,
        },
        {
          key: 'INELIGIBLE',
          heading: '2. List of Ineligible ULBs',
          subheading: 'For record.',
          total: totals.ineligible,
        },
      ],
    },
  };
}

const page = (rows: string[][]): ClaimLetterListPage => ({
  rows: rows.map((cells, i) => ({ ulbId: `u${i}`, cells })),
  pageIndex: 0,
  loading: false,
});

describe('ClaimLetterLetterViewComponent', () => {
  let fixture: ComponentFixture<ClaimLetterLetterViewComponent>;

  function render(totals: { eligible: number; ineligible: number }): HTMLElement {
    fixture = TestBed.createComponent(ClaimLetterLetterViewComponent);
    fixture.componentRef.setInput('document', documentWith(totals));
    fixture.componentRef.setInput('pages', {
      ELIGIBLE: page([['1', 'Sample Town', '617.28']]),
      INELIGIBLE: page([]),
    });
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ClaimLetterLetterViewComponent, NoopAnimationsModule] });
  });

  it('renders backend text verbatim, highlighting placeholders', () => {
    const el = render({ eligible: 1, ineligible: 0 });

    expect(el.textContent).toContain('GOVERNMENT OF SAMPLE STATE');
    const placeholders = Array.from(el.querySelectorAll('.cl-placeholder')).map((n) => n.textContent);
    expect(placeholders).toEqual(['<NAME OF DEPARTMENT>', '<Signature>']);
    expect(el.querySelector('.cl-numbered .cl-number')?.textContent).toBe('1.');
  });

  it('prints a slot lead only before a filled value', () => {
    const el = render({ eligible: 1, ineligible: 0 });

    expect(el.textContent).toContain('MoHUA letter/guidelines, if applicable.');
    expect(el.textContent).not.toContain('dated');
  });

  it('draws an inline box for each slot that has an editor control, and keeps the rest as text', () => {
    const el = render({ eligible: 1, ineligible: 0 });
    const committed: string[] = [];
    fixture.componentInstance.fieldCommitted.subscribe((key) => committed.push(key));

    fixture.componentRef.setInput('editor', {
      controls: { departmentName: new FormControl('Urban Development') },
      fields: {
        departmentName: { key: 'departmentName', formFieldType: 'text', label: 'Name of the department' },
      },
    });
    fixture.detectChanges();

    const input = el.querySelector<HTMLInputElement>('input#cl-field-departmentName')!;
    expect(input.value).toBe('Urban Development');
    expect(el.querySelector('#cl-field-mohuaReferenceDate')).toBeNull();
    expect(Array.from(el.querySelectorAll('.cl-placeholder')).map((n) => n.textContent)).toEqual(['<Signature>']);

    input.dispatchEvent(new Event('blur'));
    expect(committed).toEqual(['departmentName']);
  });

  it('shows rows with column alignment, and Nil for an empty list', () => {
    const el = render({ eligible: 1, ineligible: 0 });

    const cells = el.querySelectorAll('[data-cy="claim-letter-list-ELIGIBLE"] tbody td');
    expect(Array.from(cells).map((c) => c.textContent?.trim())).toEqual(['1', 'Sample Town', '617.28']);
    expect(cells[2].classList).toContain('text-end');
    expect(el.querySelector('[data-cy="claim-letter-list-INELIGIBLE"]')).toBeNull();
    expect(el.textContent).toContain('Nil');
  });

  it('pages a list over 20 rows and reports the page change', () => {
    const el = render({ eligible: 45, ineligible: 0 });
    const emitted: unknown[] = [];
    fixture.componentInstance.pageChange.subscribe((e) => emitted.push(e));

    const next = el.querySelector<HTMLButtonElement>('.mat-mdc-paginator-navigation-next');
    next?.click();

    expect(emitted).toEqual([{ list: 'ELIGIBLE', pageIndex: 1 }]);
  });
});
