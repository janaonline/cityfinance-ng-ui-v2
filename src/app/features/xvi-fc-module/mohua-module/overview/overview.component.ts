import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { XVIFC_LS_KEYS } from '../../shared/years-selection/years-selection.component';

type MohuaSubRole = 'admin' | 'reviewer' | 'viewer';

interface MohuaUser {
  name: string;
  email: string;
  designation: string;
  xviFcSubrole: MohuaSubRole | null;
}

interface KpiCard {
  label: string;
  value: string | number;
  icon: string;
  colorClass: string;
  bgClass: string;
}

interface QuickAction {
  label: string;
  description: string;
  icon: string;
  route: string[];
  roles: MohuaSubRole[];
  variant: 'primary' | 'success' | 'danger' | 'secondary';
  disabled?: boolean;
  disabledReason?: string;
}

interface Notice {
  text: string;
  icon: string;
  type: 'info' | 'warning' | 'success';
}

const SUB_ROLE_LABEL: Record<MohuaSubRole, string> = {
  admin: 'Submitter',
  reviewer: 'Editor',
  viewer: 'Viewer',
};

const SUB_ROLE_BADGE_CLASS: Record<MohuaSubRole, string> = {
  admin: 'role-chip--submitter',
  reviewer: 'role-chip--editor',
  viewer: 'role-chip--viewer',
};

const KPI_CARDS: KpiCard[] = [
  {
    label: 'State Submissions',
    value: 28,
    icon: 'bi-buildings',
    colorClass: 'text-primary',
    bgClass: 'bg-primary bg-opacity-10',
  },
  {
    label: 'Pending Review',
    value: 12,
    icon: 'bi-hourglass-split',
    colorClass: 'text-warning',
    bgClass: 'bg-warning bg-opacity-10',
  },
  {
    label: 'Approved',
    value: 8,
    icon: 'bi-check-circle-fill',
    colorClass: 'text-success',
    bgClass: 'bg-success bg-opacity-10',
  },
  {
    label: 'Action Needed',
    value: 4,
    icon: 'bi-exclamation-triangle-fill',
    colorClass: 'text-danger',
    bgClass: 'bg-danger bg-opacity-10',
  },
];

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'Review State Submissions',
    description: 'Examine and verify the latest state-level annual account submissions before approval.',
    icon: 'bi-file-earmark-check',
    route: ['review-state-submissions'],
    roles: ['admin', 'reviewer'],
    variant: 'primary',
  },
  {
    label: 'Manage Team',
    description: 'Invite editors and viewers, update roles, or transfer Submitter ownership.',
    icon: 'bi-people-fill',
    route: ['roles-teams-unified-view'],
    roles: ['admin'],
    variant: 'secondary',
  },
  {
    label: 'Issue Office Memorandum',
    description: 'Prepare and issue OMs to states confirming grant approval and conditions.',
    icon: 'bi-file-richtext',
    route: ['overview'],
    roles: ['admin'],
    variant: 'success',
    disabled: true,
    disabledReason: 'Approval must be completed before issuing an OM',
  },
  {
    label: 'Final Submit to DoE',
    description: 'Submit consolidated state recommendations to the Department of Expenditure.',
    icon: 'bi-send-check-fill',
    route: ['overview'],
    roles: ['admin'],
    variant: 'danger',
    disabled: true,
    disabledReason: 'All state approvals must be complete before final submission',
  },
];

const NOTICES: Notice[] = [
  {
    text: 'FY 2024-25 submission window is open. States must upload audited annual accounts before the deadline.',
    icon: 'bi-info-circle-fill',
    type: 'info',
  },
  {
    text: '12 state submissions are awaiting MoHUA review — timely review ensures grant disbursement stays on schedule.',
    icon: 'bi-exclamation-triangle-fill',
    type: 'warning',
  },
  {
    text: 'Andhra Pradesh and Maharashtra submissions have been approved. Grant letters are ready for issuance.',
    icon: 'bi-check-circle-fill',
    type: 'success',
  },
];

@Component({
  selector: 'app-mohua-overview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatDividerModule, MatTooltipModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class MohuaOverviewComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly destroyRef = inject(DestroyRef);

  readonly user = signal<MohuaUser>({ name: '', email: '', designation: '', xviFcSubrole: null });
  readonly yearLabel = signal<string>('');
  readonly kpiCards = signal<KpiCard[]>(KPI_CARDS);
  readonly notices = signal<Notice[]>(NOTICES);

  readonly subRoleLabel = computed(() => {
    const role = this.user().xviFcSubrole;
    return role ? SUB_ROLE_LABEL[role] : '';
  });

  readonly subRoleBadgeClass = computed(() => {
    const role = this.user().xviFcSubrole;
    return role ? SUB_ROLE_BADGE_CLASS[role] : '';
  });

  readonly visibleActions = computed(() => {
    const role = this.user().xviFcSubrole;
    if (!role) return QUICK_ACTIONS;
    return QUICK_ACTIONS.filter((a) => (a.roles as string[]).includes(role));
  });

  readonly isSubmitter = computed(() => this.user().xviFcSubrole === 'admin');

  readonly displayName = computed(() => {
    const name = this.user().name;
    return name ? name.split(' ')[0] : 'there';
  });

  ngOnInit(): void {
    try {
      const raw = localStorage.getItem('userData');
      if (raw) {
        const stored = JSON.parse(raw) as Record<string, unknown>;
        this.user.set({
          name: (stored['name'] as string) ?? '',
          email: (stored['email'] as string) ?? '',
          designation: (stored['designation'] as string) ?? '',
          xviFcSubrole: (stored['xviFcSubrole'] as MohuaSubRole | null) ?? null,
        });
      }

      const yearStr = localStorage.getItem(XVIFC_LS_KEYS.selectedYearString) ?? '';
      this.yearLabel.set(yearStr || 'FY 2024-25');
    } catch {
      // localStorage unavailable; retain defaults
    }
  }

  navigateTo(segments: string[]): void {
    void this.router.navigate(['../', ...segments], { relativeTo: this.route });
  }

  getNoticeAlertClass(type: Notice['type']): string {
    const map: Record<Notice['type'], string> = {
      info: 'alert-info',
      warning: 'alert-warning',
      success: 'alert-success',
    };
    return map[type];
  }

  getActionBtnClass(variant: QuickAction['variant']): string {
    const map: Record<QuickAction['variant'], string> = {
      primary: 'btn btn-primary',
      secondary: 'btn btn-outline-secondary',
      success: 'btn btn-outline-success',
      danger: 'btn btn-outline-danger',
    };
    return map[variant];
  }
}
