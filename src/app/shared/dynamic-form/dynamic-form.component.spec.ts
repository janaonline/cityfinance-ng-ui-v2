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

describe('DynamicFormComponent — supporting content integration', () => {
  let fixture: ComponentFixture<DynamicFormComponent>;
  let component: DynamicFormComponent;
  let group: FormGroup;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicFormComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

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

    // before instance renders before-positioned content
    expect(beforeEl.nativeElement.textContent).toContain('Before');
    expect(beforeEl.nativeElement.textContent).not.toContain('After');

    // after instance renders after-positioned content
    expect(afterEl.nativeElement.textContent).not.toContain('Before');
    expect(afterEl.nativeElement.textContent).toContain('After');
  });

  it('renders normally when supportingContent is not provided', () => {
    component.field = { formFieldType: 'text', key: 'testField', label: 'Test' };
    component.group = group;
    fixture.detectChanges();

    // supporting content elements are present but empty
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
