import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DynamicFormService } from '../../../../../shared/dynamic-form/dynamic-form.service';
import { ConditionalFieldConfig, DynamicFormVisibilityService } from '../../../dynamic-form-visibility.service';
import { ConfirmDialogService } from '../../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { SlbComponent } from './slb.component';
import { SlbService } from './slb.service';
import { SlbFormData } from './slb.models';
import { XvifcModuleService } from '../../../xvi-fc-module.service';
import { exportElementToPdf } from '../../../pdf-export.util';

const SECTIONS = ['Water Supply', 'Sewerage Management', 'Solid Waste Management', 'Storm Water Drainage'];

/**
 * 28 indicators across 4 sections + the full self-declaration section (Name, Designation,
 * Supporting Document with a resolved view link, then the certification checkbox) — matching the
 * real SLB form's shape and field order as closely as possible, not just the certification
 * checkbox in isolation.
 */
function createSlbFormResponse(): SlbFormData {
  const indicators: ConditionalFieldConfig[] = Array.from({ length: 28 }, (_, i) => ({
    key: `ind${i + 1}`,
    label: `Indicator ${i + 1}`,
    position: i + 1,
    formFieldType: 'actualTarget',
    value: null,
    inputCardConfig: { suffixText: '%' },
    validations: [],
    meta: { section: SECTIONS[i % SECTIONS.length] },
  })) as unknown as ConditionalFieldConfig[];

  const declaration: ConditionalFieldConfig[] = [
    {
      key: 'declarantName',
      label: 'Name',
      formFieldType: 'text',
      value: 'Test Declarant',
      validations: [],
    },
    {
      key: 'declarantDesignation',
      label: 'Designation',
      formFieldType: 'text',
      value: 'Municipal Engineer',
      validations: [],
    },
    {
      key: 'supportingDocument',
      label: 'Supporting Document',
      formFieldType: 'file',
      value: {
        fileName: 'test-supporting-document.pdf',
        fileUrl: 'slb/supporting-document/test-supporting-document.pdf',
        fileSize: 385024,
        pageCount: 1,
      },
      validations: [],
    },
    {
      key: 'checkboxConfirmation',
      label: 'I certify that the information above is complete and accurate to the best of my knowledge.',
      formFieldType: 'checkbox',
      value: true,
      validations: [{ name: 'requiredTrue', validator: true, message: 'Confirmation is required.' }],
    },
  ] as unknown as ConditionalFieldConfig[];

  return {
    _id: 'slb-form-test',
    formName: 'SLB',
    formId: 32,
    ulbId: 'ulb-test-id',
    yearId: 'year-test-id',
    designYear: '2026-27',
    actualYearLabel: '2025-26',
    ulbName: 'Test ULB',
    currentFormStatus: 1,
    currentFormStatusLabel: 'Not Started',
    permissions: { canView: true, canEdit: true, canFinalSubmit: false },
    actors: [],
    meta: { version: 1 },
    questions: [...indicators, ...declaration],
  };
}

/**
 * Regression coverage for the "Certified" badge going blank in the exported PDF. Extensive
 * live-browser diagnostics against a real production build proved html2canvas cannot be trusted to
 * rasterize this specific element — even a fully-decoded real `<img>` at a correct, non-zero
 * position came out blank. `exportElementToPdf()` now excludes certification badges from the
 * raster capture entirely and draws them with jsPDF's own vector/text APIs instead, so this test
 * verifies that draw call happens with the right content, not canvas pixels (which are supposed to
 * be blank there by design now — see `prepareCertificationBadgesForNativeDraw` in
 * `pdf-export.util.ts`).
 *
 * Unlike slb.component.spec.ts, this deliberately does NOT mock out
 * SlbFormBodyComponent/DynamicFormComponent — it needs the real DynamicFieldViewComponent + real
 * `<mat-icon>` to faithfully reproduce the real production render tree.
 */
