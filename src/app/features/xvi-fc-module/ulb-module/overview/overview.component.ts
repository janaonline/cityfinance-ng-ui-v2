import { Component, OnInit, inject, signal } from '@angular/core';
import {
  OverviewCardComponent,
  OverviewData,
} from '../../shared/overview-card/overview-card.component';
import { PageErrorStateComponent } from '../../shared/page-error-state/page-error-state.component';
import { UlbNotificationService } from '../ulb-notification.service';
import { UlbOverviewService } from './overview-card.service';
import { DisbursementColumn, DisbursementRow } from './overview-card.models';

/** youtu.be short link — used both by the permanent hero-band link and the one-time banner. No
 *  in-page embed/dialog: dev/staging's CSP frame-src doesn't allow youtube.com/youtube-nocookie.com
 *  and that's set at the server/infra layer, outside either app's codebase. */
const VIDEO_WATCH_URL = 'https://youtu.be/UJ9rpS1yQJs';

/** Gates the one-time banner to once per browser — not tied to isNewUser, so it shows the first
 *  time ANY ULB user sees this page, regardless of account age. Follows the same localStorage-flag
 *  convention as isXVIFCProfileVerified. Only ever set from an explicit user action (Watch now /
 *  dismiss) — never just from rendering the banner, since it's easy to miss on first paint and a
 *  refresh before noticing it shouldn't burn the one-time budget. */
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

  readonly videoWalkthroughUrl = VIDEO_WATCH_URL;
  readonly showVideoBanner = signal(false);

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
    this.maybeShowVideoBanner();
  }

  /** Shows the one-time video banner if this browser hasn't dismissed/clicked it before — see
   *  HAS_SEEN_VIDEO_KEY above. Just renders the banner; doesn't mark it seen yet. */
  private maybeShowVideoBanner(): void {
    let hasSeen = false;
    try {
      hasSeen = localStorage.getItem(HAS_SEEN_VIDEO_KEY) === 'true';
    } catch {
      return; // storage unavailable — skip the banner rather than risk showing it every visit
    }
    if (!hasSeen) this.showVideoBanner.set(true);
  }

  /** Opening the video is a direct click, so window.open() isn't treated as an unrequested popup
   *  (unlike calling it automatically from ngOnInit, which browsers silently block). */
  onWatchVideoBannerClick(): void {
    window.open(VIDEO_WATCH_URL, '_blank', 'noopener,noreferrer');
    this.dismissVideoBanner();
  }

  onDismissVideoBanner(): void {
    this.dismissVideoBanner();
  }

  private dismissVideoBanner(): void {
    this.showVideoBanner.set(false);
    try {
      localStorage.setItem(HAS_SEEN_VIDEO_KEY, 'true');
    } catch {
      // Nothing to do if storage is unavailable — banner will just show again next visit.
    }
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
