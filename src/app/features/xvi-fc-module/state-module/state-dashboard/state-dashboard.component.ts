import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, ActivatedRouteSnapshot, ParamMap, Router } from '@angular/router';
import { catchError, combineLatest, distinctUntilChanged, map, of, Subject, switchMap } from 'rxjs';

import { AmountDisplayModeService } from '../../../../core/services/amount-display-mode.service';
import { AuthService } from '../../../../core/services/auth.service';
import {
  StateDashboardApiResponse,
  StateDashboardClaimLetterItem,
  StateDashboardData,
  StateDashboardMetricKey,
  StateDashboardMetricView,
  StateDashboardSummaryTone,
  StateDashboardTask,
  StateDashboardTaskStatus,
  StateDashboardUlbSubmissionStatus,
} from './state-dashboard.models';
import { StateDashboardService } from './state-dashboard.service';

interface DashboardRequestContext {
  stateId: string;
  yearId: string;
}

interface DashboardLoadResult {
  response: StateDashboardApiResponse | null;
  error: unknown | null;
}

@Component({
  selector: 'app-state-dashboard',
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './state-dashboard.component.html',
  styleUrl: './state-dashboard.component.scss',
})
export class StateDashboardComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly stateDashboardService = inject(StateDashboardService);
  private readonly amountDisplay = inject(AmountDisplayModeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dashboardRequests$ = new Subject<DashboardRequestContext>();
  private lastDashboardRequestKey: string | null = null;

  stateId: string | null = null;
  yearId: string | null = null;
  dashboardData: StateDashboardData | null = null;
  metricCards: readonly StateDashboardMetricView[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  isEmpty = false;

  ngOnInit(): void {
    this.observeDashboardRequests();
    this.observeYearId();
  }

  retryDashboard(): void {
    this.errorMessage = null;
    const currentYearId = this.findRouteParam(this.route.snapshot, 'yearId');
    if (currentYearId) this.yearId = currentYearId;
    this.loadDashboard(true);
  }

  formatAmount(value: number): string {
    return this.amountDisplay.format(Number.isFinite(value) ? value : 0, 'auto');
  }

  getCompletionPercentage(completed: number, total: number): number {
    if (total <= 0) return 0;
    return Math.min(100, Math.max(0, Math.round((completed / total) * 100)));
  }

  metricIcon(metricKey: StateDashboardMetricKey): string {
    const icons: Record<StateDashboardMetricKey, string> = {
      'total-ulbs': 'location_city',
      allocated: 'account_balance_wallet',
      claimed: 'receipt_long',
      'compliance-rate': 'verified_user',
    };

    return icons[metricKey];
  }

  taskIcon(status: StateDashboardTaskStatus): string {
    return status === 'DONE' ? 'check_circle' : 'radio_button_unchecked';
  }

  claimIcon(letter: StateDashboardClaimLetterItem): string {
    return letter.status === 'LOCKED' ? 'lock' : 'description';
  }

  summaryTone(status: StateDashboardUlbSubmissionStatus): StateDashboardSummaryTone {
    const tones: Record<StateDashboardUlbSubmissionStatus, StateDashboardSummaryTone> = {
      NOT_STARTED: 'neutral',
      IN_PROGRESS: 'progress',
      UNDER_REVIEW: 'review',
      ELIGIBLE: 'eligible',
      EXEMPTION_REQUESTED: 'exemption',
    };

    return tones[status];
  }

  summaryIcon(status: StateDashboardUlbSubmissionStatus): string {
    const icons: Record<StateDashboardUlbSubmissionStatus, string> = {
      NOT_STARTED: 'radio_button_unchecked',
      IN_PROGRESS: 'pending_actions',
      UNDER_REVIEW: 'rate_review',
      ELIGIBLE: 'task_alt',
      EXEMPTION_REQUESTED: 'gpp_maybe',
    };

    return icons[status];
  }

  roleLabel(userRole: string): string {
    const normalizedRole = userRole.trim().toUpperCase();
    if (['STATE', 'XVIFC_STATE', 'STATE_EDITOR', 'STATE_VIEWER'].includes(normalizedRole)) return 'State DMA';
    if (normalizedRole === 'MOHUA') return 'MoHUA';
    if (normalizedRole === 'ADMIN') return 'Administrator';

    return normalizedRole
      .toLowerCase()
      .split('_')
      .filter(Boolean)
      .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
      .join(' ');
  }

  onStateTaskAction(task: StateDashboardTask): void {
    if (!task.actionLabel) return;
    if (this.navigateToApiRoute(task.route)) return;

    if (task.key === 'devolution-formula') {
      void this.router.navigate(['../ulb-wise-allocation'], { relativeTo: this.route });
      return;
    }

    if (task.key === 'state-conditions') this.onSubmitOtherStateConditions();
  }

  onSubmitOtherStateConditions(): void {
    void this.router.navigate(['../requirements'], { relativeTo: this.route });
  }

  onViewUlbSubmissions(): void {
    void this.router.navigate(['../ulb-submissions'], { relativeTo: this.route });
  }

  onStartClaimLetter(letter: StateDashboardClaimLetterItem): void {
    if (letter.status !== 'AVAILABLE' || !letter.actionLabel) return;
    this.navigateToApiRoute(letter.route);
  }

  private observeYearId(): void {
    const routeParamMaps = this.route.pathFromRoot.map((route) => route.paramMap);

    combineLatest(routeParamMaps)
      .pipe(
        map((paramMaps) => this.findParamInMaps(paramMaps, 'yearId')),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((yearId) => {
        this.yearId = yearId;
        this.loadDashboard();
      });
  }

  private observeDashboardRequests(): void {
    this.dashboardRequests$
      .pipe(
        switchMap(({ stateId, yearId }) =>
          this.stateDashboardService.getDashboard(stateId, yearId).pipe(
            map(
              (response): DashboardLoadResult => ({
                response,
                error: null,
              }),
            ),
            catchError((error: unknown) =>
              of<DashboardLoadResult>({
                response: null,
                error,
              }),
            ),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => this.handleDashboardResult(result));
  }

  private loadDashboard(force = false): void {
    this.stateId = this.resolveStateId();

    if (!this.stateId) {
      this.lastDashboardRequestKey = null;
      this.setContextError('State context is unavailable for the current user.');
      return;
    }

    if (!this.yearId) {
      this.lastDashboardRequestKey = null;
      this.setContextError('State or financial-year context is unavailable.');
      return;
    }

    const requestKey = `${this.stateId}-${this.yearId}`;
    // Route param streams can emit the same resolved context more than once during navigation.
    if (!force && this.lastDashboardRequestKey === requestKey) return;
    this.lastDashboardRequestKey = requestKey;

    this.isLoading = true;
    this.errorMessage = null;
    this.isEmpty = false;
    this.dashboardData = null;
    this.metricCards = [];
    this.dashboardRequests$.next({ stateId: this.stateId, yearId: this.yearId });
  }

  private handleDashboardResult({ response, error }: DashboardLoadResult): void {
    this.isLoading = false;

    if (error) {
      this.dashboardData = null;
      this.metricCards = [];
      this.isEmpty = false;
      this.errorMessage = this.getErrorMessage(error);
      return;
    }

    if (!response?.success) {
      this.dashboardData = null;
      this.metricCards = [];
      this.isEmpty = false;
      this.errorMessage = 'The State dashboard could not be loaded. Please try again.';
      return;
    }

    if (!response.data) {
      this.dashboardData = null;
      this.metricCards = [];
      this.isEmpty = true;
      this.errorMessage = null;
      return;
    }

    this.dashboardData = response.data;
    this.metricCards = this.createMetricCards(response.data);
    this.isEmpty = false;
    this.errorMessage = null;
  }

  private resolveStateId(): string | null {
    const stateId = this.authService.getCurrentUserSnapshot()?.state;
    const cleanStateId = typeof stateId === 'string' ? stateId.trim() : '';
    return cleanStateId || null;
  }

  private createMetricCards(data: StateDashboardData): readonly StateDashboardMetricView[] {
    const { context, metrics } = data;

    return [
      {
        key: 'total-ulbs',
        label: 'Total ULBs',
        value: String(metrics.totalUlbs),
        description: `${context.stateName} · ${context.financialYear}`,
      },
      {
        key: 'allocated',
        label: 'Allocated',
        value: this.formatAmount(metrics.allocatedAmount),
        description: context.grantType ? `${context.grantType} · ${context.financialYear}` : context.financialYear,
      },
      {
        key: 'claimed',
        label: 'Claimed',
        value: this.formatAmount(metrics.claimedAmount),
        description: 'Claim letters issued to date',
      },
      {
        key: 'compliance-rate',
        label: 'Compliance Rate',
        value: `${metrics.compliance.rate}%`,
        description: `${metrics.compliance.compliantUlbs} of ${metrics.compliance.totalUlbs} cities · all conditions met`,
      },
    ];
  }

  private getErrorMessage(error: unknown): string {
    const status = this.resolveHttpStatus(error);

    if (status === 401) return 'Your session has expired. Please sign in again.';
    if (status === 403) return 'You are not authorised to view this State dashboard.';
    if (status === 404) return 'Dashboard data is unavailable for the selected State and financial year.';
    if (status === 500) return 'The State dashboard could not be loaded. Please try again.';

    return 'Unable to connect to the server. Please try again.';
  }

  private resolveHttpStatus(error: unknown): number | null {
    if (error instanceof HttpErrorResponse) return error.status;
    if (typeof error !== 'object' || error === null || !('status' in error)) return null;

    const status = (error as { status?: unknown }).status;
    return typeof status === 'number' ? status : null;
  }

  private setContextError(message: string): void {
    this.isLoading = false;
    this.dashboardData = null;
    this.metricCards = [];
    this.isEmpty = false;
    this.errorMessage = message;
  }

  private findParamInMaps(paramMaps: readonly ParamMap[], key: string): string | null {
    for (let index = paramMaps.length - 1; index >= 0; index -= 1) {
      const value = paramMaps[index].get(key)?.trim();
      if (value) return value;
    }

    return null;
  }

  private findRouteParam(snapshot: ActivatedRouteSnapshot, key: string): string | null {
    let current: ActivatedRouteSnapshot | null = snapshot;

    while (current) {
      const value = current.paramMap.get(key)?.trim();
      if (value) return value;
      current = current.parent;
    }

    return null;
  }

  private navigateToApiRoute(route: string | null): boolean {
    const cleanRoute = route?.trim();
    if (!cleanRoute || cleanRoute.startsWith('//') || /^[a-z][a-z\d+.-]*:/i.test(cleanRoute)) return false;

    if (cleanRoute.startsWith('/')) {
      void this.router.navigateByUrl(cleanRoute);
    } else {
      void this.router.navigate([cleanRoute], { relativeTo: this.route });
    }

    return true;
  }
}
