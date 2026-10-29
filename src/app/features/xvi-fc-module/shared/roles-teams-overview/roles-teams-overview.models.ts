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

/** Everything that differs between the STATE, MoHUA, PMU and DoE "Team & Roles" pages — supplied per
 *  route via route `data.rolesConfig`, so the same component/template serves all of them. */
export interface RolesTeamsConfig {
  membersListPath: string;
  permissionMatrixPath: string;
  invitePath: string;
  /** Prefixed to `/{memberId}/sub-role` and `/{memberId}` for the role-change and delete calls. */
  memberActionBasePath: string;
  transferSubmitterPath: string;
  /** Fallback subRole when the stored user has none yet. */
  defaultSubRole: SubRole;
  /** "How access works" banner copy; omit to hide the banner for that role. */
  infoBannerText?: string;
  emailPlaceholder: string;
  pageSubtitle: string;
  tableAriaLabel: string;
  /** Heading above the editable team table — only set when other teams are listed beside it. */
  teamTitle?: string;
  /** Other teams listed read-only below the editable one (no add/edit/remove). */
  readOnlyTeams?: { title: string; membersListPath: string }[];
  /** Shows the Transfer Admin card. Off by default — it stays hidden for the State/MoHUA/PMU/DoE pages. */
  transferEnabled?: boolean;
  /** ADC Teams page (State admin): shows an ADC dropdown first and sends the pick as `?adcId=` on every call. */
  adcSelector?: boolean;
  /** Default true: the caller is a team member who is demoted by the transfer. False when the caller manages the
   *  team from outside it (State admin transferring an ADC's Admin role), so their own role never changes. */
  transferDemotesSelf?: boolean;
  /** State People and Roles: shows an "ADC Teams" button beside Add Member when the state has an active ADC. */
  adcTeamsLink?: boolean;
}

export interface ReadOnlyTeam {
  title: string;
  members: TeamMember[];
  status: 'loading' | 'ready' | 'error';
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
  adcTeamsLink: true,
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
  teamTitle: 'MoHUA team',
  readOnlyTeams: [{ title: 'PMU team', membersListPath: 'users/pmu-members' }],
};

export const PMU_ROLES_CONFIG: RolesTeamsConfig = {
  membersListPath: 'users/pmu-members',
  permissionMatrixPath: 'users/pmu-permission-matrix',
  invitePath: 'users/invite-pmu-member',
  memberActionBasePath: 'users/pmu-members',
  transferSubmitterPath: 'users/pmu-members/transfer-submitter',
  defaultSubRole: 'VIEWER',
  infoBannerText:
    'PMU staff with existing access can sign in directly using their registered email ID and password. ' +
    'To give access to a new team member, use <strong>Add Member</strong> below — ' +
    'they will receive an email invitation to set up their login.',
  emailPlaceholder: 'name@organisation.in',
  pageSubtitle: 'Manage who has access to the PMU XVI FC workspace.',
  tableAriaLabel: 'PMU team members',
  teamTitle: 'PMU team',
  readOnlyTeams: [{ title: 'MoHUA team', membersListPath: 'users/mohua-members' }],
};

export const DOE_ROLES_CONFIG: RolesTeamsConfig = {
  membersListPath: 'users/doe-members',
  permissionMatrixPath: 'users/doe-permission-matrix',
  invitePath: 'users/invite-doe-member',
  memberActionBasePath: 'users/doe-members',
  transferSubmitterPath: 'users/doe-members/transfer-submitter',
  defaultSubRole: 'VIEWER',
  emailPlaceholder: 'official@expenditure.gov.in',
  pageSubtitle: 'Manage who has access to the DoE XVI FC workspace.',
  tableAriaLabel: 'DoE team members',
};

/** An ADC admin managing their own ADC's team (People and Roles). The first member invited to an ADC becomes its Admin. */
export const ADC_ROLES_CONFIG: RolesTeamsConfig = {
  membersListPath: 'users/adc-members',
  permissionMatrixPath: 'users/adc-permission-matrix',
  invitePath: 'users/invite-adc-member',
  memberActionBasePath: 'users/adc-members',
  transferSubmitterPath: 'users/adc-members/transfer-submitter',
  defaultSubRole: 'VIEWER',
  emailPlaceholder: 'official@adc.gov.in',
  pageSubtitle: "Manage who has access to your ADC's XVI FC workspace.",
  tableAriaLabel: 'ADC team members',
  transferEnabled: true,
};

/** State admin's "ADC Teams" page: the same team management, for whichever ADC is picked from the dropdown. */
export const STATE_ADC_TEAMS_CONFIG: RolesTeamsConfig = {
  ...ADC_ROLES_CONFIG,
  defaultSubRole: 'VIEWER',
  infoBannerText:
    'The first member you add to an ADC becomes its <strong>Admin</strong>; later members join as Reviewer or Viewer. ' +
    'Each ADC has exactly one Admin, and you can hand that role to another member using <strong>Transfer</strong>.',
  pageSubtitle: "Manage who has access to each Autonomous District Council's XVI FC workspace.",
  tableAriaLabel: 'ADC team members',
  adcSelector: true,
  transferDemotesSelf: false,
};
