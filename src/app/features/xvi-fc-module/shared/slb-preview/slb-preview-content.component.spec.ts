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
});
