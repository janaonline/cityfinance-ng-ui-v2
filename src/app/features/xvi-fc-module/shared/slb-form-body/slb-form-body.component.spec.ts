import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { DynamicFormComponent } from '../../../../shared/dynamic-form/dynamic-form.component';
import { DynamicFormService } from '../../../../shared/dynamic-form/dynamic-form.service';
import { SlbFormBodyComponent } from './slb-form-body.component';
import { ConditionalFieldConfig } from '../../dynamic-form-visibility.service';

@Component({ selector: 'app-dynamic-form', standalone: true, template: '{{ field?.label }}' })
class MockDynamicFormComponent {
  @Input() field: unknown;
  @Input() group: unknown;
  @Input() mode: unknown;
}

function fields(): ConditionalFieldConfig[] {
  return [
    {
      key: 'ind1',
      label: 'Per capita supply of water',
      position: 1,
      formFieldType: 'actualTarget',
      value: null,
      inputCardConfig: { suffixText: 'lpcd' },
      validations: [{ name: 'required', validator: true, message: 'This field is required.' }],
      meta: { section: 'Water Supply' },
    },
    {
      key: 'ind10',
      label: 'Adequacy of waste water treatment capacity',
      position: 10,
      formFieldType: 'actualTarget',
      value: null,
      inputCardConfig: { suffixText: '%' },
      validations: [],
      meta: { section: 'Sewerage Management' },
    },
    {
      key: 'declarantName',
      label: 'Name',
      formFieldType: 'text',
      value: 'K. Ramesh Babu',
    },
  ] as ConditionalFieldConfig[];
}

describe('SlbFormBodyComponent', () => {
  let fixture: ComponentFixture<SlbFormBodyComponent>;
  let component: SlbFormBodyComponent;
  let dynamicService: DynamicFormService;

  function buildForm(fieldList: ConditionalFieldConfig[], readonly: boolean): FormGroup {
    const form = new FormGroup({});
    for (const field of fieldList) {
      form.addControl(field.key!, dynamicService.createContorl(field, false, readonly));
    }
    return form;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SlbFormBodyComponent] })
      .overrideComponent(SlbFormBodyComponent, {
        remove: { imports: [DynamicFormComponent] },
        add: { imports: [MockDynamicFormComponent] },
      })
      .compileComponents();

    dynamicService = TestBed.inject(DynamicFormService);
    fixture = TestBed.createComponent(SlbFormBodyComponent);
    component = fixture.componentInstance;
  });

  it('groups indicator fields by meta.section, preserving order of first appearance', () => {
    const fieldList = fields();
    fixture.componentRef.setInput('form', buildForm(fieldList, true));
    fixture.componentRef.setInput('fields', fieldList);
    fixture.componentRef.setInput('mode', 'view');
    fixture.detectChanges();

    expect(component.groupedIndicatorFields().map((g) => g.section)).toEqual(['Water Supply', 'Sewerage Management']);
  });

  it('falls back to the empty section bucket when meta.section is absent', () => {
    const fieldList = fields().map((f) =>
      f.formFieldType === 'actualTarget' ? ({ ...f, meta: {} } as ConditionalFieldConfig) : f,
    );
    fixture.componentRef.setInput('form', buildForm(fieldList, true));
    fixture.componentRef.setInput('fields', fieldList);
    fixture.componentRef.setInput('mode', 'view');
    fixture.detectChanges();

    expect(component.groupedIndicatorFields().map((g) => g.section)).toEqual(['']);
  });

  it('renders editable inputs in edit mode and plain values in view mode', () => {
    const fieldList = fields();
    fixture.componentRef.setInput('fields', fieldList);

    fixture.componentRef.setInput('form', buildForm(fieldList, false));
    fixture.componentRef.setInput('mode', 'edit');
    fixture.detectChanges();
    let el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-cy="ind1_actual-test"]')?.tagName).toBe('INPUT');

    fixture.componentRef.setInput('form', buildForm(fieldList, true));
    fixture.componentRef.setInput('mode', 'view');
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-cy="ind1_actual-test"]')?.tagName).toBe('SPAN');
  });

  it('flags an indicator sub-control error only once touched or dirty', () => {
    const fieldList = fields();
    const form = buildForm(fieldList, false);
    fixture.componentRef.setInput('form', form);
    fixture.componentRef.setInput('fields', fieldList);
    fixture.componentRef.setInput('mode', 'edit');
    fixture.detectChanges();

    expect(component.hasIndicatorError('ind1', 'actual', 'required')).toBeFalse();

    form.get('ind1.actual')?.markAsTouched();
    fixture.detectChanges();

    expect(component.hasIndicatorError('ind1', 'actual', 'required')).toBeTrue();
  });
});
