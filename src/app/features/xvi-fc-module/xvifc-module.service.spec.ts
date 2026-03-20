import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, convertToParamMap } from '@angular/router';
import { SIDE_MENU_ITEMS } from './temp';
import { XvifcModuleService } from './xvifc-module.service';
import { ROLES, Roles, XVIFC_DEFAULT_ROLE, XVIFC_DEFAULT_YEAR_ID } from './xvifc-side-menu.config';

describe('XvifcModuleService', () => {
  let service: XvifcModuleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(XvifcModuleService);
  });

  function createRouteSnapshot(options?: {
    role?: Roles;
    yearId?: string | null;
    firstChild?: ActivatedRouteSnapshot | null;
  }): ActivatedRouteSnapshot {
    const data = options?.role !== undefined ? { role: options.role } : {};
    const paramMap = convertToParamMap(
      options?.yearId !== undefined && options?.yearId !== null ? { yearId: options.yearId } : {},
    );
    const firstChild = options?.firstChild ?? null;

    return {
      data,
      paramMap,
      firstChild,
    } as ActivatedRouteSnapshot;
  }

  describe('getSideMenuItems', () => {
    it('should return menu items for the given role and yearId', () => {
      // Arrange
      const role: Roles = ROLES[0];
      const yearId = '2025';
      const expected = SIDE_MENU_ITEMS[role](yearId);

      // Act
      const result = service.getSideMenuItems(role, yearId);

      // Assert
      expect(result).toEqual(expected);
    });

    it('should use default role and yearId when no arguments are provided', () => {
      const expected = SIDE_MENU_ITEMS[XVIFC_DEFAULT_ROLE](XVIFC_DEFAULT_YEAR_ID);

      const result = service.getSideMenuItems();

      expect(result).toEqual(expected);
    });

    it('should throw an error when no side menu is configure for the role', () => {
      const invalidRole = 'invalid-role' as Roles;
      expect(() => service.getSideMenuItems(invalidRole, '2025')).toThrowError(
        `No side menu configured for role: ${invalidRole}`,
      );
    });
  });

  describe('resolveRoleAndYearFromRoute', () => {
    it('should return role and yearId when both are found on the route', () => {
      const snapshot = createRouteSnapshot({ role: ROLES[0], yearId: '2025' });

      const result = service.resolveRoleAndYearFromRoute(snapshot);

      expect(result).toEqual({ role: ROLES[0], yearId: '2025' });
    });

    it('should fall back to defaults when role and yearId are not found', () => {
      spyOn(console, 'warn');
      const snapshot = createRouteSnapshot();

      const result = service.resolveRoleAndYearFromRoute(snapshot);

      expect(result).toEqual({ role: XVIFC_DEFAULT_ROLE, yearId: XVIFC_DEFAULT_YEAR_ID });
    });

    it('should read role from route data', () => {
      const snapshot = createRouteSnapshot({ role: ROLES[0] });

      const result = service.resolveRoleAndYearFromRoute(snapshot);

      expect(result.role).toBe(ROLES[0]);
    });

    it('should read yearId from route params', () => {
      const snapshot = createRouteSnapshot({ yearId: '2030' });

      const result = service.resolveRoleAndYearFromRoute(snapshot);

      expect(result.yearId).toBe('2030');
    });

    it('should walk nested route snapshots to find role and yearId', () => {
      const child = createRouteSnapshot({ role: ROLES[0], yearId: '2031' });
      const root = createRouteSnapshot({ firstChild: child });

      const result = service.resolveRoleAndYearFromRoute(root);

      expect(result).toEqual({ role: ROLES[0], yearId: '2031' });
    });

    it('should use deepest valid role found in the route tree', () => {
      const child = createRouteSnapshot({ role: ROLES[1] ?? ROLES[0] });
      const root = createRouteSnapshot({ role: ROLES[0], firstChild: child });

      const result = service.resolveRoleAndYearFromRoute(root);

      expect(result.role).toBe(ROLES[1] ?? ROLES[0]);
    });

    it('should use the deepest yearId found in the route tree', () => {
      const child = createRouteSnapshot({ yearId: '2040' });
      const root = createRouteSnapshot({ yearId: '2020', firstChild: child });

      const result = service.resolveRoleAndYearFromRoute(root);

      expect(result.yearId).toBe('2040');
    });

    it('should ignore an invalid role and keep default role if no valid role is found', () => {
      spyOn(console, 'warn');
      const snapshot = createRouteSnapshot({
        role: 'not-valid-role' as Roles,
        yearId: '2025',
      });

      const result = service.resolveRoleAndYearFromRoute(snapshot);

      expect(result).toEqual({
        role: XVIFC_DEFAULT_ROLE,
        yearId: '2025',
      });
    });

    it('should warn when role is not found', () => {
      const warnSpy = spyOn(console, 'warn');
      const snapshot = createRouteSnapshot({ yearId: '2025' });

      service.resolveRoleAndYearFromRoute(snapshot);

      expect(warnSpy).toHaveBeenCalledWith('Route role not found. Falling back to default role.');
    });

    it('should warn when yearId is not found', () => {
      const warnSpy = spyOn(console, 'warn');
      const snapshot = createRouteSnapshot({ role: ROLES[0] });

      service.resolveRoleAndYearFromRoute(snapshot);

      expect(warnSpy).toHaveBeenCalledWith(
        'Route yearId not found. Falling back to default yearId.',
      );
    });

    it('should warn twice when both role and yearId are missing', () => {
      const warnSpy = spyOn(console, 'warn');
      const snapshot = createRouteSnapshot();

      service.resolveRoleAndYearFromRoute(snapshot);

      expect(warnSpy).toHaveBeenCalledTimes(2);
      expect(warnSpy).toHaveBeenCalledWith('Route role not found. Falling back to default role.');
      expect(warnSpy).toHaveBeenCalledWith(
        'Route yearId not found. Falling back to default yearId.',
      );
    });
  });
});
