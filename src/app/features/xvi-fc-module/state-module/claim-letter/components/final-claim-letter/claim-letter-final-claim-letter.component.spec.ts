import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import FileSaver from 'file-saver';
import { ClaimLetterBatchSummary, ClaimLetterFinalPdf } from '../../claim-letter.models';
import { ClaimLetterService } from '../../claim-letter.service';
import { ClaimLetterFinalClaimLetterComponent } from './claim-letter-final-claim-letter.component';

const FINAL_PDF: ClaimLetterFinalPdf = {
  sourceKey: 'key-1',
  fileName: 'CF_Tripura_Claim-letter-1-1_2026-27.pdf',
  included: ['Signed claim letter', 'Copy of Elected Body', 'Copy of GTC'],
  missing: ['Other Supporting Documents (ATR)'],
  missingRequired: [],
  pageCount: 4,
  builtAt: '2026-10-28T10:00:00.000Z',
};

function claim(overrides: Partial<ClaimLetterBatchSummary> = {}): ClaimLetterBatchSummary {
  return {
    claimLetterId: 'claim-1',
    finalClaimLetterStage: 'DRAFT',
    submittedAt: null,
    ...overrides,
  } as ClaimLetterBatchSummary;
}

describe('ClaimLetterFinalClaimLetterComponent', () => {
  let fixture: ComponentFixture<ClaimLetterFinalClaimLetterComponent>;
  let service: jasmine.SpyObj<ClaimLetterService>;
  let emitted: (ClaimLetterFinalPdf | null)[];

  function render(value: ClaimLetterBatchSummary): HTMLElement {
    fixture = TestBed.createComponent(ClaimLetterFinalClaimLetterComponent);
    emitted = [];
    fixture.componentInstance.readyChange.subscribe((pdf) => emitted.push(pdf));
    fixture.componentRef.setInput('claim', value);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  function button(el: HTMLElement, cy: string): HTMLButtonElement {
    return el.querySelector<HTMLButtonElement>(`[data-cy="${cy}"]`)!;
  }

  beforeEach(() => {
    service = jasmine.createSpyObj<ClaimLetterService>('ClaimLetterService', ['getFinalPdf', 'getFinalPdfFile']);
    service.getFinalPdf.and.returnValue(of(FINAL_PDF));

    TestBed.configureTestingModule({
      imports: [ClaimLetterFinalClaimLetterComponent, NoopAnimationsModule],
      providers: [{ provide: ClaimLetterService, useValue: service }],
    });
  });

  it('shows the merged copy with its enclosures and reports it ready for Submit', () => {
    const el = render(claim());

    expect(service.getFinalPdf).toHaveBeenCalledOnceWith('claim-1');
    expect(emitted).toEqual([null, FINAL_PDF]);
    expect(el.textContent).toContain('Final claim letter');
    expect(el.querySelector('[data-cy="claim-letter-final-name"]')?.textContent).toBe(FINAL_PDF.fileName);
    expect(el.textContent).toContain('4 pages');
    expect(el.querySelectorAll('[data-cy="claim-letter-final-included"] li').length).toBe(4);
    expect(el.querySelector('[data-cy="claim-letter-final-missing"]')?.textContent).toContain(
      'Other Supporting Documents (ATR) (not included)',
    );
  });

  it('shows the backend message with Retry when the merge fails, and loads again on Retry', () => {
    service.getFinalPdf.and.returnValues(
      throwError(() => ({ error: { message: 'Copy of GTC is damaged. Upload a readable PDF in the GTC form.' } })),
      of(FINAL_PDF),
    );
    const el = render(claim());

    expect(el.querySelector('[data-cy="claim-letter-final-error"]')?.textContent).toContain('Copy of GTC is damaged');
    expect(emitted).toEqual([null]);

    el.querySelector<HTMLButtonElement>('[data-cy="claim-letter-final-error"] button')!.click();
    fixture.detectChanges();

    expect(service.getFinalPdf).toHaveBeenCalledTimes(2);
    expect(el.querySelector('[data-cy="claim-letter-final-error"]')).toBeNull();
    expect(emitted).toEqual([null, null, FINAL_PDF]);
  });

  it('shows a missing required document in red and asks for it before Submit', () => {
    service.getFinalPdf.and.returnValue(
      of({
        ...FINAL_PDF,
        missing: ['Copy of GTC', 'Other Supporting Documents (ATR)'],
        missingRequired: ['Copy of GTC'],
      }),
    );
    const el = render(claim());

    expect(el.querySelector('[data-cy="claim-letter-final-missing-required"]')?.textContent).toContain(
      'Copy of GTC (required, not uploaded)',
    );
    expect(el.querySelector('[data-cy="claim-letter-final-missing"]')?.textContent).toContain(
      'Other Supporting Documents (ATR) (not included)',
    );
    expect(el.querySelector('[data-cy="claim-letter-final-required-alert"]')).not.toBeNull();
  });

  it('re-checks the merge for every new summary', () => {
    render(claim());

    fixture.componentRef.setInput('claim', claim());
    fixture.detectChanges();

    expect(service.getFinalPdf).toHaveBeenCalledTimes(2);
  });

  describe('View and Download', () => {
    let tab: { location: { href: string }; close: jasmine.Spy };
    let open: jasmine.Spy;

    beforeEach(() => {
      tab = { location: { href: 'about:blank' }, close: jasmine.createSpy('close') };
      open = spyOn(window, 'open').and.returnValue(tab as unknown as Window);
      spyOn(URL, 'createObjectURL').and.returnValue('blob:final');
      spyOn(URL, 'revokeObjectURL');
      service.getFinalPdfFile.and.returnValue(of({ bytes: new ArrayBuffer(8), fileName: 'final.pdf' }));
    });

    it('opens a tab within the click, then shows the PDF in it', () => {
      const el = render(claim());

      button(el, 'claim-letter-final-view').click();

      expect(open).toHaveBeenCalledOnceWith('about:blank', '_blank');
      expect(service.getFinalPdfFile).toHaveBeenCalledOnceWith('claim-1');
      expect(tab.location.href).toBe('blob:final');
    });

    it('reuses the fetched file for Download', () => {
      const saveAs = spyOn(FileSaver, 'saveAs');
      const el = render(claim());

      button(el, 'claim-letter-final-view').click();
      button(el, 'claim-letter-final-download').click();

      expect(service.getFinalPdfFile).toHaveBeenCalledTimes(1);
      expect(saveAs).toHaveBeenCalledWith(jasmine.any(Blob), 'final.pdf');
    });

    it('asks to allow pop-ups when the browser blocks the tab', () => {
      open.and.returnValue(null);
      const el = render(claim());

      button(el, 'claim-letter-final-view').click();
      fixture.detectChanges();

      expect(service.getFinalPdfFile).not.toHaveBeenCalled();
      expect(el.querySelector('[data-cy="claim-letter-final-action-error"]')?.textContent).toContain('Allow pop-ups');
    });

    it('closes the tab and shows the message when the file cannot be fetched', async () => {
      const body = new TextEncoder().encode(JSON.stringify({ message: 'Copy of GTC is damaged.' })).buffer;
      service.getFinalPdfFile.and.returnValue(throwError(() => ({ error: body })));
      const el = render(claim());

      button(el, 'claim-letter-final-view').click();
      await new Promise((resolve) => setTimeout(resolve));
      fixture.detectChanges();

      expect(tab.close).toHaveBeenCalled();
      expect(el.querySelector('[data-cy="claim-letter-final-action-error"]')?.textContent).toContain(
        'Copy of GTC is damaged.',
      );
    });
  });

  it('describes the submitted copy after Submit', () => {
    const el = render(claim({ finalClaimLetterStage: 'SUBMITTED', submittedAt: '2026-10-28T10:00:00.000Z' }));

    expect(el.textContent).toContain('Submitted claim letter');
    expect(el.textContent).toContain('This is the copy MoHUA received.');
  });
});
