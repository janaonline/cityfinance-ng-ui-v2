import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { DynamicFormComponent } from './dynamic-form.component';
import { DynamicFieldSupportingContentComponent } from './components/field-supporting-content/field-supporting-content.component';
import { FieldSupportingContent } from './field.interface';

xdescribe('DynamicFormComponent', () => {
  let component: DynamicFormComponent;
  let fixture: ComponentFixture<DynamicFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} }], imports: [HttpClientTestingModule, RouterTestingModule, DynamicFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Shared test-module setup
// ---------------------------------------------------------------------------

function configureTestingModule(): Promise<void> {
  return TestBed.configureTestingModule({
    imports: [DynamicFormComponent, HttpClientTestingModule, RouterTestingModule],
    providers: [
      { provide: MatDialogRef, useValue: { close: () => undefined } },
      { provide: MAT_DIALOG_DATA, useValue: {} },
    ],
  }).compileComponents();
}

// ---------------------------------------------------------------------------
// Supporting content integration
// ---------------------------------------------------------------------------

describe('DynamicFormComponent — supporting content integration', () => {
  let fixture: ComponentFixture<DynamicFormComponent>;
  let component: DynamicFormComponent;
  let group: FormGroup;

  beforeEach(async () => {
    await configureTestingModule();

    fixture = TestBed.createComponent(DynamicFormComponent);
    component = fixture.componentInstance;

    const fb = new FormBuilder();
    group = fb.group({ testField: [''] });
  });

  it('renders two app-field-supporting-content instances for any field', () => {
    component.field = { formFieldType: 'text', key: 'testField', label: 'Test' };
    component.group = group;
    fixture.detectChanges();

    const contentEls = fixture.debugElement.queryAll(
      By.directive(DynamicFieldSupportingContentComponent),
    );
    expect(contentEls.length).toBe(2);
  });

  it('passes field.supportingContent to both instances', () => {
    const supportingContent: FieldSupportingContent[] = [
      { type: 'info', description: 'Before', position: 'before' },
      { type: 'warning', description: 'After', position: 'after' },
    ];
    component.field = {
      formFieldType: 'text',
      key: 'testField',
      label: 'Test',
      supportingContent,
    };
    component.group = group;
    fixture.detectChanges();

    const [beforeEl, afterEl] = fixture.debugElement.queryAll(
      By.directive(DynamicFieldSupportingContentComponent),
    );

    expect(beforeEl.nativeElement.textContent).toContain('Before');
    expect(beforeEl.nativeElement.textContent).not.toContain('After');

    expect(afterEl.nativeElement.textContent).not.toContain('Before');
    expect(afterEl.nativeElement.textContent).toContain('After');
  });

  it('renders normally when supportingContent is not provided', () => {
    component.field = { formFieldType: 'text', key: 'testField', label: 'Test' };
    component.group = group;
    fixture.detectChanges();

    const contentEls = fixture.debugElement.queryAll(
      By.directive(DynamicFieldSupportingContentComponent),
    );
    expect(contentEls.length).toBe(2);
    contentEls.forEach((el) => expect(el.nativeElement.textContent.trim()).toBe(''));
  });

  it('renders the correct field sub-component for each formFieldType', () => {
    component.field = { formFieldType: 'textarea', key: 'testField', label: 'Notes' };
    component.group = group;
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('app-textarea'))).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Inline layout
// ---------------------------------------------------------------------------

describe('DynamicFormComponent — inline layout', () => {
  let fixture: ComponentFixture<DynamicFormComponent>;
  let component: DynamicFormComponent;
  let group: FormGroup;

  beforeEach(async () => {
    await configureTestingModule();

    fixture = TestBed.createComponent(DynamicFormComponent);
    component = fixture.componentInstance;

    const fb = new FormBuilder();
    group = fb.group({ testField: [''] });
  });

  it('does not render a row wrapper when layout is not set', () => {
    component.field = { formFieldType: 'text', key: 'testField', label: 'Test' };
    component.group = group;
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.row'))).toBeNull();
  });

  it('does not render a row wrapper when layout.variant is stacked', () => {
    component.field = {
      formFieldType: 'text',
      key: 'testField',
      label: 'Test',
      layout: { variant: 'stacked' },
    };
    component.group = group;
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.row'))).toBeNull();
  });

  it('renders a row wrapper when layout.variant is inline', () => {
    component.field = {
      formFieldType: 'text',
      key: 'testField',
      label: 'Inline Label',
      layout: { variant: 'inline' },
    };
    component.group = group;
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.row'))).toBeTruthy();
  });

  it('shows the field label in the left column for inline layout', () => {
    component.field = {
      formFieldType: 'text',
      key: 'testField',
      label: 'My Question',
      layout: { variant: 'inline' },
    };
    component.group = group;
    fixture.detectChanges();

    const label = fixture.debugElement.query(By.css('label.col-form-label'));
    expect(label).toBeTruthy();
    expect(label.nativeElement.textContent.trim()).toContain('My Question');
  });

  it('sets hideLabel: true on fieldForRenderer for inline layout', () => {
    component.field = {
      formFieldType: 'text',
      key: 'testField',
      label: 'Label',
      layout: { variant: 'inline' },
    };
    component.group = group;
    fixture.detectChanges();

    expect(component.fieldForRenderer.hideLabel).toBeTrue();
  });

  it('does not set hideLabel on fieldForRenderer for stacked layout', () => {
    component.field = { formFieldType: 'text', key: 'testField', label: 'Label' };
    component.group = group;
    fixture.detectChanges();

    expect(component.fieldForRenderer.hideLabel).toBeFalsy();
  });

  it('does not mutate the original field object for inline layout', () => {
    const field = { formFieldType: 'text', key: 'testField', label: 'Label', layout: { variant: 'inline' } };
    component.field = field;
    component.group = group;
    fixture.detectChanges();

    expect((field as any).hideLabel).toBeUndefined();
  });

  it('applies col-md-3 / col-md-9 for labelWidth sm', () => {
    component.field = {
      formFieldType: 'text',
      key: 'testField',
      label: 'L',
      layout: { variant: 'inline', labelWidth: 'sm' },
    };
    component.group = group;
    fixture.detectChanges();

    expect(component.labelColClass).toBe('col-md-3');
    expect(component.controlColClass).toBe('col-md-9');
  });

  it('applies col-md-4 / col-md-8 for labelWidth md (default)', () => {
    component.field = {
      formFieldType: 'text',
      key: 'testField',
      label: 'L',
      layout: { variant: 'inline' },
    };
    component.group = group;
    fixture.detectChanges();

    expect(component.labelColClass).toBe('col-md-4');
    expect(component.controlColClass).toBe('col-md-8');
  });

  it('applies col-md-5 / col-md-7 for labelWidth lg', () => {
    component.field = {
      formFieldType: 'text',
      key: 'testField',
      label: 'L',
      layout: { variant: 'inline', labelWidth: 'lg' },
    };
    component.group = group;
    fixture.detectChanges();

    expect(component.labelColClass).toBe('col-md-5');
    expect(component.controlColClass).toBe('col-md-7');
  });

  it('supporting content still renders in inline layout', () => {
    component.field = {
      formFieldType: 'text',
      key: 'testField',
      label: 'Label',
      layout: { variant: 'inline' },
      supportingContent: [{ type: 'info', description: 'Inline info', position: 'before' }],
    };
    component.group = group;
    fixture.detectChanges();

    const contentEls = fixture.debugElement.queryAll(
      By.directive(DynamicFieldSupportingContentComponent),
    );
    expect(contentEls.length).toBe(2);
    // the before-position instance is inside the right column
    expect(contentEls[0].nativeElement.textContent).toContain('Inline info');
  });

  it('updates fieldForRenderer when field input changes', () => {
    component.field = { formFieldType: 'text', key: 'testField', label: 'Label' };
    component.group = group;
    fixture.detectChanges();

    expect(component.fieldForRenderer.hideLabel).toBeFalsy();

    // simulate input change
    component.field = {
      formFieldType: 'text',
      key: 'testField',
      label: 'Label',
      layout: { variant: 'inline' },
    };
    component.ngOnChanges({ field: {} as any });
    fixture.detectChanges();

    expect(component.fieldForRenderer.hideLabel).toBeTrue();
  });
});
