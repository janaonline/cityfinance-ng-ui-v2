import { Component, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

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
  imports: [NgClass, MatFormFieldModule, MatSelectModule, MatProgressBarModule, MatIconModule, MatButtonModule],
  templateUrl: './ulb-forms.component.html',
  styleUrl: './ulb-forms.component.scss',
})
export class UlbFormsComponent {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly ulbDetails = signal<UlbDetails | null>(this.loadUlbDetails());

  readonly grantBand = computed(() => {
    const year = this.ulbDetails()?.selectedYear ?? 'FY 2026-27';
    return {
      eyebrow: 'ESTIMATED GRANT',
      amount: '₹57 crore',
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
  readonly conditionsFooterNote = 'Confirm both document sets above to automatically submit your package to the State DMA.';

  readonly conditionsProgress = computed(() => {
    const complete = ALL_CONDITIONS.filter((c) => c.status === 'complete').length;
    const total = ALL_CONDITIONS.filter((c) => c.status !== 'locked').length;
    return { complete, total, pct: Math.round((complete / total) * 100) };
  });

  private readonly SEVERITY_COLORS: Record<WhatIfScenario['severity'], string> = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#f59e0b',
  };

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

  private loadUlbDetails(): UlbDetails | null {
    try {
      const raw = localStorage.getItem('xvifc_ulb_details');
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<UlbDetails>;
      if (!parsed.ulbName || !parsed.stateName || !parsed.selectedYear) return null;
      return {
        ulbName: parsed.ulbName,
        stateName: parsed.stateName,
        selectedYear: parsed.selectedYear,
      };
    } catch {
      return null;
    }
  }
}
