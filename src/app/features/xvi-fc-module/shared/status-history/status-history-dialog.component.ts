import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  StatusHistoryEntry,
  StatusHistoryLoader,
  StatusHistoryPage,
  statusHistoryDotClass,
} from './status-history.models';

export interface StatusHistoryDialogData {
  /** Header line, e.g. "Gujarat · GTC · Installment 1". */
  heading: string;
  loader: StatusHistoryLoader;
}

/** Reasons longer than this get the clamp + "Show more" toggle (≈ 3 lines of the dialog). */
const REMARKS_CLAMP_THRESHOLD = 140;

/**
 * Dialog body for a form's status path (newest first), one page at a time with a "Load more" button for
 * older pages. Role-neutral: the opener supplies a `loader` — nothing here knows about PMU/MoHUA. The
 * first page is fetched every time the dialog opens, so it never shows a stale status.
 */
@Component({
  selector: 'app-status-history-dialog',
  standalone: true,
  imports: [DatePipe, MatDialogModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './status-history-dialog.component.html',
  styleUrl: './status-history-dialog.component.scss',
})
export class StatusHistoryDialogComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  readonly data = inject<StatusHistoryDialogData>(MAT_DIALOG_DATA);

  readonly entries = signal<StatusHistoryEntry[]>([]);
  readonly isLoading = signal(false);
  readonly hasError = signal(false);
  readonly hasMore = signal(false);
  readonly isLoadingMore = signal(false);
  readonly loadMoreFailed = signal(false);
  private nextCursor: string | null = null;
  private readonly expandedIds = signal<ReadonlySet<string>>(new Set());

  readonly dotClass = statusHistoryDotClass;
  readonly clampThreshold = REMARKS_CLAMP_THRESHOLD;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.data
      .loader()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => {
          this.entries.set(page.entries);
          this.applyPagingState(page);
          this.isLoading.set(false);
        },
        error: () => {
          this.hasError.set(true);
          this.isLoading.set(false);
        },
      });
  }

  /** Appends the next (older) page below what is already shown — the scroll position is untouched. */
  loadMore(): void {
    if (!this.nextCursor || this.isLoadingMore()) return;
    this.isLoadingMore.set(true);
    this.loadMoreFailed.set(false);
    this.data
      .loader(this.nextCursor)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => {
          this.entries.update((current) => {
            const seen = new Set(current.map((e) => e.id));
            return [...current, ...page.entries.filter((e) => !seen.has(e.id))];
          });
          this.applyPagingState(page);
          this.isLoadingMore.set(false);
        },
        error: () => {
          this.loadMoreFailed.set(true);
          this.isLoadingMore.set(false);
        },
      });
  }

  private applyPagingState(page: StatusHistoryPage): void {
    this.nextCursor = page.nextCursor;
    this.hasMore.set(page.hasMore && !!page.nextCursor);
  }

  isExpanded(id: string): boolean {
    return this.expandedIds().has(id);
  }

  toggleExpanded(id: string): void {
    this.expandedIds.update((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }
}
