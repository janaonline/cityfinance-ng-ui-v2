import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormBuilder } from '@angular/forms';
import { ConditionalFieldConfig } from '../../dynamic-form-visibility.service';
import { SlbFormBodyComponent } from '../slb-form-body/slb-form-body.component';
import { SlbPreviewContentComponent } from './slb-preview-content.component';

@Component({ selector: 'app-slb-form-body', standalone: true, template: '' })
class MockSlbFormBodyComponent {
  @Input() form: unknown;
  @Input() fields: unknown;
  @Input() mode: unknown;
  @Input() actualYearLabel: unknown;
  @Input() targetYearLabel: unknown;
}

describe('SlbPreviewContentComponent', () => {
  let fixture: ComponentFixture<SlbPreviewContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlbPreviewContentComponent],
    })
      .overrideComponent(SlbPreviewContentComponent, {
        remove: { imports: [SlbFormBodyComponent] },
        add: { imports: [MockSlbFormBodyComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SlbPreviewContentComponent);
    fixture.componentRef.setInput('form', new FormBuilder().group({}));
    fixture.componentRef.setInput('fields', [] as ConditionalFieldConfig[]);
    fixture.componentRef.setInput('ulbName', 'Test ULB');
    fixture.componentRef.setInput('formStatusLabel', 'Not Started');
    fixture.detectChanges();
  });

  it('renders the ULB name, title, and status label', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Test ULB');
    expect(element.textContent).toContain('Service Level Benchmarks');
    expect(element.textContent).toContain('Not Started');
  });

  it('delegates to app-slb-form-body in read-only mode', () => {
    const formBody = fixture.debugElement.query(By.directive(MockSlbFormBodyComponent));
    expect(formBody).toBeTruthy();
    expect((formBody.componentInstance as MockSlbFormBodyComponent).mode).toBe('view');
  });

  it('passes the actual and target financial-year labels to the form body', () => {
    fixture.componentRef.setInput('actualYearLabel', '2025-26');
    fixture.componentRef.setInput('targetYearLabel', '2026-27');
    fixture.detectChanges();

    const formBody = fixture.debugElement.query(By.directive(MockSlbFormBodyComponent));
    const body = formBody.componentInstance as MockSlbFormBodyComponent;
    expect(body.actualYearLabel).toBe('2025-26');
    expect(body.targetYearLabel).toBe('2026-27');
  });

  it('applies the PDF-only heading and status options without affecting the ULB heading', () => {
    fixture.componentRef.setInput('targetYearLabel', '2026-27');
    fixture.componentRef.setInput('showFyInHeading', true);
    fixture.componentRef.setInput('hideStatusPill', true);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.preview-title')?.textContent).toContain('Service Level Benchmarks');
    expect(element.querySelector('.fy-heading-suffix')?.textContent?.trim()).toBe('(FY 2026-27)');
    expect(element.querySelector('.status-pill')).toBeNull();
    expect(element.textContent).toContain('Test ULB');
  });

  it('does not show an empty FY suffix when the target year is unavailable', () => {
    fixture.componentRef.setInput('showFyInHeading', true);
    fixture.componentRef.setInput('targetYearLabel', null);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('.fy-heading-suffix')).toBeNull();
  });

  it('omits both the supporting-document radio and file fields when hideSupportingDocument is set (PDF export)', () => {
    const fields = [
      { key: 'supportingDocumentType', formFieldType: 'radio', label: 'Supporting Document' },
      { key: 'supportingDocumentFile', formFieldType: 'file', label: 'Supporting Document' },
      { key: 'checkboxConfirmation', formFieldType: 'checkbox', label: 'I certify...' },
    ] as ConditionalFieldConfig[];
    fixture.componentRef.setInput('fields', fields);
    fixture.componentRef.setInput('hideSupportingDocument', true);
    fixture.detectChanges();

    const formBody = fixture.debugElement.query(By.directive(MockSlbFormBodyComponent));
    const passedFields = (formBody.componentInstance as MockSlbFormBodyComponent).fields as ConditionalFieldConfig[];
    expect(passedFields.map((f) => f.key)).toEqual(['checkboxConfirmation']);
  });

  it('keeps the supporting-document fields when hideSupportingDocument is not set', () => {
    const fields = [
      { key: 'supportingDocumentType', formFieldType: 'radio', label: 'Supporting Document' },
      { key: 'supportingDocumentFile', formFieldType: 'file', label: 'Supporting Document' },
      { key: 'checkboxConfirmation', formFieldType: 'checkbox', label: 'I certify...' },
    ] as ConditionalFieldConfig[];
    fixture.componentRef.setInput('fields', fields);
    fixture.detectChanges();

    const formBody = fixture.debugElement.query(By.directive(MockSlbFormBodyComponent));
    const passedFields = (formBody.componentInstance as MockSlbFormBodyComponent).fields as ConditionalFieldConfig[];
    expect(passedFields.map((f) => f.key)).toEqual([
      'supportingDocumentType',
      'supportingDocumentFile',
      'checkboxConfirmation',
    ]);
  });
});
