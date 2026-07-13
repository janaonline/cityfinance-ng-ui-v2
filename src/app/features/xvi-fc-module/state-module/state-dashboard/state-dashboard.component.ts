import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

import {
  StateDashboardClaimLetter,
  StateDashboardData,
  StateDashboardFormCompletionRow,
  StateDashboardMetric,
  StateDashboardSubmissionSummary,
  StateDashboardTask,
} from './state-dashboard.models';

interface StoredUserContext {
  readonly stateName?: string;
  readonly name?: string;
  readonly state?: string;
  readonly stateCode?: string;
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
    MatListModule,
  ],
  templateUrl: './state-dashboard.component.html',
  styleUrl: './state-dashboard.component.scss',
})
export class StateDashboardComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  yearId: string | null = null;

  dashboardData: StateDashboardData = {
    stateName: '',
    financialYear: '',
    roleLabel: 'State DMA',
    overviewLabel: 'Grant-processing overview',
    metrics: [
      {
        key: 'total-ulbs',
        label: 'Total ULBs',
        value: '123',
        description: 'Andhra Pradesh · FY 2026-27',
      },
      {
        key: 'allocated',
        label: 'Allocated',
        value: '₹1,562 crore',
        description: 'Basic Grants · FY 2026-27',
      },
      {
        key: 'claimed',
        label: 'Claimed',
        value: '₹0 crore',
        description: 'No claim letter generated yet',
      },
      {
        key: 'compliance-rate',
        label: 'Compliance Rate',
        value: '18%',
        description: '22 of 123 cities · all conditions met',
      },
    ],
    stateDataTasks: [
      {
        key: 'register-ulbs',
        title: 'Register new ULBs',
        subtitle: 'Keep the state master list of 123 ULBs up to date',
        status: 'DONE',
      },
      {
        key: 'devolution-formula',
        title: 'Fill in the devolution formula',
        subtitle: 'Allocation & instalment split for each ULB',
        status: 'DONE',
      },
      {
        key: 'state-conditions',
        title: 'Submit other state conditions',
        subtitle: 'SFC status, elected body confirmation & FC unspent disclosure',
        status: 'PENDING',
        actionLabel: 'Continue',
      },
    ],
    ulbSubmissionSummary: [
      {
        key: 'not-started',
        label: 'Not Started',
        count: 0,
        description: 'No forms submitted yet',
        tone: 'neutral',
      },
      {
        key: 'in-progress',
        label: 'In Progress',
        count: 123,
        description: 'Some forms submitted',
        tone: 'progress',
      },
      {
        key: 'under-review',
        label: 'Under Review',
        count: 0,
        description: 'Awaiting State DMA review',
        tone: 'review',
      },
      {
        key: 'eligible',
        label: 'Eligible',
        count: 0,
        description: 'All 5 forms cleared',
        tone: 'eligible',
      },
      {
        key: 'exemption-requested',
        label: 'Exemption Requested',
        count: 0,
        description: 'Pending MoHUA review',
        tone: 'exemption',
      },
    ],
    formCompletionRows: [
      { label: 'Annual Accounts', completed: 67, total: 123 },
      { label: 'Provisional Accounts', completed: 57, total: 123 },
      { label: 'PFMS Bank Account', completed: 59, total: 123 },
      { label: 'FC Unspent Balance', completed: 0, total: 123 },
      { label: 'Service Level Benchmarks', completed: 69, total: 123 },
    ],
    claimLetters: [
      {
        key: 'first-claim-letter',
        title: 'Generate the first Claim Letter',
        subtitle: 'Instalment 1 · Batch 1 - 19 approved ULBs ready to include',
        status: 'AVAILABLE',
        actionLabel: 'Start',
      },
      {
        key: 'second-instalment',
        title: 'Instalment 2 Claim Letter',
        subtitle: 'Opens after the first Instalment 1 Claim Letter is generated',
        status: 'LOCKED',
      },
    ],
  };

  readonly completedStateTaskCount = this.dashboardData.stateDataTasks.filter((task) => task.status === 'DONE').length;

  readonly stateTaskCount = this.dashboardData.stateDataTasks.length;

  readonly compliancePercent = this.percentFromText(
    this.dashboardData.metrics.find((metric) => metric.key === 'compliance-rate')?.value,
  );

  ngOnInit(): void {
    this.yearId = this.findRouteParam(this.route.snapshot, 'yearId');
    this.applyStoredDashboardContext();
  }

  metricIcon(metricKey: string): string {
    const icons: Record<string, string> = {
      'total-ulbs': 'location_city',
      allocated: 'account_balance_wallet',
      claimed: 'receipt_long',
      'compliance-rate': 'verified_user',
    };

    return icons[metricKey] ?? 'analytics';
  }

  taskIcon(status: StateDashboardTask['status']): string {
    return status === 'DONE' ? 'check' : 'radio_button_unchecked';
  }

  claimIcon(status: StateDashboardClaimLetter['status']): string {
    return status === 'LOCKED' ? 'lock' : 'description';
  }

  summaryIcon(tone: StateDashboardSubmissionSummary['tone']): string {
    const icons: Record<StateDashboardSubmissionSummary['tone'], string> = {
      neutral: 'radio_button_unchecked',
      progress: 'pending_actions',
      review: 'rate_review',
      eligible: 'task_alt',
      exemption: 'gpp_maybe',
    };

    return icons[tone];
  }

  completionPercent(row: StateDashboardFormCompletionRow): number {
    if (!row.total) return 0;
    return Math.min(100, Math.max(0, Math.round((row.completed / row.total) * 100)));
  }

  onSubmitOtherStateConditions(): void {
    void this.router.navigate(['../requirements'], { relativeTo: this.route });
  }

  onViewUlbSubmissions(): void {
    void this.router.navigate(['../ulb-submissions'], { relativeTo: this.route });
  }

  onStartClaimLetter(): void {
    // TODO: Navigate to the claim-letter workflow once the route/API is available.
  }

  onBackIfNeeded(): void {
    void this.router.navigate(['../overview'], { relativeTo: this.route });
  }

  private findRouteParam(snapshot: ActivatedRouteSnapshot, key: string): string | null {
    let current: ActivatedRouteSnapshot | null = snapshot;

    while (current) {
      const value = current.paramMap.get(key);
      if (value) return value;
      current = current.parent;
    }

    return null;
  }

  private applyStoredDashboardContext(): void {
    const stateName = this.resolveStoredStateName() ?? this.dashboardData.stateName;
    const financialYear = this.resolveStoredFinancialYear() ?? this.dashboardData.financialYear;

    this.dashboardData = {
      ...this.dashboardData,
      stateName,
      financialYear,
      metrics: this.dashboardData.metrics.map((metric) => this.metricWithContext(metric, stateName, financialYear)),
    };
  }

  private resolveStoredStateName(): string | null {
    const user = this.readStoredUserContext();
    return this.firstNonEmptyString(user?.stateName, user?.name);
  }

  private resolveStoredFinancialYear(): string | null {
    if (typeof localStorage === 'undefined') return null;

    const storedYear =
      this.firstNonEmptyString(
        localStorage.getItem('xvifc_selectedYearString'),
        localStorage.getItem('selectedYear'),
        localStorage.getItem('financialYear'),
      ) ?? null;

    return this.formatFinancialYear(storedYear);
  }

  private readStoredUserContext(): StoredUserContext | null {
    if (typeof localStorage === 'undefined') return null;

    try {
      const raw = localStorage.getItem('userData');
      return raw ? (JSON.parse(raw) as StoredUserContext) : null;
    } catch {
      return null;
    }
  }

  private metricWithContext(
    metric: StateDashboardMetric,
    stateName: string,
    financialYear: string,
  ): StateDashboardMetric {
    if (metric.key === 'total-ulbs') {
      return { ...metric, description: `${stateName} · ${financialYear}` };
    }

    if (metric.key === 'allocated') {
      return { ...metric, description: `Basic Grants · ${financialYear}` };
    }

    return metric;
  }

  private formatFinancialYear(value: string | null): string | null {
    const cleanValue = value?.trim();
    if (!cleanValue) return null;

    if (/^FY[-\s]?\d{4}-\d{2}$/i.test(cleanValue)) {
      return `FY ${cleanValue.replace(/^FY[-\s]?/i, '')}`;
    }

    if (/^\d{4}-\d{2}$/.test(cleanValue)) {
      return `FY ${cleanValue}`;
    }

    return cleanValue.replace(/^FY-/i, 'FY ');
  }

  private firstNonEmptyString(...values: Array<string | null | undefined>): string | null {
    for (const value of values) {
      const cleanValue = value?.trim();
      if (cleanValue) return cleanValue;
    }

    return null;
  }

  private percentFromText(value: string | undefined): number {
    if (!value) return 0;

    const parsedValue = Number.parseInt(value.replace(/[^0-9]/g, ''), 10);
    if (Number.isNaN(parsedValue)) return 0;

    return Math.min(100, Math.max(0, parsedValue));
  }
}
