import { AccessLevel, Permission } from './permissions';

/**
 * Permissions for STATE users, keyed by accessLevel (derived from xviFcSubrole on the backend).
 * Mirrors backend XVIFC_STATE_PERMISSIONS.
 *
 * xviFcSubrole: admin    → accessLevel: ADMIN   (Submitter)
 * xviFcSubrole: reviewer → accessLevel: EDITOR  (Editor)
 * xviFcSubrole: viewer   → accessLevel: VIEWER  (Viewer)
 */
export const ACCESS_LEVEL_PERMISSIONS: Record<AccessLevel, Permission[]> = {
  ADMIN: [
    Permission.VIEW_STATUS_REPORTS,
    Permission.VIEW_DASHBOARDS,
    Permission.UPLOAD_STATE_LEVEL_DOCUMENTS,
    Permission.REVIEW_ULB_SUBMISSIONS,
    Permission.MESSAGE_USERS,
    Permission.APPROVE_ULB_SUBMISSIONS,
    Permission.PREPARE_GRANT_LETTERS,
    Permission.RECOMMEND_EXEMPTIONS,
    Permission.FINAL_SUBMIT_TO_MOHUA,
    Permission.VIEW_STATE_FORMS,
    Permission.EDIT_STATE_FORMS,
    Permission.FINAL_SUBMIT_STATE_FORMS,
    Permission.MANAGE_USERS,
    Permission.VIEW_MANAGED_USERS,
    Permission.CREATE_MANAGED_USER,
    Permission.UPDATE_MANAGED_USER,
    Permission.DELETE_MANAGED_USER,
  ],
  EDITOR: [
    Permission.VIEW_STATUS_REPORTS,
    Permission.VIEW_DASHBOARDS,
    Permission.UPLOAD_STATE_LEVEL_DOCUMENTS,
    Permission.REVIEW_ULB_SUBMISSIONS,
    Permission.MESSAGE_USERS,
    Permission.APPROVE_ULB_SUBMISSIONS,
    Permission.PREPARE_GRANT_LETTERS,
    Permission.RECOMMEND_EXEMPTIONS,
    Permission.VIEW_STATE_FORMS,
    Permission.EDIT_STATE_FORMS,
    Permission.VIEW_MANAGED_USERS,
  ],
  VIEWER: [
    Permission.VIEW_STATUS_REPORTS,
    Permission.VIEW_DASHBOARDS,
    Permission.VIEW_STATE_FORMS,
    Permission.VIEW_MANAGED_USERS,
  ],
};

/**
 * Permissions for MoHUA users, keyed by accessLevel.
 * Mirrors backend XVIFC_MOHUA_PERMISSIONS.
 *
 * Submitter (ADMIN)  — full MoHUA access including final submit to DoE and team management
 * Editor   (EDITOR)  — review, reminders, information requests
 * Viewer   (VIEWER)  — read-only
 */
export const MOHUA_ACCESS_LEVEL_PERMISSIONS: Record<AccessLevel, Permission[]> = {
  ADMIN: [
    Permission.VIEW_STATUS_REPORTS,
    Permission.VIEW_DASHBOARDS,
    Permission.REVIEW_STATE_SUBMISSIONS,
    Permission.SEND_REMINDERS_TO_STATES,
    Permission.REQUEST_INFO_FROM_STATES,
    Permission.APPROVE_STATE_SUBMISSIONS,
    Permission.ISSUE_OFFICE_MEMORANDUM,
    Permission.FINAL_SUBMIT_TO_DOE,
    Permission.MANAGE_USERS,
    Permission.VIEW_MANAGED_USERS,
    Permission.CREATE_MANAGED_USER,
    Permission.UPDATE_MANAGED_USER,
    Permission.DELETE_MANAGED_USER,
  ],
  EDITOR: [
    Permission.VIEW_STATUS_REPORTS,
    Permission.VIEW_DASHBOARDS,
    Permission.REVIEW_STATE_SUBMISSIONS,
    Permission.SEND_REMINDERS_TO_STATES,
    Permission.REQUEST_INFO_FROM_STATES,
  ],
  VIEWER: [
    Permission.VIEW_STATUS_REPORTS,
    Permission.VIEW_DASHBOARDS,
  ],
};
