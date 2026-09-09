import { Component, OnInit, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  OverviewCardComponent,
  OverviewData,
} from '../../shared/overview-card/overview-card.component';
import { PageErrorStateComponent } from '../../shared/page-error-state/page-error-state.component';
import {
  VideoWalkthroughDialogComponent,
} from '../../shared/video-walkthrough-dialog/video-walkthrough-dialog.component';
import { UlbNotificationService } from '../ulb-notification.service';
import { UlbOverviewService } from './overview-card.service';
import { DisbursementColumn, DisbursementRow } from './overview-card.models';

/** youtu.be short link — used as-is for the permanent "open in new tab" link. */
const VIDEO_WATCH_URL = 'https://youtu.be/UJ9rpS1yQJs';
const VIDEO_EMBED_URL = 'https://www.youtube-nocookie.com/embed/UJ9rpS1yQJs';
const VIDEO_TITLE = '16th FC video walkthrough';

/** Gates the auto-popup to once per browser (see VideoWalkthroughDialogComponent's doc comment) —
 *  not tied to isNewUser, so it fires the first time ANY ULB user sees this page, regardless of
 *  account age. Follows the same localStorage-flag convention as isXVIFCProfileVerified. */
const HAS_SEEN_VIDEO_KEY = 'hasSeenXvifcVideoWalkthrough';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [OverviewCardComponent, PageErrorStateComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent implements OnInit {
  private readonly overviewService = inject(UlbOverviewService);
  private readonly ulbNotifications = inject(UlbNotificationService);
  private readonly dialog = inject(MatDialog);

  readonly videoWalkthroughUrl = VIDEO_WATCH_URL;

  get selectedYear(): string | null {
    return localStorage.getItem('xvifc_selectedYearString') ?? null;
  }

  private get ulbId(): string {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('userData') : null;
      return raw ? ((JSON.parse(raw) as { ulb?: string }).ulb ?? '') : '';
    } catch {
      return '';
    }
  }

  currentRequirementYear = 'FY 2026-27';
  readonly isLoading = signal(false);
  readonly hasError = signal(false);

  ulbOverviewData: OverviewData | null = null;
  disbursementColumns: DisbursementColumn[] = [];
  disbursementRows: DisbursementRow[] = [];

  ngOnInit(): void {
    this.loadOverview();
    void this.ulbNotifications.ensureLoadedForUlb(this.ulbId);
    this.maybeShowVideoWalkthrough();
  }

  /** Auto-opens the video walkthrough once per browser — see HAS_SEEN_VIDEO_KEY above. Marks it
   *  seen as soon as the dialog is opened, not just on close: the requirement is "show it once,"
   *  and a user closing the tab mid-video shouldn't get it again next visit either. */
  private maybeShowVideoWalkthrough(): void {
    let hasSeen = false;
    try {
      hasSeen = localStorage.getItem(HAS_SEEN_VIDEO_KEY) === 'true';
    } catch {
      return; // storage unavailable — skip the auto-popup rather than risk showing it every visit
    }
    if (hasSeen) return;

    try {
      localStorage.setItem(HAS_SEEN_VIDEO_KEY, 'true');
    } catch {
      return;
    }

    this.dialog.open(VideoWalkthroughDialogComponent, {
      data: { embedUrl: VIDEO_EMBED_URL, title: VIDEO_TITLE },
      panelClass: 'video-walkthrough-panel',
      backdropClass: 'video-walkthrough-backdrop',
      maxWidth: '95vw',
      maxHeight: '95vh',
    });
  }

  loadOverview(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.overviewService.getOverviewViewModel(this.ulbId).subscribe({
      next: ({ ulbOverviewData, disbursementColumns, disbursementRows }) => {
        this.ulbOverviewData = ulbOverviewData;
        this.disbursementColumns = disbursementColumns;
        this.disbursementRows = disbursementRows;
        this.currentRequirementYear = disbursementColumns[0]?.label ?? 'FY 2026-27';
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load ULB overview', error);
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  onViewRequirements(): void {
    console.log('Navigate to requirements page');
  }
}
