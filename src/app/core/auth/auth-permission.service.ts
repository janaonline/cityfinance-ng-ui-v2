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

    const base = ROLE_PERMISSIONS[user.role] ?? [];
    const allowed = new Set<Permission>(base);

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
    return this.accessLevel() === 'ADMIN';
  }

  isEditor(): boolean {
    return this.accessLevel() === 'EDITOR';
  }

  isViewer(): boolean {
    return this.accessLevel() === 'VIEWER';
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

  private getStoredUser(): IUserLoggedInDetails | null {
    const rawUser = localStorage.getItem('userData');
    if (!rawUser) return null;
    try {
      return JSON.parse(rawUser) as IUserLoggedInDetails;
    } catch {
      return null;
    }
  }
}
