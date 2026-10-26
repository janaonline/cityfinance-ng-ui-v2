import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { XVIFC_LS_KEYS } from '../shared/years-selection/years-selection.component';
import { StateNotificationService } from './state-notification.service';

describe('StateNotificationService', () => {
  let service: StateNotificationService;
  let httpMock: HttpTestingController;

  const payload = {
    forms: [
      { key: 'SFC_STATUS', statusCode: 7 }, // acknowledged
      { key: 'ELECTED_BODIES', statusCode: 14 }, // returned by PMU
      { key: 'DEVOLUTION', statusCode: 13 }, // under review by PMU
      { key: 'FC_UNSPENT', statusCode: 2 }, // in progress — no notification
      { key: 'GTC', statusCode: 0 }, // not started — no notification
    ],
    ulbSubmissionsAwaitingReview: 3,
  };

  beforeEach(() => {
    localStorage.setItem(XVIFC_LS_KEYS.selectedYearId, 'year-1');
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(StateNotificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem(XVIFC_LS_KEYS.selectedYearId);
  });

  it('turns form statuses into ordered notifications and keeps PMU out of the wording', async () => {
    const pending = service.refreshIfStale('state-1');
    httpMock.expectOne((r) => r.url.endsWith('xvi-fc/state/state-1/year-1/notifications')).flush({
      success: true,
      data: payload,
    });
    await pending;

    const items = service.notifications();
    expect(items.map((n) => `${n.route}:${n.severity}`)).toEqual([
      'elected-body-status:returned',
      'ulb-wise-allocation:review',
      'ulb-submissions:review',
      'sfc-status:approved',
    ]);
    expect(items.find((n) => n.route === 'ulb-wise-allocation')?.message).toBe('Under review by MoHUA.');
    expect(items.find((n) => n.route === 'ulb-submissions')?.message).toBe('3 ULB submissions are awaiting your review.');
    expect(JSON.stringify(items)).not.toContain('PMU');
    expect(service.severityByRoute().get('elected-body-status')).toBe('returned');
    expect(service.severityByRoute().has('fc-unspent-declaration')).toBeFalse();
  });

  it('accepts a bare payload (no success wrapper) and skips a repeat load within 30 seconds', async () => {
    const first = service.refreshIfStale('state-1');
    httpMock.expectOne((r) => r.url.endsWith('/notifications')).flush(payload);
    await first;
    expect(service.notifications().length).toBe(4);

    await service.refreshIfStale('state-1');
    httpMock.expectNone((r) => r.url.endsWith('/notifications'));
  });

  it('shows nothing when a load fails and retries on the next call instead of waiting out the throttle', async () => {
    const ok = service.refreshIfStale('state-1');
    httpMock.expectOne((r) => r.url.endsWith('/notifications')).flush(payload);
    await ok;

    service.clear();
    const failing = service.refreshIfStale('state-1');
    httpMock.expectOne((r) => r.url.endsWith('/notifications')).flush('boom', { status: 500, statusText: 'Server Error' });
    await failing;

    expect(service.notifications()).toEqual([]);
    const retry = service.refreshIfStale('state-1');
    httpMock.expectOne((r) => r.url.endsWith('/notifications')).flush(payload);
    await retry;
    expect(service.notifications().length).toBe(4);
  });

  it('does nothing without a selected year', async () => {
    localStorage.removeItem(XVIFC_LS_KEYS.selectedYearId);
    await service.refreshIfStale('state-1');
    httpMock.expectNone((r) => r.url.endsWith('/notifications'));
  });
});
