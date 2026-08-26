import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SlbReviewComponent } from './slb-review.component';
import { SlbFormBodyComponent } from '../../../shared/slb-form-body/slb-form-body.component';
import { DynamicFormComponent } from '../../../../../shared/dynamic-form/dynamic-form.component';
import type { SlbFormData } from '../../../ulb-module/ulb-forms/slb/slb.models';
import type { ConditionalFieldConfig } from '../../../dynamic-form-visibility.service';

@Component({ selector: 'app-dynamic-form', standalone: true, template: '{{ field?.label }}: {{ field?.value }}' })
class MockDynamicFormComponent {
  @Input() field: unknown;
  @Input() group: unknown;
  @Input() mode: unknown;
}

function indicator(overrides: Partial<ConditionalFieldConfig> = {}): ConditionalFieldConfig {
  return {
    key: 'ind',
    label: 'Indicator',
    formFieldType: 'actualTarget',
    position: 1,
    value: { actual: 10, target: 20 },
    inputCardConfig: { suffixText: '%' },
    meta: { section: 'Water Supply' },
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
    await TestBed.configureTestingModule({ imports: [SlbReviewComponent] })
      .overrideComponent(SlbFormBodyComponent, {
        remove: { imports: [DynamicFormComponent] },
        add: { imports: [MockDynamicFormComponent] },
      })
      .compileComponents();
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

  it('renders the deemed-approved banner and no approve/return controls', () => {
    fixture.componentRef.setInput('data', formData());
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('deemed approved on submission');
    expect(fixture.nativeElement.querySelector('button[color="warn"]')).toBeNull();
  });

  it('groups actualTarget indicators by meta.section, preserving first-encounter order, in the shared table', () => {
    fixture.componentRef.setInput(
      'data',
      formData({
        questions: [
          indicator({ key: 'a', position: 1, meta: { section: 'Water Supply' } }),
          indicator({ key: 'b', position: 10, meta: { section: 'Solid Waste Management' } }),
          indicator({ key: 'c', position: 2, meta: { section: 'Water Supply' } }),
        ],
      }),
    );
    fixture.detectChanges();

    const sectionRows = (fixture.nativeElement as HTMLElement).querySelectorAll('.slb-section-row');
    expect(sectionRows.length).toBe(2);
    expect(sectionRows[0].textContent).toContain('Water Supply');
    expect(sectionRows[1].textContent).toContain('Solid Waste Management');
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

    const rows = (fixture.nativeElement as HTMLElement).querySelectorAll('.slb-indicator-table tbody tr');
    // one section-header row + one indicator row; the text field is rendered separately, not as a table row
    expect(rows.length).toBe(2);
  });

  it('renders declaration fields (name, designation, supporting document) read-only via app-dynamic-form', () => {
    fixture.componentRef.setInput(
      'data',
      formData({
        questions: [
          { key: 'declarantName', label: 'Name', formFieldType: 'text', value: 'K. Ramesh Babu' } as ConditionalFieldConfig,
          {
            key: 'declarantDesignation',
            label: 'Designation',
            formFieldType: 'text',
            value: 'Municipal Engineer',
          } as ConditionalFieldConfig,
        ],
      }),
    );
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('K. Ramesh Babu');
    expect(text).toContain('Municipal Engineer');
  });

  it('builds a disabled FormGroup so the shared form body renders in permanent read-only mode', () => {
    fixture.componentRef.setInput('data', formData({ questions: [indicator({ key: 'a' })] }));
    fixture.detectChanges();

    expect(component.form().disabled).toBeTrue();
  });
});
