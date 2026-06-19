import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AuthPermissionService } from '../../../../core/auth/auth-permission.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Permission } from '../../../../core/auth/permissions';
import { PageErrorStateComponent } from '../page-error-state/page-error-state.component';
import { RolesDialogComponent } from './roles-dialog/roles-dialog.component';
import { RolesDialogConfig, RolesDialogResult } from './roles-dialog/roles-dialog.types';

type EntityType = 'ulb' | 'state';
type TeamMemberRole = 'Submitter' | 'Editor' | 'Viewer' | null;
type TeamMemberStatus = 'active' | 'inactive' | 'invited' | 'pending';

interface ApiTeamMember {
  _id: string;
  name: string;
  designation: string;
  email: string;
  mobile: string;
  role: string;
  status: string;
  isActive: boolean;
  isXVIFCProfileVerified: boolean;
  lastLoginAt: string | null;
}

interface ApiEntityDetails {
  name?: string;
  code?: string;
  stateName?: string;
}

interface ApiTeamMembersResponse {
  ulbDetails?: ApiEntityDetails;
  stateDetails?: ApiEntityDetails;
  data: ApiTeamMember[];
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
    MatTooltipModule,
    PageErrorStateComponent,
  ],
  templateUrl: './roles-teams-overview.component.html',
  styleUrl: './roles-teams-overview.component.scss',
})
export class RolesTeamsOverviewComponent implements OnInit {
  readonly permissionService = inject(AuthPermissionService);
  readonly Permission = Permission;
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  @ViewChild('transferDialog') private transferDialog?: TemplateRef<unknown>;
  private transferDialogRef?: MatDialogRef<unknown>;

  private readonly dialog = inject(MatDialog);
  private readonly http = inject(HttpClient);
  private readonly snackBar = inject(MatSnackBar);

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
  hasError = false;
  showPermissionMatrix = false;

  memberRoleSelections: Record<string, string> = {};

  // ── Transfer ownership state ───────────────────────────────────────────────
  transferToMemberId = '';
  transferOtp = '';
  transferStep: 'select' | 'otp' = 'select';
  transferSending = false;
  transferVerifying = false;

  readonly memberColumns = ['member', 'designation', 'role', 'status', 'lastLogin', 'action'];
  readonly permissionColumns = ['permission', 'submitter', 'editor', 'viewer'];
  readonly availableRoles: Exclude<TeamMemberRole, 'Submitter' | null>[] = ['Editor', 'Viewer'];

  getRolesForMember(member: TeamMember): Exclude<TeamMemberRole, 'Submitter' | null>[] {
    if (member.role === 'Editor') return ['Editor', 'Viewer'];
    return ['Editor', 'Viewer'];
  }

  readonly inviteRoles = [
    { value: 'Editor', label: 'Editor - prepares, uploads and verifies documents' },
    { value: 'Viewer', label: 'Viewer - can view status and reports' },
  ];

  private readonly ulbPermissionMatrix: PermissionMatrixRow[] = [
    { permission: 'View status and reports', submitter: true, editor: true, viewer: true },
    { permission: 'Upload documents', submitter: true, editor: true, viewer: false },
    { permission: 'Message users', submitter: true, editor: true, viewer: false },
    { permission: 'Final submit to State DMA', submitter: true, editor: false, viewer: false },
    { permission: 'Manage users', submitter: true, editor: false, viewer: false },
  ];

  private readonly statePermissionMatrix: PermissionMatrixRow[] = [
    { permission: 'View status and reports', submitter: true, editor: true, viewer: true },
    { permission: 'View dashboards', submitter: true, editor: true, viewer: true },
    { permission: 'Upload state-level documents', submitter: true, editor: true, viewer: false },
    { permission: 'Review ULB submissions', submitter: true, editor: true, viewer: false },
    { permission: 'Message users', submitter: true, editor: true, viewer: false },
    { permission: 'Approve ULB submissions', submitter: true, editor: false, viewer: false },
    { permission: 'Prepare grant letters', submitter: true, editor: false, viewer: false },
    { permission: 'Recommend exemptions', submitter: true, editor: false, viewer: false },
    { permission: 'Final submit to MoHUA', submitter: true, editor: false, viewer: false },
    { permission: 'Manage users', submitter: true, editor: false, viewer: false },
  ];

