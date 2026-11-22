import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import type { ConditionalFieldConfig } from '../../../dynamic-form-visibility.service';
import { OmContent } from '../om-generation.models';
import { OmDocumentComponent } from './om-document.component';

const p = (text: string, extra: Record<string, unknown> = {}) => ({ runs: [{ text, ...extra }] });

const content: OmContent = {
  claimLetterId: 'c1',
  claimLetterRefNo: 'CL/AP/2026-27/1-2',
  stateName: 'Andhra Pradesh',
  designYearLabel: '2026-27',
  installment: 1,
  ulbCount: 12,
  stateUlbTotal: 123,
  totalAmount: 500_000_000,
  yearAllocation: null,
  number: { runs: [{ text: 'No. ' }, { text: 'No.', placeholder: true, field: 'omNumber' }] },
  letterhead: [p('Government of India', { bold: true })],
  address: [p('KG Marg, New Delhi')],
  title: 'OFFICE MEMORANDUM',
  subject: p('Subject: Recommendation'),
  intro: p('The undersigned is directed'),
  complianceHeaders: ['S. No.', 'Condition', 'Status'],
  compliance: [{ key: 'C.', condition: [p('Constituted ULBs')], status: [p('107/123 (87%)')] }],
  analysis: { runs: [{ text: 'In view of the above' }], number: '2.' },
  recommendationHeaders: ['State', 'Allocation', 'Recommendation'],
  recommendation: [p('Andhra Pradesh'), p('Not available'), p('1st installment of Rs. 5,000.00 lakh')],
  closing: [],
  enclosure: p('Encl: As above.'),
  signature: [p('(P.K. Dhyani)')],
  addressee: [p('To,')],
};

describe('OmDocumentComponent', () => {
  let fixture: ComponentFixture<OmDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OmDocumentComponent],
      providers: [provideNativeDateAdapter()],
    }).compileComponents();
    fixture = TestBed.createComponent(OmDocumentComponent);
    fixture.componentRef.setInput('content', content);
  });

  it('renders the OM read-only, the empty box as a highlighted placeholder', () => {
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('.om-title')?.textContent).toContain('OFFICE MEMORANDUM');
    expect(host.querySelector('.om-compliance')?.textContent).toContain('107/123 (87%)');
    expect(host.querySelector('.om-placeholder')?.textContent).toBe('No.');
    expect(host.querySelector('app-claim-letter-letter-field')).toBeNull();
  });

  it('draws an inline box for each editable run while an editor is passed', () => {
    const field = { key: 'omNumber', label: 'OM No.', formFieldType: 'text', required: true } as ConditionalFieldConfig;
    fixture.componentRef.setInput('editor', { fields: { omNumber: field }, controls: { omNumber: new FormControl('') } });
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelectorAll('app-claim-letter-letter-field').length).toBe(1);
  });
});
