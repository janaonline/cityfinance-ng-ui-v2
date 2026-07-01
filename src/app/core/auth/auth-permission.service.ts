import { Injectable, computed, signal } from '@angular/core';
import { Permission } from './permissions';
import { ACCESS_LEVEL_PERMISSIONS, MOHUA_ACCESS_LEVEL_PERMISSIONS } from './permission.map';
import { IUserLoggedInDetails } from '../models/login/userLoggedInDetails';

@Injectable({
  providedIn: 'root',
})
export class AuthPermissionService {
  private readonly userSignal = signal<IUserLoggedInDetails | null>(this.getStoredUser());

  readonly user = computed(() => this.userSignal());
  readonly role = computed(() => this.userSignal()?.role ?? null);
  readonly accessLevel = computed(() => this.userSignal()?.accessLevel ?? null);
  readonly subRole = computed(() => this.userSignal()?.subRole ?? null);

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

    let base: Permission[];
    if (user.role === 'STATE') {
      base = ACCESS_LEVEL_PERMISSIONS[user.accessLevel ?? 'VIEWER'] ?? ACCESS_LEVEL_PERMISSIONS.VIEWER;
    } else if (user.role === 'MoHUA') {
      base = MOHUA_ACCESS_LEVEL_PERMISSIONS[user.accessLevel ?? 'VIEWER'] ?? MOHUA_ACCESS_LEVEL_PERMISSIONS.VIEWER;
    } else {
      return false;
    }

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

  // ── Role predicates ───────────────────────────────────────────────────────────

  isUlbUser(): boolean {
    return this.role() === 'ULB';
  }

  isStateUser(): boolean {
    return this.role() === 'STATE';
  }

  isMohuaUser(): boolean {
    return this.role() === 'MoHUA';
  }

  // ── Access-level predicates (apply to any role with subroles) ────────────────

  isAdmin(): boolean {
    return this.accessLevel() === 'ADMIN';
  }

  isEditor(): boolean {
    return this.accessLevel() === 'EDITOR';
  }

  isViewer(): boolean {
    return this.accessLevel() === 'VIEWER';
  }

  isSubmitter(): boolean {
    return this.subRole() === 'SUBMITTER';
  }

  // ── User management ───────────────────────────────────────────────────────────

  canViewManagedUsers(): boolean {
    return this.hasPermission(Permission.VIEW_MANAGED_USERS);
  }

  canCreateManagedUser(): boolean {
    return this.hasPermission(Permission.CREATE_MANAGED_USER);
  }

  // ── STATE form actions ────────────────────────────────────────────────────────

  canViewStateForms(): boolean {
    return this.hasPermission(Permission.VIEW_STATE_FORMS);
  }

  canEditStateForms(): boolean {
    return this.hasPermission(Permission.EDIT_STATE_FORMS);
  }

  canSubmitStateForms(): boolean {
    return this.hasPermission(Permission.FINAL_SUBMIT_STATE_FORMS);
  }

  canSubmitToMohua(): boolean {
    return this.hasPermission(Permission.FINAL_SUBMIT_TO_MOHUA);
  }

  // ── MoHUA actions ─────────────────────────────────────────────────────────────

  canReviewStateSubmissions(): boolean {
    return this.hasPermission(Permission.REVIEW_STATE_SUBMISSIONS);
  }

  canApproveStateSubmissions(): boolean {
    return this.hasPermission(Permission.APPROVE_STATE_SUBMISSIONS);
  }

  canIssueOfficeMemorandum(): boolean {
    return this.hasPermission(Permission.ISSUE_OFFICE_MEMORANDUM);
  }

  canSubmitToDoe(): boolean {
    return this.hasPermission(Permission.FINAL_SUBMIT_TO_DOE);
  }

  // ── ULB actions — no granular permissions in this phase; any ULB user has full access ──

  canUploadDocuments(): boolean {
    return this.isUlbUser();
  }

  canDeleteDocuments(): boolean {
    return this.isUlbUser();
  }

  canSubmitToStateDma(): boolean {
    return this.isUlbUser();
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
