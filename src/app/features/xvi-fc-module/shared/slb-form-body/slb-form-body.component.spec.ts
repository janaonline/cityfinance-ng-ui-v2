import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
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

  describe('supporting document radio toggle', () => {
    function declarationFieldList(): ConditionalFieldConfig[] {
      return [
        {
          key: 'supportingDocumentType',
          label: 'Supporting Document',
          formFieldType: 'radio',
          options: [
            { label: 'I have a source document for these figures', id: 'HAS_SOURCE_DOCUMENT' },
            { label: "I don't have a source document", id: 'NO_SOURCE_DOCUMENT' },
          ],
        },
        {
          key: 'supportingDocumentFile',
          label: 'Supporting Document',
          formFieldType: 'file',
          value: null,
        },
        {
          key: 'checkboxConfirmation',
          label: 'I certify...',
          formFieldType: 'checkbox',
          value: false,
        },
      ] as ConditionalFieldConfig[];
    }

    function buildDeclarationForm(choice: string | null): FormGroup {
      return new FormGroup({
        supportingDocumentType: new FormControl(choice),
        supportingDocumentFile: new FormControl(null),
        checkboxConfirmation: new FormControl(false),
      });
    }

    it('hides the upload entirely until the ULB picks a radio option', () => {
      const fieldList = declarationFieldList();
      fixture.componentRef.setInput('form', buildDeclarationForm(null));
      fixture.componentRef.setInput('fields', fieldList);
      fixture.componentRef.setInput('mode', 'edit');
      fixture.detectChanges();

      expect(component.hasNoSourceDocument()).toBeFalse();
      expect(component.hasSourceDocument()).toBeFalse();
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.slb-statement-steps')).toBeNull();
      // Only the radio + checkbox render — no upload for either branch.
      expect(el.querySelectorAll('app-dynamic-form').length).toBe(2);
    });

    it('shows the plain upload when a source document is available', () => {
      const fieldList = declarationFieldList();
      fixture.componentRef.setInput('form', buildDeclarationForm('HAS_SOURCE_DOCUMENT'));
      fixture.componentRef.setInput('fields', fieldList);
      fixture.componentRef.setInput('mode', 'edit');
      fixture.detectChanges();

      expect(component.hasNoSourceDocument()).toBeFalse();
      expect(component.hasSourceDocument()).toBeTrue();
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.slb-statement-steps')).toBeNull();
      expect(el.querySelectorAll('app-dynamic-form').length).toBe(3);
    });

    it('shows the 3-step generate/sign/upload flow when no source document is available', () => {
      const fieldList = declarationFieldList();
      fixture.componentRef.setInput('form', buildDeclarationForm('NO_SOURCE_DOCUMENT'));
      fixture.componentRef.setInput('fields', fieldList);
      fixture.componentRef.setInput('mode', 'edit');
      fixture.detectChanges();

      expect(component.hasNoSourceDocument()).toBeTrue();
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.slb-statement-steps')).not.toBeNull();
    });

    it('switches live between the generated-statement flow and the plain upload', () => {
      const fieldList = declarationFieldList();
      const form = buildDeclarationForm(null);
      fixture.componentRef.setInput('form', form);
      fixture.componentRef.setInput('fields', fieldList);
      fixture.componentRef.setInput('mode', 'edit');
      fixture.detectChanges();

      form.get('supportingDocumentType')?.setValue('NO_SOURCE_DOCUMENT');
      fixture.detectChanges();
      let el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.slb-statement-steps')).not.toBeNull();
      expect(el.querySelector('.slb-statement-step button')).not.toBeNull();

      form.get('supportingDocumentType')?.setValue('HAS_SOURCE_DOCUMENT');
      fixture.detectChanges();
      el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.slb-statement-steps')).toBeNull();
      expect(el.querySelectorAll('app-dynamic-form').length).toBe(3);
    });

    it('emits generateSlbStatement when the download step button is clicked', () => {
      const fieldList = declarationFieldList();
      fixture.componentRef.setInput('form', buildDeclarationForm('NO_SOURCE_DOCUMENT'));
      fixture.componentRef.setInput('fields', fieldList);
      fixture.componentRef.setInput('mode', 'edit');
      fixture.detectChanges();

      let emitted = false;
      component.generateSlbStatement.subscribe(() => (emitted = true));

      const el = fixture.nativeElement as HTMLElement;
      (el.querySelector('.slb-statement-step button') as HTMLButtonElement).click();

      expect(emitted).toBeTrue();
    });

    it('does not render the download button in view mode', () => {
      const fieldList = declarationFieldList();
      fixture.componentRef.setInput('form', buildDeclarationForm('NO_SOURCE_DOCUMENT'));
      fixture.componentRef.setInput('fields', fieldList);
      fixture.componentRef.setInput('mode', 'view');
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.slb-statement-step button')).toBeNull();
    });
  });
});
