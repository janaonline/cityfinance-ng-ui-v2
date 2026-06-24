import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { XVIFC_LS_KEYS } from '../../shared/years-selection/years-selection.component';
import { AnnualAccountStateService } from '../annual-account-state.service';

interface UlbDetails {
  ulbName: string;
  stateName: string;
  selectedYear: string;
}

interface WhatIfScenario {
  id: string;
  label: string;
  likelihood: number;
  likelihoodLabel: string;
  severity: 'critical' | 'high' | 'medium';
  description: string;
}

interface Condition {
  id: string;
  title: string;
  subtitle: string;
  status: 'complete' | 'pending' | 'locked';
  actionLabel: string | null;
  route: string | null;
}

interface ConditionGroup {
  deadline: string;
  conditions: Condition[];
}

const SCENARIOS: WhatIfScenario[] = [
  {
    id: 'no-audit',
    label: 'What if my audit statements are not prepared?',
    likelihood: 12,
    likelihoodLabel: 'Very Low',
    severity: 'critical',
    description:
      'Audited financial statements are a mandatory entry condition for the 16th FC basic grant. Without them, your submission cannot proceed to the State review stage, and your entire grant allocation would be withheld until the condition is met.',
  },
  {
    id: 'no-slb',
    label: "What if I don't report Service Level Benchmarks?",
    likelihood: 30,
    likelihoodLabel: 'Low',
    severity: 'high',
    description:
      'Service Level Benchmark reporting is required for the performance-linked grant component. Missing it disqualifies the ULB from the performance grant tranche, significantly reducing the total allocation.',
  },
  {
    id: 'no-elected-body',
    label: "What if I don't have an elected body in the ULB?",
    likelihood: 10,
    likelihoodLabel: 'Very Low',
    severity: 'critical',
    description:
      'An elected council is a constitutional prerequisite for grant eligibility. Without a duly constituted elected body, the State cannot certify eligibility, blocking all grant tranches for the financial year.',
  },
];

const CONDITION_GROUPS: ConditionGroup[] = [
  {
    deadline: 'May 31, 2026',
    conditions: [
      {
        id: 'sfc-status',
        title: 'State Finance Commission Status',
        subtitle: 'SFC constituted and notified — verified by State',
        status: 'complete',
        actionLabel: null,
        route: null,
      },
      {
        id: 'elected-body',
        title: 'Elected Body Status',
        subtitle: 'Elected council in place since March 2024',
        status: 'complete',
        actionLabel: null,
        route: null,
      },
      {
        id: 'audited-statement',
        title: 'Upload Audited Finance Statement FY 2024-25',
        subtitle: 'CA-certified statement required from your auditor',
        status: 'pending',
        actionLabel: 'Upload',
        route: 'upload-audited',
      },
      {
        id: 'provisional-statement',
        title: 'Upload Provisional Finance Statement FY 2025-26',
        subtitle: 'Provisional statement as of March 31, 2026',
        status: 'pending',
        actionLabel: 'Upload',
        route: 'upload-provisional',
      },
      {
        id: 'unspent-balance',
        title: 'FC Unspent Balance Disclosure',
        subtitle: 'Declare unspent grant balances from 14th and 15th Finance Commission periods',
        status: 'pending',
        actionLabel: 'Fill Disclosure',
        route: 'fill-disclosure',
      },
    ],
  },
  {
    deadline: 'Oct 31, 2026',
    conditions: [
      {
        id: 'slb',
        title: 'Service Level Benchmarks',
        subtitle: 'SLB data for water, sanitation and solid waste — opens in July',
        status: 'locked',
        actionLabel: null,
        route: null,
      },
      {
        id: 'utilization-certificate',
        title: 'Utilization Certificate',
        subtitle: 'Certificate of utilization for XV-FC grant funds — opens after fund release',
        status: 'locked',
        actionLabel: null,
        route: null,
      },
    ],
  },
];

const ALL_CONDITIONS = CONDITION_GROUPS.flatMap((g) => g.conditions);

