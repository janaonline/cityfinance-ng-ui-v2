import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MaterialModule } from '../../../../../material.module';
import { PreLoaderComponent } from '../../../../../shared/components/pre-loader/pre-loader.component';
import { AnnualAccountSectionKey, ManualReviewFormType } from '../../manual-review-queue/manual-review-queue.models';
import { ManualReviewHistoryRow, ManualReviewRequestStatus } from '../manual-review-history.models';
import { ManualReviewHistoryService } from '../manual-review-history.service';

const SECTION_LABEL: Record<AnnualAccountSectionKey, string> = {
  auditedData: 'Audited',
  unauditedData: 'Provisional',
};

const DUR_DOC_LABEL: Record<string, string> = {
  tiedGrant: 'Tied Grant',
  untiedGrant: 'Untied Grant',
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

  private formType: ManualReviewFormType = 'ANNUAL_ACCOUNT';

  ngOnInit(): void {
    const requestId = this.route.snapshot.paramMap.get('requestId');
    // Defaults to Annual Account for any pre-existing link/bookmark saved before the formType
    // query param existed — those were always Annual Account requests.
    this.formType = (this.route.snapshot.queryParamMap.get('formType') as ManualReviewFormType) || 'ANNUAL_ACCOUNT';
    if (!requestId) {
      this.isLoading.set(false);
      this.loadError.set('No request id provided.');
      return;
    }
    this.load(requestId);
  }

  docLabel(row: ManualReviewHistoryRow): string {
    if (row.formType === 'DUR') return DUR_DOC_LABEL[row.docId] ?? row.docId;
    return row.section ? SECTION_LABEL[row.section] : row.docId;
  }

  statusLabel(status: ManualReviewRequestStatus): string {
    return STATUS_LABEL[status];
  }

  load(requestId: string): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.service
      .getById(requestId, this.formType)
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