  get permissionMatrix(): PermissionMatrixRow[] {
    return this.entityType === 'state' ? this.statePermissionMatrix : this.ulbPermissionMatrix;
  }

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

  get sortedMembers(): TeamMember[] {
    return [...this.members].sort((a, b) => {
      if (a.role === 'Submitter') return -1;
      if (b.role === 'Submitter') return 1;
      return 0;
    });
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
        scope?: string;
        ulb?: string;
        state?: string;
        name?: string;
        email?: string;
      };
      const role = user.role ?? '';
      const scope = (user.scope ?? '').toUpperCase();
      this.userRole = role;
      this.ulbId = user.ulb ?? '';
      this.stateId = user.state ?? '';
      const isStateScope = scope === 'STATE' || role === 'XVIFC_STATE';
      if (isStateScope) {
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
    this.hasError = false;
    try {
      const param = this.entityType === 'state' ? 'stateId' : 'ulbId';
      const res = await firstValueFrom(
        this.http.get<{ success: boolean; data: ApiTeamMembersResponse } | ApiTeamMembersResponse>(
          `${this.baseUrl}users/team-members`,
          { params: new HttpParams().set(param, this.entityId) },
        ),
      );

      const payload = 'success' in res ? res.data : res;
      const entityDetails = payload.ulbDetails ?? payload.stateDetails;

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

      const members = (payload.data ?? []).map((u) => this.mapApiUser(u));
      this.members = members;
      this.memberRoleSelections = Object.fromEntries(
        members.filter((m) => m.role && m.role !== 'Submitter').map((m) => [m.id, m.role as string]),
      );
    } catch (error) {
      console.error('Failed to load roles and teams overview', error);
      this.hasError = true;
    } finally {
      this.isLoading = false;
    }
  }

  private mapApiUser(user: ApiTeamMember): TeamMember {
    const apiRole = user.role.toLowerCase();
    let role: TeamMemberRole = null;
    switch (apiRole) {
      case 'submitter': role = 'Submitter'; break;
      case 'editor':    role = 'Editor';    break;
      case 'viewer':    role = 'Viewer';    break;
    }

    return {
      id: user._id,
      initials: this.getInitials(user.name || user.email),
      name: user.name || user.email,
      email: user.email,
      phone: user.mobile,
      designation: user.designation,
      role,
      status: this.resolveApiStatus(user.status, user.isXVIFCProfileVerified),
      lastActive: user.lastLoginAt,
    };
  }

