import { Injectable, computed, signal } from '@angular/core';
import { Permission } from './permissions';
import { ROLE_PERMISSIONS } from './permission.map';
import { IUserLoggedInDetails } from '../models/login/userLoggedInDetails';

@Injectable({
  providedIn: 'root',
})
export class AuthPermissionService {
  private readonly userSignal = signal<IUserLoggedInDetails | null>(this.getStoredUser());

  readonly user = computed(() => this.userSignal());
  readonly role = computed(() => this.userSignal()?.role ?? null);
  readonly scope = computed(() => this.userSignal()?.scope ?? null);
  readonly accessLevel = computed(() => this.userSignal()?.accessLevel ?? null);

  setUser(user: IUserLoggedInDetails): void {
    localStorage.setItem('userData', JSON.stringify(user));
    this.userSignal.set(user);
  }

  clearUser(): void {
    localStorage.removeItem('userData');
    localStorage.removeItem('id_token');
    localStorage.removeItem('auth_session_hint');
    this.userSignal.set(null);
  }

  hasPermission(permission: Permission): boolean {
    const user = this.userSignal();
    if (!user?.role) return false;

    const base: Permission[] = ROLE_PERMISSIONS[user.role] ?? [];

    // Apply subRole cap for legacy STATE/ULB accounts designated as editor or
    // viewer within XVI-FC. Mirrors the backend getEffectivePermissions() logic
    // so the UI accurately reflects what the API will actually allow.
    let effective: Permission[];
    if (user.subRole && user.subRole !== 'submitter') {
      const capKey = this.resolveSubRoleCap(user.role, user.subRole);
      if (capKey) {
        const cap = new Set<Permission>(ROLE_PERMISSIONS[capKey] ?? []);
        effective = base.filter((p) => cap.has(p));
      } else {
        effective = base;
      }
    } else {
      effective = base;
    }

    const allowed = new Set<Permission>(effective);
    user.permissionOverrides?.allow?.forEach((p) => allowed.add(p));
    user.permissionOverrides?.deny?.forEach((p) => allowed.delete(p));

    return allowed.has(permission);
  }

  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some((p) => this.hasPermission(p));
  }

  hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every((p) => this.hasPermission(p));
  }

  isAdmin(): boolean {
    const user = this.userSignal();
    if (!user) return false;
    if (user.accessLevel !== 'ADMIN') return false;
    // Legacy STATE/ULB accounts designated as editor or viewer must not be
    // treated as admins even though their role-level accessLevel is 'ADMIN'.
    if (user.subRole === 'editor' || user.subRole === 'viewer') return false;
    return true;
  }

  isEditor(): boolean {
    const user = this.userSignal();
    if (!user) return false;
    if (user.accessLevel === 'EDITOR') return true;
    // Legacy STATE/ULB accounts with editor subRole
    return user.subRole === 'editor';
  }

  isViewer(): boolean {
    const user = this.userSignal();
    if (!user) return false;
    if (user.accessLevel === 'VIEWER') return true;
    // Legacy STATE/ULB accounts with viewer subRole
    return user.subRole === 'viewer';
  }

  isUlbUser(): boolean {
    return this.scope() === 'ULB';
  }

  isStateUser(): boolean {
    return this.scope() === 'STATE';
  }

  canViewManagedUsers(): boolean {
    return this.hasPermission(Permission.VIEW_MANAGED_USERS);
  }

  canCreateManagedUser(): boolean {
    return this.hasPermission(Permission.CREATE_MANAGED_USER);
  }

  canEdit(): boolean {
    return this.hasAnyPermission([Permission.UPLOAD_DOCUMENTS, Permission.UPLOAD_STATE_LEVEL_DOCUMENTS]);
  }

  canSubmit(): boolean {
    return this.hasAnyPermission([Permission.FINAL_SUBMIT_TO_STATE_DMA, Permission.FINAL_SUBMIT_TO_MOHUA]);
  }

  // ── Annual Accounts document upload ──────────────────────────────────────────

  canUploadDocuments(): boolean {
    return this.hasPermission(Permission.UPLOAD_DOCUMENTS);
  }

  canDeleteDocuments(): boolean {
    return this.hasPermission(Permission.DELETE_DOCUMENTS);
  }

  canSubmitToStateDma(): boolean {
    return this.hasPermission(Permission.FINAL_SUBMIT_TO_STATE_DMA);
  }

  private getStoredUser(): IUserLoggedInDetails | null {
    const rawUser = localStorage.getItem('userData');
    if (!rawUser) return null;
    try {
      return JSON.parse(rawUser) as IUserLoggedInDetails;
    } catch {
      return null;
    }
  }

  /**
   * Maps a (role, subRole) pair to the permission-cap key used in ROLE_PERMISSIONS.
   * Mirrors backend resolveSubRoleCap() in permissions.map.ts.
   * Only applies to legacy full-access roles (STATE, ULB) that have been
   * downgraded to editor or viewer within XVI-FC. Managed users already
   * have the correct role key and don't need this cap.
   */
  private resolveSubRoleCap(role: string, subRole: string): string | null {
    const r = role.toUpperCase();
    if (r === 'STATE') {
      if (subRole === 'editor') return 'STATE-EDITOR';
      if (subRole === 'viewer') return 'STATE-VIEWER';
    }
    if (r === 'ULB') {
      if (subRole === 'editor') return 'ULB-EDITOR';
      if (subRole === 'viewer') return 'ULB-VIEWER';
    }
    return null;
  }
}
