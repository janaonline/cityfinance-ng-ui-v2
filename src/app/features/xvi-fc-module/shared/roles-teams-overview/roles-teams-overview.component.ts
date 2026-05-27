import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';

type EntityType = 'ulb' | 'state';
type TeamMemberRole = 'Submitter' | 'Editor' | 'Viewer' | null;
type TeamMemberStatus = 'active' | 'inactive' | 'invited' | 'pending';

interface ApiUser {
  _id?: string;
  mobile?: string | null;
  designation?: string;
  organization?: string;
  name: string;
  email?: string;
  role?: string;
  status?: string;
  isXVIFCProfileVerified?: boolean;
}

interface ApiUlbDetails {
  name?: string;
  code?: string;
  stateName?: string;
}

interface ApiUsersListResponse {
  success: boolean;
  data: {
    ulbDetails?: ApiUlbDetails;
    stateDetails?: ApiUlbDetails;
    data: ApiUser[];
  };
  timestamp: string;
}

interface EntityTeamProfile {
  type: EntityType;
  initials: string;
  name: string;
  code?: string;
  category?: string;
  state?: string;
}

interface TeamMember {
  id: string;
  initials: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  lastActive: string | null;
}

interface PermissionMatrixRow {
  permission: string;
  submitter: boolean;
  editor: boolean;
  viewer: boolean;
}

interface PendingRoleChange {
  memberId: string;
  newRole: string;
  currentRole: string;
  memberName: string;
}

@Component({
  selector: 'app-roles-teams-overview',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTableModule,
  ],
  templateUrl: './roles-teams-overview.component.html',
  styleUrl: './roles-teams-overview.component.scss',
})
export class RolesTeamsOverviewComponent implements OnInit {
  @ViewChild('addMemberDialog') private addMemberDialog?: TemplateRef<unknown>;
  @ViewChild('activateDialog') private activateDialog?: TemplateRef<unknown>;
  @ViewChild('roleConfirmDialog') private roleConfirmDialog?: TemplateRef<unknown>;
  @ViewChild('disableConfirmDialog') private disableConfirmDialog?: TemplateRef<unknown>;
  @ViewChild('deleteConfirmDialog') private deleteConfirmDialog?: TemplateRef<unknown>;
  @ViewChild('transferDialog') private transferDialog?: TemplateRef<unknown>;

  private readonly dialog = inject(MatDialog);
  private readonly http = inject(HttpClient);
  private readonly snackBar = inject(MatSnackBar);
  private addMemberDialogRef?: MatDialogRef<unknown>;
  private activateDialogRef?: MatDialogRef<unknown>;
  private roleConfirmDialogRef?: MatDialogRef<unknown>;
  private disableConfirmDialogRef?: MatDialogRef<unknown>;
  private deleteConfirmDialogRef?: MatDialogRef<unknown>;
  private transferDialogRef?: MatDialogRef<unknown>;

  private readonly baseUrl = environment.api.url2;

  entityType: EntityType = 'ulb';
  entityId = '';
  ulbId = '';
  stateId = '';
  userRole = '';

  get isReadOnly(): boolean {
    const r = this.userRole.toUpperCase();
    return r.endsWith('-EDITOR') || r.endsWith('-VIEWER');
  }

  profile: EntityTeamProfile | null = null;
  members: TeamMember[] = [];
  isLoading = true;
  errorMessage = '';
  showPermissionMatrix = false;

  memberRoleSelections: Record<string, string> = {};
  pendingRoleChange: PendingRoleChange | null = null;

  // ── Add member form state ──────────────────────────────────────────────────
  addMemberName = '';
  addMemberPhone = '';
  addMemberEmail = '';
  addMemberDesignation = '';
  addMemberRole = '';
  addingMember = false;

  // ── Activate / invite state ────────────────────────────────────────────────
  activatingMember: TeamMember | null = null;
  activateMobile = '';
  activateDesignation = '';
  activateRole = '';
  sendingInvite = false;

  // ── Disable confirm state ──────────────────────────────────────────────────
  disablingMember: TeamMember | null = null;

  // ── Delete confirm state ───────────────────────────────────────────────────
  deletingMember: TeamMember | null = null;

  // ── Transfer ownership state ───────────────────────────────────────────────
  transferToMemberId = '';
  transferOtp = '';
  transferStep: 'select' | 'otp' = 'select';
  transferSending = false;
  transferVerifying = false;

