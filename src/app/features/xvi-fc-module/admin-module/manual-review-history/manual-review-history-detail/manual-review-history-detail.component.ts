import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MaterialModule } from '../../../../../material.module';
import { PreLoaderComponent } from '../../../../../shared/components/pre-loader/pre-loader.component';
import { AnnualAccountSectionKey } from '../../manual-review-queue/manual-review-queue.models';
import { ManualReviewHistoryRow, ManualReviewRequestStatus } from '../manual-review-history.models';
import { ManualReviewHistoryService } from '../manual-review-history.service';

const SECTION_LABEL: Record<AnnualAccountSectionKey, string> = {
  auditedData: 'Audited',
  unauditedData: 'Provisional',
};

const STATUS_LABEL: Record<ManualReviewRequestStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  RETURNED: 'Returned',
};

@Component({
  selector: 'app-manual-review-history-detail',
  imports: [MaterialModule, PreLoaderComponent, DatePipe, RouterLink],
  templateUrl: './manual-review-history-detail.component.html',
  styleUrl: './manual-review-history-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManualReviewHistoryDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly service = inject(ManualReviewHistoryService);

  readonly row = signal<ManualReviewHistoryRow | null>(null);
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);

  ngOnInit(): void {
    const requestId = this.route.snapshot.paramMap.get('requestId');
    if (!requestId) {
      this.isLoading.set(false);
      this.loadError.set('No request id provided.');
      return;
    }
    this.load(requestId);
  }

  sectionLabel(section: AnnualAccountSectionKey): string {
    return SECTION_LABEL[section];
  }

  statusLabel(status: ManualReviewRequestStatus): string {
    return STATUS_LABEL[status];
  }

  load(requestId: string): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.service
      .getById(requestId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (row) => {
          this.row.set(row);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.loadError.set('Unable to load this manual-review request. It may not exist.');
        },
      });
  }
}