  formatLastLogin(value: string | null): string {
    if (!value) return 'Never';
    return new Date(value).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
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

  // ── Add member ─────────────────────────────────────────────────────────────
  onAddMember(): void {
    if (this.memberLimitReached) return;
    const dialogRef = this.dialog.open(RolesDialogComponent, {
      autoFocus: 'first-tabbable',
      maxHeight: 'calc(100vh - 48px)',
      panelClass: 'roles-dialog-panel',
      width: 'min(440px, calc(100vw - 32px))',
      data: {
        title: 'Add Member',
        subtitle: "Fill in the details below. A welcome message will be sent to the user's mobile number.",
        fields: [
          { type: 'select', key: 'role', label: 'Role', required: true, options: this.inviteRoles },
          {
            type: 'text',
            key: 'name',
            label: 'Full Name',
            required: true,
            placeholder: 'e.g. Priya Nair',
            sanitize: this.sanitizeName.bind(this),
          },
          {
            type: 'tel',
            key: 'phone',
            label: 'Phone Number',
            required: true,
            placeholder: '10-digit mobile number',
            maxlength: 10,
            sanitize: this.sanitizePhone.bind(this),
          },
          {
            type: 'text',
            key: 'designation',
            label: 'Designation',
            optional: true,
            placeholder: 'e.g. Accounts Officer',
            sanitize: this.sanitizeDesignation.bind(this),
          },
        ],
        confirmLabel: 'Add Member',
        confirmIcon: 'person_add',
        disabledFn: (v: Record<string, string>) =>
          !v['name'] || (v['phone']?.length ?? 0) < 10 || !v['role'],
      } satisfies RolesDialogConfig,
    });

    dialogRef.afterClosed().subscribe((result: RolesDialogResult) => {
      if (!result) return;
      this.submitAddMember(
        { name: result['name'], phone: result['phone'], email: '', designation: result['designation'] ?? '', role: result['role'] },
        false,
      );
    });
  }

  private submitAddMember(
    params: { name: string; phone: string; email: string; designation: string; role: string },
    skipEmail: boolean,
  ): void {
    const payload: Record<string, unknown> = {
      name: params.name,
      username: params.name,
      mobile: params.phone,
      role: this.mapRoleToApiRole(params.role),
      designation: params.designation,
      ulbId: this.ulbId,
      stateId: this.stateId,
      status: 'PENDING',
    };
    if (!skipEmail && params.email) {
      payload['email'] = params.email;
    }

    this.http.post<{ success?: boolean; data?: { _id?: string }; message?: string }>(`${this.baseUrl}users/create-user`, payload).subscribe({
      next: () => {
        this.snackBar.open(
          `Invite sent to ${params.name}. A welcome message will be sent to their mobile number.`,
          'Dismiss',
          { duration: 5000, horizontalPosition: 'end', verticalPosition: 'top', panelClass: ['snack-success'] },
        );
        void this.loadRolesTeamsOverview();
      },
      error: (err) => {
        const msg: string = (err?.error?.message ?? '').toLowerCase();
        if (!skipEmail && params.email && msg.includes('email')) {
          this.submitAddMember(params, true);
          return;
        }
        this.snackBar.open(err?.error?.message ?? 'Failed to add member. Please try again.', 'Dismiss', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
      },
    });
  }

  // ── Activate / invite ──────────────────────────────────────────────────────
  onActivate(member: TeamMember): void {
    const initialPhone = member.phone.replace(/\D/g, '').slice(-10);
    const dialogRef = this.dialog.open(RolesDialogComponent, {
      autoFocus: 'first-tabbable',
      maxHeight: 'calc(100vh - 48px)',
      panelClass: 'roles-dialog-panel',
      width: 'min(460px, calc(100vw - 32px))',
      data: {
        title: 'Send Invite',
        subtitle: "Fill in the details below. A welcome message will be sent to the user's mobile number.",
        fields: [
          { type: 'readonly', key: '__name', label: 'Full Name', content: member.name },
          {
            type: 'text',
            key: 'designation',
            label: 'Designation',
            placeholder: 'e.g. Accounts Officer',
            initialValue: member.designation,
            sanitize: this.sanitizeDesignation.bind(this),
          },
          {
            type: 'tel',
            key: 'phone',
            label: 'Mobile Number',
            placeholder: '10-digit mobile',
            maxlength: 10,
            initialValue: initialPhone,
            sanitize: this.sanitizePhone.bind(this),
          },
          { type: 'select', key: 'role', label: 'Role', options: this.inviteRoles },
        ],
        confirmLabel: 'Send Invite',
        confirmIcon: 'send',
        disabledFn: (v: Record<string, string>) => (v['phone']?.length ?? 0) < 10 || !v['role'],
      } satisfies RolesDialogConfig,
    });

    dialogRef.afterClosed().subscribe((result: RolesDialogResult) => {
      if (!result) return;
      this.sendActivationInvite(member, {
        phone: result['phone'],
        email: member.email ?? '',
        designation: result['designation'] ?? '',
        role: result['role'],
      });
    });
  }

  private sendActivationInvite(
    member: TeamMember,
    params: { phone: string; email: string; designation: string; role: string },
  ): void {
    const payload = {
      name: member.name,
      username: member.name,
      email: params.email,
      mobile: params.phone,
      role: this.mapRoleToApiRole(params.role),
      designation: params.designation,
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
          this.snackBar.open(
            `Invite sent to ${member.name}. A welcome message will be sent to their mobile number.`,
            'Dismiss',
            { duration: 5000, horizontalPosition: 'end', verticalPosition: 'top', panelClass: ['snack-success'] },
          );
          void this.loadRolesTeamsOverview();
        },
        error: (err) => {
          this.snackBar.open(err?.error?.message ?? 'Failed to send invite. Please try again.', 'Dismiss', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
      });
  }

  // ── Disable ────────────────────────────────────────────────────────────────
  onDisable(member: TeamMember): void {
    const dialogRef = this.dialog.open(RolesDialogComponent, {
      width: 'min(400px, calc(100vw - 32px))',
      panelClass: 'roles-dialog-panel',
      data: {
        title: 'Disable Member',
        subtitle: 'This will revoke their access immediately.',
        fields: [
          {
            type: 'confirm-message',
            key: '__msg',
            content: `Are you sure you want to disable access for ${member.name}? They will no longer be able to log in.`,
          },
        ],
        confirmLabel: 'Disable',
        confirmDanger: true,
      } satisfies RolesDialogConfig,
    });

    dialogRef.afterClosed().subscribe((result: RolesDialogResult) => {
      if (!result) return;
      this.executeDisable(member);
    });
  }

  private executeDisable(member: TeamMember): void {
    this.http
      .patch<{ success: boolean }>(`${this.baseUrl}users/${member.id}`, { status: 'INACTIVE' })
      .subscribe({
        next: () => {
          this.members = this.members.map((m) =>
            m.id === member.id ? { ...m, status: 'inactive' as TeamMemberStatus } : m,
          );
          this.snackBar.open(`${member.name} has been disabled.`, 'Dismiss', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
        },
        error: (err) => {
          this.snackBar.open(err?.error?.message ?? 'Failed to disable member. Please try again.', 'Dismiss', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
      });
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  onDelete(member: TeamMember): void {
    const dialogRef = this.dialog.open(RolesDialogComponent, {
      width: 'min(400px, calc(100vw - 32px))',
      panelClass: 'roles-dialog-panel',
      data: {
        title: 'Remove Member',
        subtitle: 'This will permanently remove them from the team.',
        fields: [
          {
            type: 'confirm-message',
            key: '__msg',
            content: `Are you sure you want to remove ${member.name} from the team? This frees up a member slot.`,
          },
        ],
        confirmLabel: 'Remove',
        confirmDanger: true,
      } satisfies RolesDialogConfig,
    });

    dialogRef.afterClosed().subscribe((result: RolesDialogResult) => {
      if (!result) return;
      this.executeDelete(member);
    });
  }

  private executeDelete(member: TeamMember): void {
    this.http
      .delete<{ success: boolean; data?: { message?: string } }>(`${this.baseUrl}users/${member.id}`)
      .subscribe({
        next: () => {
          this.members = this.members.filter((m) => m.id !== member.id);
          delete this.memberRoleSelections[member.id];
          this.snackBar.open(`${member.name} has been removed.`, 'Dismiss', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
        },
        error: (err) => {
          this.snackBar.open(err?.error?.message ?? 'Failed to delete user. Please try again.', 'Dismiss', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
      });
  }

  // ── Role change ────────────────────────────────────────────────────────────
  onRoleChangeRequest(memberId: string, newRole: string): void {
    const member = this.members.find((m) => m.id === memberId);
    if (!member || !member.role || !this.isAssignableRole(newRole) || newRole === member.role) return;

    const currentRole = member.role;
    this.memberRoleSelections[memberId] = newRole;

    const dialogRef = this.dialog.open(RolesDialogComponent, {
      width: 'min(400px, calc(100vw - 32px))',
      panelClass: 'roles-dialog-panel',
      data: {
        title: 'Confirm Role Change',
        subtitle: 'This will update their access permissions immediately.',
        fields: [
          {
            type: 'role-change',
            key: '__roleChange',
            roleChange: { memberName: member.name, fromRole: currentRole, toRole: newRole },
          },
        ],
        confirmLabel: 'Confirm',
      } satisfies RolesDialogConfig,
    });

    dialogRef.afterClosed().subscribe((result: RolesDialogResult) => {
      if (result) {
        this.executeRoleChange(memberId, newRole, currentRole);
      } else {
        this.memberRoleSelections[memberId] = currentRole;
      }
    });
  }

  private executeRoleChange(memberId: string, newRole: string, currentRole: string): void {
    const apiRole = this.mapRoleToApiRole(newRole);
    this.http
      .patch<{ success: boolean; data?: { message?: string } }>(`${this.baseUrl}users/${memberId}/role`, {
        role: apiRole,
      })
      .subscribe({
        next: () => {
          this.members = this.members.map((m) =>
            m.id === memberId ? { ...m, role: newRole as TeamMemberRole } : m,
          );
          this.memberRoleSelections[memberId] = newRole;
          this.snackBar.open('Role updated successfully.', 'Dismiss', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
        },
        error: (err) => {
          this.memberRoleSelections[memberId] = currentRole;
          this.snackBar.open(err?.error?.message ?? 'Failed to update role. Please try again.', 'Dismiss', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
      });
  }

  onOpenPermissionMatrix(): void {
    this.showPermissionMatrix = !this.showPermissionMatrix;
  }

  // ── Transfer ownership ─────────────────────────────────────────────────────
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
          if (res?.success === false) {
            this.transferVerifying = false;
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
          this.snackBar.open(err?.error?.message ?? 'Invalid OTP. Please try again.', 'Dismiss', {
            duration: 4000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
      });
  }

  private applyOwnershipTransfer(): void {
    const newSubmitterId = this.transferToMemberId;
    const demoteTo = this.entityType === 'state' ? 'STATE-EDITOR' : 'ULB-EDITOR';

    this.http
      .post<{ success: boolean; data?: { message?: string } }>(`${this.baseUrl}users/transfer-ownership`, {
        newOwnerId: newSubmitterId,
        demoteTo,
      })
      .subscribe({
        next: () => {
          this.transferVerifying = false;
          this.transferDialogRef?.close();
          const newSubmitter = this.members.find((m) => m.id === newSubmitterId);
          this.snackBar.open(
            `Ownership transferred to ${newSubmitter?.name ?? 'the selected member'}. You will be logged out now.`,
            'Dismiss',
            { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top', panelClass: ['snack-success'] },
          );
          setTimeout(() => {
            this.authService.logout().subscribe({
              complete: () => void this.router.navigate(['/auth/login/16thFC']),
            });
          }, 3000);
        },
        error: (err) => {
          this.transferVerifying = false;
          this.snackBar.open(err?.error?.message ?? 'Transfer failed. Please try again.', 'Dismiss', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
      });
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

  // ── Input sanitizers ──────────────────────────────────────────────────────
  sanitizeName(value: string): string {
    return value.replace(/[^a-zA-Zऀ-ॿ਀-੿\s'-]/g, '');
  }

  sanitizePhone(value: string): string {
    return value.replace(/\D/g, '').slice(0, 10);
  }

  sanitizeDesignation(value: string): string {
    return value.replace(/[^a-zA-Zऀ-ॿ਀-੿\s.,-]/g, '');
  }
}
