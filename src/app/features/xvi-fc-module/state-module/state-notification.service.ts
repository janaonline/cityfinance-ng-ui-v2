import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { FORM_STATUS } from '../shared/form-progress/form-progress.component';
import { XVIFC_LS_KEYS } from '../shared/years-selection/years-selection.component';
import type { UlbNotification, UlbNotificationSeverity } from '../ulb-module/ulb-notification.service';

interface StateNotificationsPayload {
  forms: { key: string; statusCode: number }[];
  ulbSubmissionsAwaitingReview: number;
}

/** Backend wraps in `{ success, data }`; a dev server may hand back the bare payload — accept both. */
type StateNotificationsResponse = { success?: boolean; data?: StateNotificationsPayload } | StateNotificationsPayload;

/** Backend form key -> what the State sees and where the bell/sidebar dot points. `route` is the
 *  tail segment of the sidebar item's routerLink, which is how `AppMenuItemComponent` matches a dot. */
const STATE_FORMS: Readonly<Record<string, { title: string; route: string }>> = {
  SFC_STATUS: { title: 'SFC Status', route: 'sfc-status' },
  ELECTED_BODIES: { title: 'Elected Body Status', route: 'elected-body-status' },
  DEVOLUTION: { title: 'ULB-wise Allocation', route: 'ulb-wise-allocation' },
  FC_UNSPENT: { title: 'FC Unspent Declaration', route: 'fc-unspent-declaration' },
  GTC: { title: 'Grant Transfer Certificate', route: 'gtc' },
};

/** State-form status -> how a notification reads. PMU's 13/14 read like MoHUA's 5/6 — the State-facing UI
 *  never names PMU (see `STATE_STATUS_LABEL` in form-progress.component.ts). */
const NOTIFICATION_BY_STATUS: Readonly<Record<number, { severity: UlbNotificationSeverity; message: string; icon: string }>> = {
  [FORM_STATUS.RETURNED_BY_PMU]: {
    severity: 'returned',
    message: 'Returned for correction — action needed.',
    icon: 'bi-exclamation-triangle-fill',
  },
  [FORM_STATUS.RETURNED_BY_MOHUA]: {
    severity: 'returned',
    message: 'Returned for correction — action needed.',
    icon: 'bi-exclamation-triangle-fill',
  },
  [FORM_STATUS.UNDER_REVIEW_BY_PMU]: { severity: 'review', message: 'Under review by MoHUA.', icon: 'bi-hourglass-split' },
  [FORM_STATUS.UNDER_REVIEW_BY_MOHUA]: { severity: 'review', message: 'Under review by MoHUA.', icon: 'bi-hourglass-split' },
  [FORM_STATUS.SUBMISSION_ACKNOWLEDGED_BY_MOHUA]: {
    severity: 'approved',
    message: 'Acknowledged by MoHUA.',
    icon: 'bi-check-circle-fill',
  },
};

const SEVERITY_ORDER: Record<UlbNotificationSeverity, number> = { returned: 0, review: 1, approved: 2 };

/** A reload within this window is skipped — the bell is refreshed on every State page navigation. */
const STALE_AFTER_MS = 30_000;

/**
 * State counterpart of `UlbNotificationService`: derives the navbar bell and the sidebar dots from
 * where the State's five condition forms stand, plus how many ULB forms wait on the State. Stateless
 * (no read/unread) — an item clears itself once the form is fixed and resubmitted.
 */
@Injectable({ providedIn: 'root' })
export class StateNotificationService {
  private readonly http = inject(HttpClient);
  private readonly data = signal<StateNotificationsPayload | null>(null);
  private loadedKey: string | null = null;
  private loadedAt = 0;
  /** Bumped on every load and on `clear()`; a response is applied only if its request is still current. */
  private requestSeq = 0;

  readonly notifications = computed<UlbNotification[]>(() => {
    const payload = this.data();
    if (!payload) return [];

    const formItems = payload.forms.flatMap((form) => {
      const meta = STATE_FORMS[form.key];
      const config = NOTIFICATION_BY_STATUS[form.statusCode];
      if (!meta || !config) return [];
      return [{ severity: config.severity, icon: config.icon, title: meta.title, message: config.message, route: meta.route }];
    });

    const awaiting = payload.ulbSubmissionsAwaitingReview;
    const ulbItem: UlbNotification[] =
      awaiting > 0
        ? [
            {
              severity: 'review',
              icon: 'bi-hourglass-split',
              title: 'ULB Submissions',
              message: `${awaiting} ULB ${awaiting === 1 ? 'submission is' : 'submissions are'} awaiting your review.`,
              route: 'ulb-submissions',
            },
          ]
        : [];

    return [...formItems, ...ulbItem].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  });

  /** route (sidebar item's tail segment) -> severity, so any side-menu item can look up its own dot. */
  readonly severityByRoute = computed<ReadonlyMap<string, UlbNotificationSeverity>>(
    () => new Map(this.notifications().map((n) => [n.route, n.severity])),
  );

  /** Loads for the selected year unless this State/year was fetched within the last 30 seconds. A failed
   *  load keeps whatever was shown before — the bell is informational and must never block the page. */
  async refreshIfStale(stateId: string): Promise<void> {
    const yearId = localStorage.getItem(XVIFC_LS_KEYS.selectedYearId);
    if (!stateId || !yearId) return;

    const key = `${stateId}:${yearId}`;
    if (key === this.loadedKey && Date.now() - this.loadedAt < STALE_AFTER_MS) return;
    // A different State/year must never show the previous one's items, even if this load fails.
    if (key !== this.loadedKey) this.data.set(null);
    // Stamp first so concurrent navigations don't each fire a request.
    this.loadedKey = key;
    this.loadedAt = Date.now();
    const seq = ++this.requestSeq;

    try {
      const response = await firstValueFrom(
        this.http.get<StateNotificationsResponse>(
          `${environment.api.url2}xvi-fc/state/${stateId}/${yearId}/notifications`,
        ),
      );
      const payload = 'success' in response ? response.data : (response as StateNotificationsPayload);
      if (payload && seq === this.requestSeq) this.data.set(payload);
    } catch {
      if (seq !== this.requestSeq) return;
      this.loadedAt = 0; // let the next navigation retry
    }
  }

  /** Drops everything on logout/role change so the next user never sees a stale bell. */
  clear(): void {
    this.requestSeq++;
    this.data.set(null);
    this.loadedKey = null;
    this.loadedAt = 0;
  }
}
