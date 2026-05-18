import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

type TeamMemberRole = 'Submitter' | 'Editor' | 'Viewer' | null;
type TeamMemberStatus = 'active' | 'invited';

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
  action: 'disable' | 'resend' | null;
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

@Component({
  selector: 'app-roles-teams-overview',
  standalone: true,
  imports: [
    CommonModule,
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

  private readonly dialog = inject(MatDialog);
  private addMemberDialogRef?: MatDialogRef<unknown>;

  profile: UlbTeamProfile | null = null;
  members: TeamMember[] = [];
  isLoading = true;
  errorMessage = '';
  showPermissionMatrix = false;

  readonly memberColumns = ['member', 'designation', 'role', 'status', 'lastActive', 'action'];
  readonly permissionColumns = ['permission', 'submitter', 'editor', 'viewer'];
  readonly availableRoles: Exclude<TeamMemberRole, 'Submitter' | null>[] = ['Editor', 'Viewer'];
  readonly inviteRoles = [
    { value: 'Editor', label: 'Editor - prepares, uploads and verifies documents' },
    { value: 'Viewer', label: 'Viewer - can view status and reports' },
  ];
  readonly permissionMatrix: PermissionMatrixRow[] = [
    {
      permission: 'View status and reports',
      submitter: true,
      editor: true,
      viewer: true,
    },
    {
      permission: 'Upload documents',
      submitter: true,
      editor: true,
      viewer: false,
    },
    {
      permission: 'Message users',
      submitter: true,
      editor: true,
      viewer: false,
    },
    {
      permission: 'Final submit to State DMA',
      submitter: true,
      editor: false,
      viewer: false,
    },
    {
      permission: 'Manage users',
      submitter: true,
      editor: false,
      viewer: false,
    },
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
    } catch (error) {
      console.error('Failed to load roles and teams overview', error);
      this.errorMessage = 'Unable to load people and roles right now.';
    } finally {
      this.isLoading = false;
    }
  }

  updateMemberRole(memberId: number, role: string): void {
    if (!this.isAssignableRole(role)) {
      return;
    }

    this.members = this.members.map((member) =>
      member.id === memberId ? { ...member, role } : member,
    );
  }

  onOpenPermissionMatrix(): void {
    this.showPermissionMatrix = !this.showPermissionMatrix;
  }

  onAddMember(): void {
    if (!this.addMemberDialog) {
      return;
    }

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

  onMemberAction(member: TeamMember): void {
    console.log(`${member.action ?? 'view'} member`, member);
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
          action: null,
        },
        {
          id: 2,
          initials: 'PN',
          name: 'Priya Nair',
          phone: '+91 98765 43211',
          designation: 'Accounts Officer',
          role: 'Editor',
          status: 'active',
          lastActive: 'Mar 9, 2026',
          action: 'disable',
        },
        {
          id: 3,
          initials: 'SB',
          name: 'Suresh Babu',
          phone: '+91 98765 43214',
          designation: 'Junior Engineer',
          role: 'Viewer',
          status: 'active',
          lastActive: 'Feb 10, 2026',
          action: 'disable',
        },
        {
          id: 4,
          initials: 'KR',
          name: 'Kavita Reddy',
          phone: '+91 98765 43215',
          designation: 'Finance Assistant',
          role: null,
          status: 'invited',
          lastActive: null,
          action: 'resend',
        },
      ],
    });
  }

}
