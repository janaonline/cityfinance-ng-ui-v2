import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { SlbPreviewContentComponent } from './slb-preview-content.component';
import { SlbPreviewDialogComponent, SlbPreviewDialogData } from './slb-preview-dialog.component';

@Component({ selector: 'app-slb-preview-content', standalone: true, template: '' })
class MockSlbPreviewContentComponent {
  @Input() form: unknown;
  @Input() fields: unknown;
  @Input() ulbName: unknown;
  @Input() formStatusLabel: unknown;
  @Input() actualYearLabel: unknown;
  @Input() targetYearLabel: unknown;
}

describe('SlbPreviewDialogComponent', () => {
  let fixture: ComponentFixture<SlbPreviewDialogComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<SlbPreviewDialogComponent>>;

  const dialogData: SlbPreviewDialogData = {
    form: new FormBuilder().group({}),
    fields: [],
    ulbName: 'Test ULB',
    formStatusLabel: 'Not Started',
    actualYearLabel: '2025-26',
    targetYearLabel: '2026-27',
  };

  beforeEach(async () => {
    dialogRef = jasmine.createSpyObj<MatDialogRef<SlbPreviewDialogComponent>>('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [SlbPreviewDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
      ],
    })
      .overrideComponent(SlbPreviewDialogComponent, {
        remove: { imports: [SlbPreviewContentComponent] },
        add: { imports: [MockSlbPreviewContentComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SlbPreviewDialogComponent);
    fixture.detectChanges();
  });

  it('renders the "SLB Preview" title', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('SLB Preview');
  });

  it('closes the dialog when the close button is clicked', () => {
    const closeButton = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      'button[aria-label="Close dialog"]',
    );
    closeButton?.click();

    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('passes the dialog data through to app-slb-preview-content', () => {
    const preview = fixture.debugElement.query(By.directive(MockSlbPreviewContentComponent))
      .componentInstance as MockSlbPreviewContentComponent;

    expect(preview.ulbName).toBe('Test ULB');
    expect(preview.formStatusLabel).toBe('Not Started');
  });
});
