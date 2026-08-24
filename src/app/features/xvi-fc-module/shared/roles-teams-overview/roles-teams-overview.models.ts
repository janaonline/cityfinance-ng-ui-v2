export type SubRole = 'SUBMITTER' | 'EDITOR' | 'VIEWER';

export const SUBROLE_LABEL: Record<SubRole, string> = {
  SUBMITTER: 'Admin',
  EDITOR: 'Reviewer',
  VIEWER: 'Viewer',
};

export interface TeamMember {
  _id: string;
  name: string;
  mobile: string;
  designation: string;
  subRole: SubRole;
  isActive: boolean;
  isXVIFCProfileVerified: boolean;
  lastActive: string | null;
  email?: string;
}

/** Everything that differs between the STATE and MoHUA "Team & Roles" pages — supplied per
 *  route via route `data.rolesConfig`, so the same component/template serves both. */
export interface RolesTeamsConfig {
  membersListPath: string;
  permissionMatrixPath: string;
  invitePath: string;
  /** Prefixed to `/{memberId}/sub-role` and `/{memberId}` for the role-change and delete calls. */
  memberActionBasePath: string;
  transferSubmitterPath: string;
  /** Fallback subRole when the stored user has none yet. */
  defaultSubRole: SubRole;
  infoBannerText: string;
  emailPlaceholder: string;
  pageSubtitle: string;
  tableAriaLabel: string;
}

export const STATE_ROLES_CONFIG: RolesTeamsConfig = {
  membersListPath: 'users/state-members',
  permissionMatrixPath: 'users/permission-matrix',
  invitePath: 'users/invite-state-member',
  memberActionBasePath: 'users',
  transferSubmitterPath: 'users/transfer-submitter',
  defaultSubRole: 'SUBMITTER',
  infoBannerText:
    'Staff whose details are on record from the 15th Finance Commission can sign in directly ' +
    'using their registered email ID and password. To give access to someone new, use ' +
    '<strong>Add Member</strong> below - they will receive an email invitation to set up their login.',
  emailPlaceholder: 'official@state.gov.in',
  pageSubtitle: 'Manage who has access and what they can do.',
  tableAriaLabel: 'State team members',
};

export const MOHUA_ROLES_CONFIG: RolesTeamsConfig = {
  membersListPath: 'users/mohua-members',
  permissionMatrixPath: 'users/mohua-permission-matrix',
  invitePath: 'users/invite-mohua-member',
  memberActionBasePath: 'users/mohua-members',
  transferSubmitterPath: 'users/mohua-members/transfer-submitter',
  defaultSubRole: 'VIEWER',
  infoBannerText:
    'MoHUA staff with existing access can sign in directly using their registered email ID and password. ' +
    'To give access to a new team member, use <strong>Add Member</strong> below — ' +
    'they will receive an email invitation to set up their login.',
  emailPlaceholder: 'official@mohua.gov.in',
  pageSubtitle: 'Manage who has access to the MoHUA XVI FC workspace.',
  tableAriaLabel: 'MoHUA team members',
};
