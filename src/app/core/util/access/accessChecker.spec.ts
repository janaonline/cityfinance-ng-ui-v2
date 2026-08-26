import { USER_TYPE } from '../../models/user/userType';
import { AccessChecker } from './accessChecker';
import { ACTIONS } from './actions';
import { MODULES_NAME } from './modules';

describe('AccessChecker', () => {
  let checker: AccessChecker;

  beforeEach(() => {
    localStorage.clear();
    checker = new AccessChecker();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('exposes the configured modules', () => {
    expect(checker.MODULES[MODULES_NAME.ULB]).toBeTruthy();
  });

  it('allows access when the logged in role is configured for the action', () => {
    localStorage.setItem('userData', JSON.stringify({ role: USER_TYPE.ADMIN }));

    expect(
      checker.hasAccess({
        moduleName: MODULES_NAME.USER,
        action: ACTIONS.DELETE,
      }),
    ).toBeTrue();
  });

  it('denies access when the module does not define the action', () => {
    localStorage.setItem('userData', JSON.stringify({ role: USER_TYPE.USER }));

    expect(
      checker.hasAccess({
        moduleName: MODULES_NAME.USERLIST,
        action: ACTIONS.DELETE,
      }),
    ).toBeFalse();
  });

  it('denies access when there is no logged in user role', () => {
    expect(
      checker.hasAccess({
        moduleName: MODULES_NAME.USER,
        action: ACTIONS.VIEW,
      }),
    ).toBeFalse();
  });

  it('denies access when the role is not included for the action', () => {
    localStorage.setItem('userData', JSON.stringify({ role: USER_TYPE.USER }));

    expect(
      checker.hasAccess({
        moduleName: MODULES_NAME.PARTNER,
        action: ACTIONS.DELETE,
      }),
    ).toBeFalse();
  });
});
