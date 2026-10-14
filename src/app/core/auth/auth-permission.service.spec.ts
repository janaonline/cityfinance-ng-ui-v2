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

  it('PMU: every level can read forms, only the admin can approve', () => {
    service.setUser(userWith('MOHUA_PMU', 'VIEWER'));
    expect(service.isPmuUser()).toBeTrue();
    expect(service.hasPermission(Permission.REVIEW_STATE_SUBMISSIONS_PMU)).toBeTrue();
    expect(service.canApprovePmuSubmissions()).toBeFalse();

    service.setUser(userWith('MOHUA_PMU', 'ADMIN'));
    expect(service.canApprovePmuSubmissions()).toBeTrue();
  });

  it('an unknown role holds no permissions', () => {
    service.setUser(userWith('SOMETHING_ELSE', 'ADMIN'));
    expect(service.hasPermission(Permission.VIEW_DASHBOARDS)).toBeFalse();
  });
});
