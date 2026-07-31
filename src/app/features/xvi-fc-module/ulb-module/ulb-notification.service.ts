import { Injectable, computed, inject } from '@angular/core';
import { XVIFC_LS_KEYS } from '../shared/years-selection/years-selection.component';
import { AnnualAccountStateService, FormStatusData } from './annual-account-state.service';

export type UlbNotificationSeverity = 'returned' | 'review' | 'approved';

export interface UlbNotification {
  severity: UlbNotificationSeverity;
  icon: string;
  title: string;
  message: string;
  /** Matches the tail segment of a side-menu item's resolved routerLink (its featureKey). */
  route: string;
}

/** form_status_id (shared 1–7 scale) -> how a notification for that status should read. */
const NOTIFICATION_BY_STATUS_ID: Readonly<
  Record<number, { severity: UlbNotificationSeverity; message: string; icon: string }>
> = {
  3: { severity: 'review', message: 'Under review by State.', icon: 'bi-hourglass-split' },
  4: {
    severity: 'returned',
    message: 'Returned by State — action needed.',
    icon: 'bi-exclamation-triangle-fill',
  },
  5: { severity: 'review', message: 'Under review by MoHUA.', icon: 'bi-hourglass-split' },
  6: {
    severity: 'returned',
    message: 'Returned by MoHUA — action needed.',
    icon: 'bi-exclamation-triangle-fill',
  },
  7: {
    severity: 'approved',
    message: 'Approved by MoHUA.',
    icon: 'bi-check-circle-fill',
  },
};

const NOTIFICATION_SEVERITY_ORDER: Record<UlbNotificationSeverity, number> = { returned: 0, review: 1, approved: 2 };

const NOTIFICATION_SECTIONS: ReadonlyArray<{
  key: 'auditedData' | 'unauditedData' | 'xviFcBankAccount';
  title: string;
  route: string;
}> = [
  { key: 'auditedData', title: 'Audited Financial Statement', route: 'upload-audited' },
  { key: 'unauditedData', title: 'Provisional Financial Statement', route: 'upload-provisional' },
  { key: 'xviFcBankAccount', title: 'XVI-FC Bank Account (PFMS)', route: 'xvi-fc-bank-account' },
];

/**
 * Derives ULB-facing notifications (returned / under review / approved) from the shared
 * form-status signal — the single source of truth consumed by both the navbar bell and the
 * side-menu badges. Stateless by design: no read/unread tracking, it simply reflects whatever
 * form_status_id is currently true and clears itself once a form is fixed and resubmitted.
 */
@Injectable({ providedIn: 'root' })
export class UlbNotificationService {
  private readonly formStatusState = inject(AnnualAccountStateService);

  readonly notifications = computed<UlbNotification[]>(() => {
    const status = this.formStatusState.formStatus();
    if (!status) return [];

    return NOTIFICATION_SECTIONS.flatMap((section) => {
      const sectionStatus = this.sectionStatus(status, section.key);
      const statusId = sectionStatus?.form_status_id;
      if (statusId === null || statusId === undefined) return [];

      const config = NOTIFICATION_BY_STATUS_ID[statusId];
      if (!config) return [];

      return [
        {
          severity: config.severity,
          icon: config.icon,
          title: section.title,
          message: config.message,
          route: section.route,
        },
      ];
    }).sort((a, b) => NOTIFICATION_SEVERITY_ORDER[a.severity] - NOTIFICATION_SEVERITY_ORDER[b.severity]);
  });

  /** route (featureKey) -> severity, so any side-menu item can look up its own badge. */
  readonly severityByRoute = computed<ReadonlyMap<string, UlbNotificationSeverity>>(
    () => new Map(this.notifications().map((n) => [n.route, n.severity])),
  );

  /** Loads form status for this ULB once per session if it hasn't been loaded yet. */
  async ensureLoadedForUlb(ulbId: string): Promise<void> {
    if (this.formStatusState.formStatus()) return;
    const designYearId = localStorage.getItem(XVIFC_LS_KEYS.selectedYearId);
    if (!ulbId || !designYearId) return;
    await this.formStatusState.loadFormStatus(ulbId, designYearId);
  }

  private sectionStatus(
    status: FormStatusData,
    key: 'auditedData' | 'unauditedData' | 'xviFcBankAccount',
  ): { form_status_id: number | null } | undefined {
    return key === 'xviFcBankAccount' ? status.xviFcBankAccount : status[key];
  }
}