describe('SLB PDF export — certification badge is drawn natively, not rasterized', () => {
  let fixture: ComponentFixture<SlbComponent>;
  let component: SlbComponent;

  beforeEach(async () => {
    localStorage.setItem('userData', JSON.stringify({ ulb: 'ulb-test-id' }));

    const confirmDialogService = jasmine.createSpyObj<ConfirmDialogService>('ConfirmDialogService', ['confirm']);
    confirmDialogService.confirm.and.returnValue(of(true));
    const moduleService = jasmine.createSpyObj<XvifcModuleService>('XvifcModuleService', ['yearId']);
    moduleService.yearId.and.returnValue('year-test-id');
    const matDialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);

    // Using the REAL UtilityService (not a spy) — the "file" field type this fixture exercises
    // calls several of its formatting helpers, and this test cares about faithfully rendering the
    // real component tree, not asserting on UtilityService calls.
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, SlbComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialog, useValue: matDialog },
        DynamicFormService,
        DynamicFormVisibilityService,
        { provide: ConfirmDialogService, useValue: confirmDialogService },
        { provide: XvifcModuleService, useValue: moduleService },
      ],
    }).compileComponents();

    spyOn(TestBed.inject(SlbService), 'getSlbForm').and.returnValue(of(createSlbFormResponse()));

    fixture = TestBed.createComponent(SlbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem('userData');
  });

  it('draws the "Certified" label and a checkmark circle onto the PDF at a sane position', async () => {
    // Mounts the off-screen host the same way downloadPdf() does (isGeneratingPdf signal flips
    // the @if block).
    component.isGeneratingPdf.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const pdfSourceHost = fixture.nativeElement.querySelector('.pdf-capture-host') as HTMLElement | null;
    expect(pdfSourceHost).withContext('off-screen pdf-capture-host should exist while generating').toBeTruthy();
    if (!pdfSourceHost) return;

    // jsPDF's plugin methods (text, circle) aren't reliably spy-able on the prototype in this
    // bundle (they get attached in a way spyOn() doesn't recognize as an own/inherited method).
    // Instead, intercept the actual Blob jsPDF hands to save() — the same forensic technique used
    // to inspect the real downloaded PDF that first surfaced this bug — and verify "Certified"
    // appears as a genuine PDF text-showing operator on the page's content stream, not baked into
    // the rasterized image.
    let savedBlob: Blob | null = null;
    spyOn(URL, 'createObjectURL').and.callFake((blob: Blob) => {
      savedBlob = blob;
      return 'blob:test';
    });
    spyOn(URL, 'revokeObjectURL').and.stub();
    spyOn(HTMLAnchorElement.prototype, 'click').and.stub();

    await exportElementToPdf(pdfSourceHost, 'test.pdf');

    expect(savedBlob).withContext('exportElementToPdf() should have created a PDF blob to save').not.toBeNull();
    if (!savedBlob) return;

    const { PDFDocument, PDFRawStream } = await import('pdf-lib');
    const bytes = new Uint8Array(await (savedBlob as Blob).arrayBuffer());
    const pdfDoc = await PDFDocument.load(bytes, { updateMetadata: false });

    let foundCertifiedText = false;
    let foundVectorDrawing = false;
    for (const page of pdfDoc.getPages()) {
      const contents = page.node.Contents();
      if (!contents) continue;
      const stream = pdfDoc.context.lookup(contents);
      if (!(stream instanceof PDFRawStream)) continue;
      const streamText = new TextDecoder('iso-8859-1').decode(stream.contents);
      if (streamText.includes('Certified')) foundCertifiedText = true;
      // "re" = rectangle path op is unrelated; jsPDF emits circles as Bézier curve ops ('c') and
      // fills/strokes via 'f'/'S' — any of these confirms vector drawing happened on this page.
      if (/\bc\b|\bf\b|\bS\b/.test(streamText)) foundVectorDrawing = true;
    }

    expect(foundCertifiedText).withContext('"Certified" should appear as real PDF text, not rasterized').toBeTrue();
    expect(foundVectorDrawing).withContext('the certification icon should be drawn as PDF vector graphics').toBeTrue();
  });
});
