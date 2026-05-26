import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

type TeamMemberRole = 'Submitter' | 'Editor' | 'Viewer' | null;
type TeamMemberStatus = 'active' | 'inactive' | 'invited';

interface UlbTeamProfile {
  initials: string;
  name: string;
  code: string;
  category: string;
  state: string;
}

interface TeamMember {
  id: number;
  initials: string;
  name: string;
  phone: string;
  designation: string;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  lastActive: string | null;
}

interface RolesTeamOverviewResponse {
  profile: UlbTeamProfile;
  members: TeamMember[];
}

interface PermissionMatrixRow {
  permission: string;
  submitter: boolean;
  editor: boolean;
  viewer: boolean;
}

interface PendingRoleChange {
  memberId: number;
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
    MatTableModule,
  ],
  templateUrl: './roles-teams-overview.component.html',
  styleUrl: './roles-teams-overview.component.scss',
})
export class RolesTeamsOverviewComponent implements OnInit {
  @ViewChild('addMemberDialog') private addMemberDialog?: TemplateRef<unknown>;
  @ViewChild('activateDialog') private activateDialog?: TemplateRef<unknown>;
  @ViewChild('roleConfirmDialog') private roleConfirmDialog?: TemplateRef<unknown>;

  private readonly dialog = inject(MatDialog);
  private addMemberDialogRef?: MatDialogRef<unknown>;
  private activateDialogRef?: MatDialogRef<unknown>;
  private roleConfirmDialogRef?: MatDialogRef<unknown>;

  profile: UlbTeamProfile | null = null;
  members: TeamMember[] = [];
  isLoading = true;
  errorMessage = '';
  showPermissionMatrix = false;

  // Role change confirmation state
  memberRoleSelections: Record<number, string> = {};
  pendingRoleChange: PendingRoleChange | null = null;

  // Activate flow state
  activatingMember: TeamMember | null = null;
  activateMobile = '';
  activateOtpSent = false;
  activateOtp = '';
  sendingOtp = false;
  confirmingActivate = false;

  readonly memberColumns = ['member', 'designation', 'role', 'status', 'action'];
  readonly permissionColumns = ['permission', 'submitter', 'editor', 'viewer'];
  readonly availableRoles: Exclude<TeamMemberRole, 'Submitter' | null>[] = ['Editor', 'Viewer'];
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
    void this.loadRolesTeamsOverview();
  }

  async loadRolesTeamsOverview(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      const response = await this.getRolesTeamsOverviewFromDummyApi();
      this.profile = response.profile;
      this.members = response.members;
      this.memberRoleSelections = Object.fromEntries(
        response.members
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

  // ── Role change ──────────────────────────────────────────────────────────
  onRoleChangeRequest(memberId: number, newRole: string): void {
    const member = this.members.find((m) => m.id === memberId);
    if (!member || !member.role || !this.isAssignableRole(newRole)) return;
    if (newRole === member.role) return; // no change or revert — skip

    this.memberRoleSelections[memberId] = newRole;
    this.pendingRoleChange = {
      memberId,
      newRole,
      currentRole: member.role,
      memberName: member.name,
    };

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
      // Revert the displayed value in the dropdown
      this.memberRoleSelections[this.pendingRoleChange.memberId] = this.pendingRoleChange.currentRole;
    }
    this.pendingRoleChange = null;
    this.roleConfirmDialogRef?.close();
  }

  // ── Activate flow ────────────────────────────────────────────────────────
  onActivate(member: TeamMember): void {
    this.activatingMember = { ...member };
    this.activateMobile = member.phone.replace(/\D/g, '').slice(-10);
    this.activateOtpSent = false;
    this.activateOtp = '';
    this.sendingOtp = false;
    this.confirmingActivate = false;

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

  onSendActivateOtp(): void {
    if (this.sendingOtp) return;
    this.sendingOtp = true;
    setTimeout(() => {
      this.activateOtpSent = true;
      this.sendingOtp = false;
    }, 1000);
  }

  onConfirmActivate(): void {
    if (!this.activatingMember || this.confirmingActivate) return;
    this.confirmingActivate = true;
    setTimeout(() => {
      this.members = this.members.map((m) =>
        m.id === this.activatingMember!.id ? { ...m, status: 'active' as TeamMemberStatus } : m,
      );
      this.confirmingActivate = false;
      this.onCloseActivateDialog();
    }, 1000);
  }

  // ── Other member actions ─────────────────────────────────────────────────
  onDisable(member: TeamMember): void {
    console.log('Disable member', member);
  }

  onResend(member: TeamMember): void {
    console.log('Resend invite to', member);
  }

  onOpenPermissionMatrix(): void {
    this.showPermissionMatrix = !this.showPermissionMatrix;
  }

  onAddMember(): void {
    if (!this.addMemberDialog) return;
    this.addMemberDialogRef = this.dialog.open(this.addMemberDialog, {
      autoFocus: 'first-tabbable',
      maxHeight: 'calc(100vh - 48px)',
      panelClass: 'roles-dialog-panel',
      width: 'min(440px, calc(100vw - 32px))',
    });
  }

  onCloseAddMemberDialog(): void {
    this.addMemberDialogRef?.close();
  }

  onSendInvite(): void {
    console.log('Send member invite');
    this.onCloseAddMemberDialog();
  }

  onTransferOwnership(): void {
    console.log('Transfer submitter ownership');
  }

  private isAssignableRole(role: string): role is Exclude<TeamMemberRole, 'Submitter' | null> {
    return role === 'Editor' || role === 'Viewer';
  }

  private getRolesTeamsOverviewFromDummyApi(): Promise<RolesTeamOverviewResponse> {
    return Promise.resolve({
      profile: {
        initials: 'GVMC',
        name: 'Greater Visakhapatnam Municipal Corporation',
        code: 'AP067',
        category: 'Municipal Corporation',
        state: 'Andhra Pradesh',
      },
      members: [
        {
          id: 1,
          initials: 'RK',
          name: 'Ravi Kumar',
          phone: '+91 98765 43210',
          designation: 'Municipal Commissioner',
          role: 'Submitter',
          status: 'active',
          lastActive: 'Mar 12, 2026',
        },
        {
          id: 2,
          initials: 'PN',
          name: 'Priya Nair',
          phone: '+91 98765 43211',
          designation: 'Accounts Officer',
          role: 'Editor',
          status: 'inactive',
          lastActive: 'Mar 9, 2026',
        },
      ],
    });
  }
}
