import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { AnnualAccountStateService, FormStatusData } from './annual-account-state.service';
import { UlbNotificationService } from './ulb-notification.service';

describe('UlbNotificationService', () => {
  let service: UlbNotificationService;
  let formStatus: ReturnType<typeof signal<FormStatusData | null>>;
  let loadFormStatus: jasmine.Spy;

  const baseStatus = (overrides: Partial<FormStatusData> = {}): FormStatusData => ({
    annualAccountId: 'annual-account-id',
    auditedData: { form_status: 'NOT_STARTED', form_status_id: 1 },
    unauditedData: { form_status: 'NOT_STARTED', form_status_id: 1 },
    unspentBalanceDisclosure: { form_status: 'NOT_STARTED', form_status_id: null },
    xviFcBankAccount: { form_status: 'NOT_STARTED', form_status_id: 1 },
    ...overrides,
  });

  beforeEach(() => {
    formStatus = signal<FormStatusData | null>(null);
    loadFormStatus = jasmine.createSpy('loadFormStatus').and.resolveTo();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AnnualAccountStateService,
          useValue: { formStatus, loadError: signal<string | null>(null), loadFormStatus },
        },
      ],
    });

    service = TestBed.inject(UlbNotificationService);
  });

  afterEach(() => localStorage.clear());

  describe('notifications', () => {
    it('is empty when form status has not loaded yet', () => {
      expect(service.notifications()).toEqual([]);
    });

    it('is empty when every section is NOT_STARTED/IN_PROGRESS', () => {
      formStatus.set(baseStatus({ unauditedData: { form_status: 'IN_PROGRESS', form_status_id: 2 } }));
      expect(service.notifications()).toEqual([]);
    });

    it('surfaces a returned section with an action-needed message', () => {
      formStatus.set(baseStatus({ auditedData: { form_status: 'RETURNED_BY_STATE', form_status_id: 4 } }));

      const [notification] = service.notifications();
      expect(notification.severity).toBe('returned');
      expect(notification.title).toBe('Audited Financial Statement');
      expect(notification.message).toBe('Returned by State — action needed.');
      expect(notification.route).toBe('upload-audited');
    });

    it('surfaces an approved PFMS section', () => {
      formStatus.set(
        baseStatus({ xviFcBankAccount: { form_status: 'SUBMISSION_ACKNOWLEDGED_BY_MOHUA', form_status_id: 7 } }),
      );

      const [notification] = service.notifications();
      expect(notification.severity).toBe('approved');
      expect(notification.title).toBe('XVI-FC Bank Account (PFMS)');
      expect(notification.message).toBe('Approved by MoHUA.');
    });

    it('orders returned sections before review before approved, regardless of section order', () => {
      formStatus.set(
        baseStatus({
          auditedData: { form_status: 'UNDER_REVIEW_BY_STATE', form_status_id: 3 },
          unauditedData: { form_status: 'RETURNED_BY_STATE', form_status_id: 4 },
          xviFcBankAccount: { form_status: 'SUBMISSION_ACKNOWLEDGED_BY_MOHUA', form_status_id: 7 },
        }),
      );

      expect(service.notifications().map((n) => n.severity)).toEqual(['returned', 'review', 'approved']);
    });
  });

  describe('severityByRoute', () => {
    it('maps each notification route to its severity', () => {
      formStatus.set(baseStatus({ auditedData: { form_status: 'RETURNED_BY_STATE', form_status_id: 4 } }));
      expect(service.severityByRoute().get('upload-audited')).toBe('returned');
      expect(service.severityByRoute().get('xvi-fc-bank-account')).toBeUndefined();
    });
  });

  describe('ensureLoadedForUlb', () => {
    it('does nothing when there is no ulbId or no selected design year', async () => {
      await service.ensureLoadedForUlb('');
      expect(loadFormStatus).not.toHaveBeenCalled();
    });

    it('loads form status once a design year is selected', async () => {
      localStorage.setItem('xvifc_selectedYearId', 'year-id');
      await service.ensureLoadedForUlb('ulb-id');
      expect(loadFormStatus).toHaveBeenCalledWith('ulb-id', 'year-id');
    });

    it('does not reload once form status is already present', async () => {
      localStorage.setItem('xvifc_selectedYearId', 'year-id');
      formStatus.set(baseStatus());
      await service.ensureLoadedForUlb('ulb-id');
      expect(loadFormStatus).not.toHaveBeenCalled();
    });
  });
});
