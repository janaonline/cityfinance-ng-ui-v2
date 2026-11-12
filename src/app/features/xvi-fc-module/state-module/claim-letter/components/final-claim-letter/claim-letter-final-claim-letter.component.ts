import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import FileSaver from 'file-saver';
import { ClaimLetterBatchSummary, ClaimLetterFinalPdf } from '../../claim-letter.models';
import { ClaimLetterService } from '../../claim-letter.service';
import { readApiError, readBinaryApiError } from '../../claim-letter.utils';

const PDF_MIME = 'application/pdf';

interface FinalPdfFile {
  sourceKey: string;
  bytes: ArrayBuffer;
  fileName: string;
}

/**
 * The final claim letter (signed letter + enclosures, merged by the backend), the copy that goes to
 * MoHUA. Every new summary re-checks it; the backend rebuilds only when an upload changed.
 * Emits the ready copy (its `sourceKey` is what Submit sends), or null while checking or failed.
 */
@Component({
  selector: 'app-claim-letter-final-claim-letter',
  imports: [DatePipe, MatButtonModule, MatCardModule],
  templateUrl: './claim-letter-final-claim-letter.component.html',
  styleUrl: './claim-letter-final-claim-letter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClaimLetterFinalClaimLetterComponent {
  private readonly claimLetterService = inject(ClaimLetterService);
  private readonly destroyRef = inject(DestroyRef);

  readonly claim = input.required<ClaimLetterBatchSummary>();
  readonly readyChange = output<ClaimLetterFinalPdf | null>();

  readonly submitted = computed(() => this.claim().finalClaimLetterStage === 'SUBMITTED');
  readonly title = computed(() => (this.submitted() ? 'Submitted claim letter' : 'Final claim letter'));
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly finalPdf = signal<ClaimLetterFinalPdf | null>(null);
  readonly missingRequired = computed(() => new Set(this.finalPdf()?.missingRequired ?? []));
  /** Fetching the bytes for View or Download. */
  readonly busy = signal(false);
  readonly actionError = signal<string | null>(null);
  private readonly retryCount = signal(0);
  private file: FinalPdfFile | null = null;
  private objectUrl: string | null = null;

  constructor() {
    effect((onCleanup) => {
      const claimLetterId = this.claim().claimLetterId;
      this.retryCount();
      const sub = untracked(() => this.load(claimLetterId));
      onCleanup(() => sub.unsubscribe());
    });
    this.destroyRef.onDestroy(() => this.revokeObjectUrl());
  }

  retry(): void {
    this.retryCount.update((n) => n + 1);
  }

  /** Opens the tab inside the click, so pop-up blockers allow it, then points it at the PDF. */
  view(): void {
    if (!this.finalPdf() || this.busy()) return;
    const tab = window.open('about:blank', '_blank');
    if (!tab) {
      this.actionError.set('Allow pop-ups for this site to open the claim letter.');
      return;
    }
    this.withFile(
      (file) => {
        this.revokeObjectUrl();
        this.objectUrl = URL.createObjectURL(new Blob([file.bytes], { type: PDF_MIME }));
        tab.location.href = this.objectUrl;
      },
      () => tab.close(),
    );
  }

  download(): void {
    this.withFile((file) => FileSaver.saveAs(new Blob([file.bytes], { type: PDF_MIME }), file.fileName));
  }

  /** Keeps the last copy on screen while re-checking; Submit waits for the answer. */
  private load(claimLetterId: string) {
    this.loading.set(true);
    this.error.set(null);
    this.readyChange.emit(null);
    return this.claimLetterService.getFinalPdf(claimLetterId).subscribe({
      next: (finalPdf) => {
        this.finalPdf.set(finalPdf);
        this.loading.set(false);
        this.readyChange.emit(finalPdf);
      },
      error: (err: unknown) => {
        this.finalPdf.set(null);
        this.error.set(readApiError(err).message ?? 'Unable to prepare the final claim letter. Please try again.');
        this.loading.set(false);
      },
    });
  }

  /** The bytes of the copy on screen, fetched once per source key. */
  private withFile(use: (file: FinalPdfFile) => void, onError?: () => void): void {
    const finalPdf = this.finalPdf();
    if (!finalPdf || this.busy()) return;
    if (this.file?.sourceKey === finalPdf.sourceKey) {
      use(this.file);
      return;
    }
    this.busy.set(true);
    this.actionError.set(null);
    this.claimLetterService
      .getFinalPdfFile(this.claim().claimLetterId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ bytes, fileName }) => {
          this.file = { sourceKey: finalPdf.sourceKey, bytes, fileName: fileName ?? finalPdf.fileName };
          this.busy.set(false);
          use(this.file);
        },
        error: (err: unknown) => {
          onError?.();
          void readBinaryApiError(err).then((api) => {
            this.actionError.set(api.message ?? 'Unable to open the claim letter. Please try again.');
            this.busy.set(false);
          });
        },
      });
  }

  private revokeObjectUrl(): void {
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
    this.objectUrl = null;
  }
}
