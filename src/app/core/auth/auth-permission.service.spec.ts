import { TestBed } from '@angular/core/testing';
import { IUserLoggedInDetails } from '../models/login/userLoggedInDetails';
import { AuthPermissionService } from './auth-permission.service';
import { Permission } from './permissions';

type Level = 'ADMIN' | 'EDITOR' | 'VIEWER';

function userWith(role: string, accessLevel: Level): IUserLoggedInDetails {
  return { role, accessLevel } as unknown as IUserLoggedInDetails;
}

describe('AuthPermissionService — PMU and DoE', () => {
  let service: AuthPermissionService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthPermissionService);
  });

  afterEach(() => localStorage.clear());

  (['ADMIN', 'EDITOR', 'VIEWER'] as Level[]).forEach((level) => {
    it(`DoE ${level} can open the dashboard and forms but never approve or edit`, () => {
      service.setUser(userWith('XVIFC_DOE', level));

      expect(service.isDoeUser()).toBeTrue();
      expect(service.hasPermission(Permission.VIEW_DASHBOARDS)).toBeTrue();
      expect(service.hasPermission(Permission.REVIEW_STATE_SUBMISSIONS_PMU)).toBeTrue();
      expect(service.hasPermission(Permission.APPROVE_STATE_SUBMISSIONS_PMU)).toBeFalse();
      expect(service.hasPermission(Permission.APPROVE_STATE_SUBMISSIONS)).toBeFalse();
      expect(service.hasPermission(Permission.EDIT_STATE_FORMS)).toBeFalse();
    });
  });

  it('only the DoE admin manages the team', () => {
    service.setUser(userWith('XVIFC_DOE', 'ADMIN'));
    expect(service.hasPermission(Permission.MANAGE_USERS)).toBeTrue();

    service.setUser(userWith('XVIFC_DOE', 'EDITOR'));
    expect(service.hasPermission(Permission.MANAGE_USERS)).toBeFalse();
  });

  it('PMU: every level can read forms, admin and editor can approve, only the admin manages the team', () => {
    service.setUser(userWith('MOHUA_PMU', 'VIEWER'));
    expect(service.isPmuUser()).toBeTrue();
    expect(service.hasPermission(Permission.REVIEW_STATE_SUBMISSIONS_PMU)).toBeTrue();
    expect(service.canApprovePmuSubmissions()).toBeFalse();

    service.setUser(userWith('MOHUA_PMU', 'EDITOR'));
    expect(service.canApprovePmuSubmissions()).toBeTrue();
    expect(service.hasPermission(Permission.MANAGE_USERS)).toBeFalse();

    service.setUser(userWith('MOHUA_PMU', 'ADMIN'));
    expect(service.canApprovePmuSubmissions()).toBeTrue();
    expect(service.hasPermission(Permission.MANAGE_USERS)).toBeTrue();
  });

  it('an unknown role holds no permissions', () => {
    service.setUser(userWith('SOMETHING_ELSE', 'ADMIN'));
    expect(service.hasPermission(Permission.VIEW_DASHBOARDS)).toBeFalse();
  });
});

describe('AuthPermissionService — ADC users', () => {
  let service: AuthPermissionService;

  const adcUser = (accessLevel: Level, extra: Record<string, unknown> = {}): IUserLoggedInDetails =>
    ({ role: 'STATE', accessLevel, adc: 'adc-1', ...extra }) as unknown as IUserLoggedInDetails;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthPermissionService);
  });

  afterEach(() => localStorage.clear());

  it('a STATE user with an adc is an ADC user; one without is not', () => {
    service.setUser(adcUser('EDITOR'));
    expect(service.isAdcUser()).toBeTrue();

    service.setUser(userWith('STATE', 'EDITOR'));
    expect(service.isAdcUser()).toBeFalse();
  });

  (['ADMIN', 'EDITOR'] as Level[]).forEach((level) => {
    it(`ADC ${level} can review and approve ULB submissions but never touch State forms or the claim letter`, () => {
      service.setUser(adcUser(level));

      expect(service.hasPermission(Permission.REVIEW_ULB_SUBMISSIONS)).toBeTrue();
      expect(service.hasPermission(Permission.APPROVE_ULB_SUBMISSIONS)).toBeTrue();
      expect(service.hasPermission(Permission.EDIT_STATE_FORMS)).toBeFalse();
      expect(service.hasPermission(Permission.VIEW_STATE_FORMS)).toBeFalse();
      expect(service.hasPermission(Permission.PREPARE_GRANT_LETTERS)).toBeFalse();
      expect(service.hasPermission(Permission.FINAL_SUBMIT_TO_MOHUA)).toBeFalse();
      expect(service.hasPermission(Permission.MANAGE_USERS)).toBeFalse();
    });
  });

  it('ADC VIEWER is read-only', () => {
    service.setUser(adcUser('VIEWER'));

    expect(service.hasPermission(Permission.REVIEW_ULB_SUBMISSIONS)).toBeFalse();
    expect(service.hasPermission(Permission.APPROVE_ULB_SUBMISSIONS)).toBeFalse();
  });

  it('ignores permission overrides for an ADC user', () => {
    service.setUser(adcUser('VIEWER', { permissionOverrides: { allow: [Permission.EDIT_STATE_FORMS], deny: [] } }));
    expect(service.hasPermission(Permission.EDIT_STATE_FORMS)).toBeFalse();

    service.setUser(adcUser('EDITOR', { permissionOverrides: { allow: [], deny: [Permission.APPROVE_ULB_SUBMISSIONS] } }));
    expect(service.hasPermission(Permission.APPROVE_ULB_SUBMISSIONS)).toBeTrue();
  });
});