  readonly memberColumns = ['member', 'designation', 'role', 'status', 'action'];
  readonly permissionColumns = ['permission', 'submitter', 'editor', 'viewer'];
  readonly availableRoles: Exclude<TeamMemberRole, 'Submitter' | null>[] = ['Editor', 'Viewer'];

  getRolesForMember(member: TeamMember): Exclude<TeamMemberRole, 'Submitter' | null>[] {
    // Editor can only be downgraded to Viewer; Viewer can be upgraded to Editor.
    // Always include the current role so the mat-select has a matching option to display.
    if (member.role === 'Editor') return ['Editor', 'Viewer'];
    return ['Editor', 'Viewer'];
  }
  readonly inviteRoles = [
    { value: 'Editor', label: 'Editor - prepares, uploads and verifies documents' },
    { value: 'Viewer', label: 'Viewer - can view status and reports' },
  ];
  readonly permissionMatrix: PermissionMatrixRow[] = [
    { permission: 'View status and reports', submitter: true, editor: true, viewer: true },
    { permission: 'Upload documents', submitter: true, editor: true, viewer: false },
    { permission: 'Message users', submitter: true, editor: true, viewer: false },
    { permission: 'Final submit to State DMA', submitter: true, editor: false, viewer: false },
    { permission: 'Manage users', submitter: true, editor: false, viewer: false },
  ];

  ngOnInit(): void {
    this.resolveEntityFromStorage();
    void this.loadRolesTeamsOverview();
  }

  get profileEyebrow(): string {
    return this.entityType === 'state' ? 'STATE PROFILE' : 'ULB PROFILE';
  }

  get memberLimitReached(): boolean {
    return this.members.length >= 5;
  }

  get submitter(): TeamMember | undefined {
    return this.members.find((m) => m.role === 'Submitter');
  }

  get transferableMembers(): TeamMember[] {
    return this.members.filter((m) => m.role !== 'Submitter' && m.status === 'active');
  }

  private resolveEntityFromStorage(): void {
    try {
      const raw = localStorage.getItem('userData');
      if (!raw) return;
      const user = JSON.parse(raw) as {
        role?: string;
        ulb?: string;
        state?: string;
        name?: string;
        email?: string;
      };
      const role = user.role ?? '';
      this.userRole = role;
      this.ulbId = user.ulb ?? '';
      this.stateId = user.state ?? '';
      if (role === 'STATE' || role === 'XVIFC_STATE') {
        this.entityType = 'state';
        this.entityId = this.stateId;
      } else {
        this.entityType = 'ulb';
        this.entityId = this.ulbId;
      }
      this.profile = this.buildProfileFromStorage(user.name, user.email);
    } catch {
      /* ignore */
    }
  }

  private buildProfileFromStorage(name?: string, email?: string): EntityTeamProfile {
    const displayName = name || email || (this.entityType === 'state' ? 'State' : 'ULB');
    return {
      type: this.entityType,
      initials: this.getInitials(displayName),
      name: displayName,
      code: this.entityId,
      category: this.entityType === 'state' ? 'State' : 'Urban Local Body',
    };
  }