@Component({
  selector: 'app-ulb-forms',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './ulb-forms.component.html',
  styleUrl: './ulb-forms.component.scss',
})
export class UlbFormsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly state = inject(AnnualAccountStateService);

  readonly ulbDetails = signal<UlbDetails | null>(this.loadUlbDetails());
  readonly sectionFormStatus = this.state.formStatus;

  readonly grantBand = computed(() => {
    const year = this.ulbDetails()?.selectedYear ?? 'FY 2026-27';
    return {
      eyebrow: 'ESTIMATED GRANT',
      amount: '₹__ crore',
      tag: `${year} · BASIC GRANT ONLY`,
      note: 'Based on SFC data, population figures, and CF calculations',
    };
  });

  readonly scenarios: WhatIfScenario[] = SCENARIOS;
  readonly selectedScenarioId = signal<string | null>(null);
  readonly selectedScenario = computed<WhatIfScenario | null>(() => {
    const id = this.selectedScenarioId();
    return id ? (SCENARIOS.find((s) => s.id === id) ?? null) : null;
  });

  readonly conditionGroups: ConditionGroup[] = CONDITION_GROUPS;
  readonly conditionsFooterNote =
    'Confirm both document sets above to automatically submit your package to the State DMA.';

  readonly conditionsProgress = computed(() => {
    const complete = ALL_CONDITIONS.filter((c) => this.resolveStatus(c) === 'complete').length;
    const total = ALL_CONDITIONS.filter((c) => c.status !== 'locked').length;
    return { complete, total, pct: Math.round((complete / total) * 100) };
  });

  private readonly SEVERITY_COLORS: Record<WhatIfScenario['severity'], string> = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#f59e0b',
  };

  async ngOnInit(): Promise<void> {
    const ulbId = this.resolveUlbId();
    const designYearId = this.resolveDesignYearId();
    if (!ulbId || !designYearId) return;
    await this.state.loadFormStatus(ulbId, designYearId);
  }

  // Returns the effective display status for a condition, overriding the static
  // value for the two upload conditions based on live API data.
  resolveStatus(condition: Condition): 'complete' | 'pending' | 'locked' {
    const status = this.sectionFormStatus();
    if (status) {
      if (condition.id === 'audited-statement') {
        return status.auditedData.form_status === 'UNDER_REVIEW_BY_STATE' ? 'complete' : 'pending';
      }
      if (condition.id === 'provisional-statement') {
        return status.unauditedData.form_status === 'UNDER_REVIEW_BY_STATE' ? 'complete' : 'pending';
      }
      if (condition.id === 'unspent-balance') {
        return status.unspentBalanceDisclosure.form_status === 'SUBMITTED' ? 'complete' : 'pending';
      }
    }
    return condition.status;
  }

  isSubmitted(condition: Condition): boolean {
    const status = this.sectionFormStatus();
    if (!status) return false;
    if (condition.id === 'audited-statement') return status.auditedData.form_status === 'UNDER_REVIEW_BY_STATE';
    if (condition.id === 'provisional-statement') return status.unauditedData.form_status === 'UNDER_REVIEW_BY_STATE';
    if (condition.id === 'unspent-balance') return status.unspentBalanceDisclosure.form_status === 'SUBMITTED';
    return false;
  }

  severityColor(scenario: WhatIfScenario): string {
    return this.SEVERITY_COLORS[scenario.severity];
  }

  badgeClass(scenario: WhatIfScenario): string {
    return {
      critical: 'simulator-badge--critical',
      high: 'simulator-badge--high',
      medium: 'simulator-badge--medium',
    }[scenario.severity];
  }

  navigateTo(route: string): void {
    this.router.navigate([route], { relativeTo: this.activatedRoute.parent });
  }

  private resolveUlbId(): string | null {
    let current = this.activatedRoute as ActivatedRoute | null;
    while (current) {
      const id = current.snapshot.paramMap.get('entityId');
      if (id) return id;
      current = current.parent;
    }
    try {
      const raw = localStorage.getItem('userData');
      return raw ? ((JSON.parse(raw) as { ulb?: string }).ulb ?? null) : null;
    } catch {
      return null;
    }
  }

  private resolveDesignYearId(): string | null {
    const stored = localStorage.getItem(XVIFC_LS_KEYS.selectedYearId);
    if (stored) return stored;
    let current = this.activatedRoute as ActivatedRoute | null;
    while (current) {
      const id = current.snapshot.paramMap.get('yearId');
      if (id) return id;
      current = current.parent;
    }
    return null;
  }

  private loadUlbDetails(): UlbDetails | null {
    try {
      const raw = localStorage.getItem('xvifc_ulb_details');
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<UlbDetails>;
      if (!parsed.ulbName || !parsed.stateName || !parsed.selectedYear) return null;
      return { ulbName: parsed.ulbName, stateName: parsed.stateName, selectedYear: parsed.selectedYear };
    } catch {
      return null;
    }
  }
}
