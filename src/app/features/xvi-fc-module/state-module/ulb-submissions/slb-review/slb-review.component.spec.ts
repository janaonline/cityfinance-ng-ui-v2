import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SlbReviewComponent } from './slb-review.component';
import type { SlbFormData } from '../../../ulb-module/ulb-forms/slb/slb.models';
import type { ConditionalFieldConfig } from '../../../dynamic-form-visibility.service';

function indicator(overrides: Partial<ConditionalFieldConfig> = {}): ConditionalFieldConfig {
  return {
    key: 'ind',
    label: 'Indicator',
    formFieldType: 'actualTarget',
    position: 1,
    value: { actual: 10, target: 20 },
    inputCardConfig: { suffixText: '%' },
    meta: { sector: 'Water Supply' },
    ...overrides,
  } as ConditionalFieldConfig;
}

function formData(overrides: Partial<SlbFormData> = {}): SlbFormData {
  return {
    _id: 'slb-1',
    formName: 'SLB',
    formId: 32,
    ulbId: 'ulb-1',
    yearId: 'year-1',
    designYear: '2026-27',
    actualYearLabel: '2025-26',
    ulbName: 'Test ULB',
    actors: [],
    currentFormStatus: 3,
    currentFormStatusLabel: 'Under Review by State',
    questions: [],
    permissions: { canView: true, canEdit: false, canFinalSubmit: false },
    meta: { version: 1 },
    ...overrides,
  } as SlbFormData;
}

describe('SlbReviewComponent', () => {
  let component: SlbReviewComponent;
  let fixture: ComponentFixture<SlbReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SlbReviewComponent] }).compileComponents();
    fixture = TestBed.createComponent(SlbReviewComponent);
    component = fixture.componentInstance;
  });

  it('renders nothing when data is null', () => {
    fixture.componentRef.setInput('data', null);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });

  it('derives the prior FY label from designYear', () => {
    fixture.componentRef.setInput('data', formData({ designYear: '2026-27' }));
    fixture.detectChanges();

    expect(component.priorYearLabel()).toBe('2025-26');
    expect(component.yearLabel()).toBe('2026-27');
  });

  it('groups actualTarget indicators by meta.sector, preserving first-encounter order', () => {
    fixture.componentRef.setInput(
      'data',
      formData({
        questions: [
          indicator({ key: 'a', position: 1, meta: { sector: 'Water Supply' } }),
          indicator({ key: 'b', position: 10, meta: { sector: 'Solid Waste Management' } }),
          indicator({ key: 'c', position: 2, meta: { sector: 'Water Supply' } }),
        ],
      }),
    );
    fixture.detectChanges();

    const groups = component.sectorGroups();
    expect(groups.map((g) => g.sector)).toEqual(['Water Supply', 'Solid Waste Management']);
    expect(groups[0].rows.map((r) => r.key)).toEqual(['a', 'c']);
    expect(groups[1].rows.map((r) => r.key)).toEqual(['b']);
  });

  it('excludes non-actualTarget fields (declaration fields) from the indicator table', () => {
    fixture.componentRef.setInput(
      'data',
      formData({
        questions: [
          indicator({ key: 'a' }),
          { key: 'declarantName', label: 'Name', formFieldType: 'text', value: 'K. Ramesh Babu' } as ConditionalFieldConfig,
        ],
      }),
    );
    fixture.detectChanges();

    const allKeys = component.sectorGroups().flatMap((g) => g.rows.map((r) => r.key));
    expect(allKeys).toEqual(['a']);
  });

  it('reads actual/target values and unit from inputCardConfig.suffixText', () => {
    fixture.componentRef.setInput(
      'data',
      formData({ questions: [indicator({ key: 'a', value: { actual: 151, target: 160 }, inputCardConfig: { suffixText: 'lpcd' } })] }),
    );
    fixture.detectChanges();

    const row = component.sectorGroups()[0].rows[0];
    expect(row.actual).toBe(151);
    expect(row.target).toBe(160);
    expect(row.unit).toBe('lpcd');
  });

  it('exposes declarant name/designation and supporting document from the questions array', () => {
    fixture.componentRef.setInput(
      'data',
      formData({
        questions: [
          { key: 'declarantName', label: 'Name', formFieldType: 'text', value: 'K. Ramesh Babu' } as ConditionalFieldConfig,
          { key: 'declarantDesignation', label: 'Designation', formFieldType: 'text', value: 'Municipal Engineer' } as ConditionalFieldConfig,
          {
            key: 'supportingDocumentFile',
            label: 'Supporting Document',
            formFieldType: 'file',
            value: { fileUrl: 'https://signed.example.com/doc.pdf', fileName: 'SLB_Workings.pdf' },
          } as ConditionalFieldConfig,
        ],
      }),
    );
    fixture.detectChanges();

    expect(component.declarantName()).toBe('K. Ramesh Babu');
    expect(component.declarantDesignation()).toBe('Municipal Engineer');
    expect(component.supportingDocument()).toEqual({ name: 'SLB_Workings.pdf', url: 'https://signed.example.com/doc.pdf' });
  });

  it('returns null supporting document when the field is absent', () => {
    fixture.componentRef.setInput('data', formData({ questions: [] }));
    fixture.detectChanges();

    expect(component.supportingDocument()).toBeNull();
  });

  it('opens the supporting document URL in a new tab', () => {
    fixture.componentRef.setInput(
      'data',
      formData({
        questions: [
          {
            key: 'supportingDocumentFile',
            label: 'Supporting Document',
            formFieldType: 'file',
            value: { fileUrl: 'https://signed.example.com/doc.pdf', fileName: 'doc.pdf' },
          } as ConditionalFieldConfig,
        ],
      }),
    );
    fixture.detectChanges();
    const openSpy = spyOn(window, 'open');

    component.openSupportingDocument();

    expect(openSpy).toHaveBeenCalledWith('https://signed.example.com/doc.pdf', '_blank', 'noopener');
  });

  it('renders the deemed-approved banner and no approve/return controls', () => {
    fixture.componentRef.setInput('data', formData());
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('deemed approved on submission');
    expect(fixture.nativeElement.querySelector('button[color="warn"]')).toBeNull();
  });
});