  async loadRolesTeamsOverview(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      const res = await firstValueFrom(
        this.http.get<ApiUsersListResponse>(`${this.baseUrl}users/list`, {
          params: new HttpParams().set(
            this.entityType === 'state' ? 'stateId' : 'ulbId',
            this.entityId,
          ),
        }),
      );
      const entityDetails = res.data?.ulbDetails ?? res.data?.stateDetails;
      if (entityDetails) {
        this.profile = {
          type: this.entityType,
          initials: this.getInitials(entityDetails.name ?? ''),
          name: entityDetails.name ?? '',
          code: entityDetails.code ?? this.entityId,
          category: this.entityType === 'state' ? 'State' : 'Urban Local Body',
          state: entityDetails.stateName,
        };
      }
      const members = (res.data?.data ?? []).map((u) => this.mapApiUser(u));
      this.members = members;
      this.memberRoleSelections = Object.fromEntries(
        members
          .filter((m) => m.role && m.role !== 'Submitter')
          .map((m) => [m.id, m.role as string]),
      );
    } catch (error) {
      console.error('Failed to load roles and teams overview', error);
      this.errorMessage = 'Unable to load people and roles right now.';
    } finally {
      this.isLoading = false;
    }
  }

  private mapApiUser(user: ApiUser): TeamMember {
    const apiRole = user.role?.toLowerCase();
    let role: TeamMemberRole = null;
    if (apiRole === 'submitter') role = 'Submitter';
    else if (apiRole === 'editor') role = 'Editor';
    else if (apiRole === 'viewer') role = 'Viewer';

    return {
      id: user._id ?? `${user.name}_${user.mobile ?? user.email ?? ''}`,
      initials: this.getInitials(user.name || user.email || ''),
      name: user.name || user.email || '',
      email: user.email ?? '',
      phone: user.mobile ?? '',
      designation: user.designation || '',
      role,
      status: this.resolveApiStatus(user.status, user.isXVIFCProfileVerified),
      lastActive: null,
    };
  }

  private getInitials(name: string): string {
    return name
      .trim()
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('');
  }

  // ── Role change ────────────────────────────────────────────────────────────
  onRoleChangeRequest(memberId: string, newRole: string): void {
    const member = this.members.find((m) => m.id === memberId);
    if (!member || !member.role || !this.isAssignableRole(newRole)) return;
    if (newRole === member.role) return;

    this.memberRoleSelections[memberId] = newRole;
    this.pendingRoleChange = { memberId, newRole, currentRole: member.role, memberName: member.name };

    if (!this.roleConfirmDialog) return;
    this.roleConfirmDialogRef = this.dialog.open(this.roleConfirmDialog, {
      width: 'min(400px, calc(100vw - 32px))',
      panelClass: 'roles-dialog-panel',
    });
  }

  onConfirmRoleChange(): void {
    if (!this.pendingRoleChange) return;
    const { memberId, newRole } = this.pendingRoleChange;
    this.members = this.members.map((m) =>
      m.id === memberId ? { ...m, role: newRole as TeamMemberRole } : m,
    );
    this.memberRoleSelections[memberId] = newRole;
    this.pendingRoleChange = null;
    this.roleConfirmDialogRef?.close();
  }

  onCancelRoleChange(): void {
    if (this.pendingRoleChange) {
      this.memberRoleSelections[this.pendingRoleChange.memberId] = this.pendingRoleChange.currentRole;
    }
    this.pendingRoleChange = null;
    this.roleConfirmDialogRef?.close();
  }

  // ── Activate flow ──────────────────────────────────────────────────────────
  onActivate(member: TeamMember): void {
    this.activatingMember = { ...member };
    this.activateMobile = member.phone.replace(/\D/g, '').slice(-10);
    this.activateDesignation = member.designation;
    this.activateRole = '';
    this.sendingInvite = false;

    if (!this.activateDialog) return;
    this.activateDialogRef = this.dialog.open(this.activateDialog, {
      autoFocus: 'first-tabbable',
      maxHeight: 'calc(100vh - 48px)',
      panelClass: 'roles-dialog-panel',
      width: 'min(460px, calc(100vw - 32px))',
    });
  }

  onCloseActivateDialog(): void {
    this.activateDialogRef?.close();
    this.activatingMember = null;
  }

  onSendActivationInvite(): void {
    if (!this.activatingMember || this.sendingInvite || !this.activateRole) return;
    this.sendingInvite = true;
    const memberName = this.activatingMember.name;
    const memberId = this.activatingMember.id;
    const memberEmail = this.activatingMember.email;

    const payload = {
      name: memberName,
      username: memberName,
      email: memberEmail,
      mobile: this.activateMobile,
      role: this.mapRoleToApiRole(this.activateRole),
      designation: this.activateDesignation,
      ulbId: this.ulbId,
      stateId: this.stateId,
      status: 'PENDING',
    };

    this.http
      .post<{ success?: boolean; data?: { _id?: string }; message?: string }>(
        `${this.baseUrl}users/create-user`,
        payload,
      )
      .subscribe({
        next: () => {
          this.members = this.members.map((m) =>
            m.id === memberId
              ? {
                  ...m,
                  status: 'invited' as TeamMemberStatus,
                  designation: this.activateDesignation,
                  role: this.activateRole as TeamMemberRole,
                }
              : m,
          );
          this.sendingInvite = false;
          this.snackBar.open(
            `Invite sent to ${memberName}. A welcome message will be sent to their mobile number.`,
            'Dismiss',
            { duration: 5000, horizontalPosition: 'end', verticalPosition: 'top', panelClass: ['snack-success'] },
          );
          this.onCloseActivateDialog();
        },
        error: (err) => {
          this.sendingInvite = false;
          this.snackBar.open(
            err?.error?.message ?? 'Failed to send invite. Please try again.',
            'Dismiss',
            { duration: 5000, horizontalPosition: 'end', verticalPosition: 'top' },
          );
        },
      });
  }

  // ── Other actions ──────────────────────────────────────────────────────────
  onDisable(member: TeamMember): void {
    this.disablingMember = { ...member };
    if (!this.disableConfirmDialog) return;
    this.disableConfirmDialogRef = this.dialog.open(this.disableConfirmDialog, {
      width: 'min(400px, calc(100vw - 32px))',
      panelClass: 'roles-dialog-panel',
    });
  }

  onConfirmDisable(): void {
    if (!this.disablingMember) return;
    const memberId = this.disablingMember.id;
    this.members = this.members.map((m) =>
      m.id === memberId ? { ...m, status: 'inactive' as TeamMemberStatus, role: null } : m,
    );
    delete this.memberRoleSelections[memberId];
    this.disableConfirmDialogRef?.close();
    this.disablingMember = null;
  }

  onCancelDisable(): void {
    this.disableConfirmDialogRef?.close();
    this.disablingMember = null;
  }

  // ── Delete flow ────────────────────────────────────────────────────────────
  onDelete(member: TeamMember): void {
    this.deletingMember = { ...member };
    if (!this.deleteConfirmDialog) return;
    this.deleteConfirmDialogRef = this.dialog.open(this.deleteConfirmDialog, {
      width: 'min(400px, calc(100vw - 32px))',
      panelClass: 'roles-dialog-panel',
    });
  }

  onConfirmDelete(): void {
    if (!this.deletingMember) return;
    const memberId = this.deletingMember.id;
    this.members = this.members.filter((m) => m.id !== memberId);
    delete this.memberRoleSelections[memberId];
    this.deleteConfirmDialogRef?.close();
    this.deletingMember = null;
  }

  onCancelDelete(): void {
    this.deleteConfirmDialogRef?.close();
    this.deletingMember = null;
  }

  onOpenPermissionMatrix(): void {
    this.showPermissionMatrix = !this.showPermissionMatrix;
  }

  onAddMember(): void {
    if (this.memberLimitReached || !this.addMemberDialog) return;
    this.addMemberName = '';
    this.addMemberPhone = '';
    this.addMemberEmail = '';
    this.addMemberDesignation = '';
    this.addMemberRole = '';
    this.addingMember = false;
    this.addMemberDialogRef = this.dialog.open(this.addMemberDialog, {
      autoFocus: 'first-tabbable',
      maxHeight: 'calc(100vh - 48px)',
      panelClass: 'roles-dialog-panel',
      width: 'min(440px, calc(100vw - 32px))',
    });
  }

  onCloseAddMemberDialog(): void {
    this.addMemberDialogRef?.close();
    this.addMemberName = '';
    this.addMemberPhone = '';
    this.addMemberEmail = '';
    this.addMemberDesignation = '';
    this.addMemberRole = '';
  }

  onAddMemberSubmit(): void {
    if (this.addingMember || !this.addMemberName || this.addMemberPhone.length < 10 || !this.addMemberRole) return;
    this.addingMember = true;

    const payload = {
      name: this.addMemberName,
      username: this.addMemberName,
      email: this.addMemberEmail,
      mobile: this.addMemberPhone,
      role: this.mapRoleToApiRole(this.addMemberRole),
      designation: this.addMemberDesignation,
      ulbId: this.ulbId,
      stateId: this.stateId,
      status: 'PENDING',
    };

    this.http
      .post<{ success?: boolean; data?: { _id?: string }; message?: string }>(
        `${this.baseUrl}users/create-user`,
        payload,
      )
      .subscribe({
        next: (res) => {
          const newMember: TeamMember = {
            id: res.data?._id ?? `new_${this.addMemberPhone}_${Date.now()}`,
            initials: this.getInitials(this.addMemberName),
            name: this.addMemberName,
            email: this.addMemberEmail,
            phone: this.addMemberPhone,
            designation: this.addMemberDesignation,
            role: this.addMemberRole as TeamMemberRole,
            status: 'invited',
            lastActive: null,
          };
          this.members = [...this.members, newMember];
          this.addingMember = false;
          this.snackBar.open(
            `Invite sent to ${newMember.name}. A welcome message will be sent to their mobile number.`,
            'Dismiss',
            { duration: 5000, horizontalPosition: 'end', verticalPosition: 'top', panelClass: ['snack-success'] },
          );
          this.onCloseAddMemberDialog();
        },
        error: (err) => {
          this.addingMember = false;
          this.snackBar.open(
            err?.error?.message ?? 'Failed to add member. Please try again.',
            'Dismiss',
            { duration: 5000, horizontalPosition: 'end', verticalPosition: 'top' },
          );
        },
      });
  }

  // ── Transfer ownership flow ────────────────────────────────────────────────
  onTransferOwnership(): void {
    if (!this.transferDialog) return;
    this.transferToMemberId = '';
    this.transferOtp = '';
    this.transferStep = 'select';
    this.transferSending = false;
    this.transferVerifying = false;
    this.transferDialogRef = this.dialog.open(this.transferDialog, {
      autoFocus: 'first-tabbable',
      maxHeight: 'calc(100vh - 48px)',
      panelClass: 'roles-dialog-panel',
      width: 'min(480px, calc(100vw - 32px))',
      disableClose: true,
    });
  }

  onCloseTransferDialog(): void {
    this.transferDialogRef?.close();
  }

  onSendTransferOtp(): void {
    if (!this.transferToMemberId || this.transferSending) return;
    const submitter = this.submitter;
    if (!submitter?.phone) return;
    this.transferSending = true;

    this.http
      .post<{ message?: string }>(`${this.baseUrl}auth/sendOtp`, {
        identifier: submitter.phone,
        purpose: 'login',
      })
      .subscribe({
        next: () => {
          this.transferSending = false;
          this.transferStep = 'otp';
        },
        error: () => {
          this.transferSending = false;
          this.snackBar.open('Failed to send OTP. Please try again.', 'Dismiss', {
            duration: 4000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
      });
  }

  onVerifyTransferOtp(): void {
    if (!this.transferOtp || this.transferVerifying) return;
    const submitter = this.submitter;
    if (!submitter?.phone) return;
    this.transferVerifying = true;

    this.http
      .post<{ success?: boolean; message?: string }>(`${this.baseUrl}auth/verifyOtp`, {
        identifier: submitter.phone,
        otp: this.transferOtp,
      })
      .subscribe({
        next: (res) => {
          this.transferVerifying = false;
          if (res?.success === false) {
            this.snackBar.open(res.message ?? 'Invalid OTP. Please try again.', 'Dismiss', {
              duration: 4000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
            });
            return;
          }
          this.applyOwnershipTransfer();
        },
        error: (err) => {
          this.transferVerifying = false;
          this.snackBar.open(
            err?.error?.message ?? 'Invalid OTP. Please try again.',
            'Dismiss',
            { duration: 4000, horizontalPosition: 'end', verticalPosition: 'top' },
          );
        },
      });
  }

  private applyOwnershipTransfer(): void {
    const newSubmitterId = this.transferToMemberId;
    this.members = this.members.map((m) => {
      if (m.role === 'Submitter') return { ...m, role: 'Editor' as TeamMemberRole };
      if (m.id === newSubmitterId) return { ...m, role: 'Submitter' as TeamMemberRole };
      return m;
    });
    delete this.memberRoleSelections[newSubmitterId];
    this.transferDialogRef?.close();
    const newSubmitter = this.members.find((m) => m.id === newSubmitterId);
    this.snackBar.open(
      `Ownership transferred to ${newSubmitter?.name ?? 'the selected member'}.`,
      'Dismiss',
      { duration: 5000, horizontalPosition: 'end', verticalPosition: 'top', panelClass: ['snack-success'] },
    );
  }

  private resolveApiStatus(apiStatus?: string, verified?: boolean): TeamMemberStatus {
    const s = apiStatus?.toUpperCase();
    if (s === 'APPROVED') return 'active';
    if (s === 'PENDING') return 'pending';
    if (verified) return 'active';
    return 'inactive';
  }

  private mapRoleToApiRole(role: string): string {
    const prefix = this.entityType === 'state' ? 'STATE' : 'ULB';
    if (role === 'Editor') return `${prefix}-EDITOR`;
    if (role === 'Viewer') return `${prefix}-VIEWER`;
    return role.toUpperCase();
  }

  private isAssignableRole(role: string): role is Exclude<TeamMemberRole, 'Submitter' | null> {
    return role === 'Editor' || role === 'Viewer';
  }
}
