import { Permission } from './permissions';

/**
 * Frontend role → permission matrix.
 *
 * Must stay in sync with the backend ROLE_PERMISSIONS map
 * (src/module/auth/permissions.map.ts). The frontend uses this for UI
 * decisions (show/hide buttons, route guards). The backend enforces the
 * same rules on every API call — this is a UX convenience layer, not the
 * security boundary.
 *
 * DELETE_DOCUMENTS is frontend-only (no backend equivalent) — used by the
 * Annual Accounts UI to control the delete-document button.
 */
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  ADMIN: [
    Permission.VIEW_STATUS_REPORTS,
    Permission.VIEW_DASHBOARDS,
    Permission.UPLOAD_DOCUMENTS,
    Permission.UPLOAD_STATE_LEVEL_DOCUMENTS,
    Permission.REVIEW_ULB_SUBMISSIONS,
    Permission.MESSAGE_USERS,
    Permission.APPROVE_ULB_SUBMISSIONS,
    Permission.PREPARE_GRANT_LETTERS,
    Permission.RECOMMEND_EXEMPTIONS,
    Permission.FINAL_SUBMIT_TO_STATE_DMA,
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

  // ── ULB Submitter ─────────────────────────────────────────────────────────
  ULB: [
    Permission.VIEW_STATUS_REPORTS,
    Permission.UPLOAD_DOCUMENTS,
    Permission.DELETE_DOCUMENTS,
    Permission.MESSAGE_USERS,
    Permission.FINAL_SUBMIT_TO_STATE_DMA,
    Permission.MANAGE_USERS,
    Permission.VIEW_MANAGED_USERS,
    Permission.CREATE_MANAGED_USER,
    Permission.UPDATE_MANAGED_USER,
    Permission.DELETE_MANAGED_USER,
  ],

  // ── ULB Editor ────────────────────────────────────────────────────────────
  'ULB-EDITOR': [
    Permission.VIEW_STATUS_REPORTS,
    Permission.UPLOAD_DOCUMENTS,
    Permission.DELETE_DOCUMENTS,
    Permission.MESSAGE_USERS,
    Permission.VIEW_MANAGED_USERS,
  ],

  // ── ULB Viewer ────────────────────────────────────────────────────────────
  'ULB-VIEWER': [
    Permission.VIEW_STATUS_REPORTS,
    Permission.VIEW_MANAGED_USERS,
  ],

  // ── STATE Submitter ───────────────────────────────────────────────────────
  STATE: [
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

  // ── STATE Editor ──────────────────────────────────────────────────────────
  'STATE-EDITOR': [
    Permission.VIEW_STATUS_REPORTS,
    Permission.VIEW_DASHBOARDS,
    Permission.UPLOAD_STATE_LEVEL_DOCUMENTS,
    Permission.REVIEW_ULB_SUBMISSIONS,
    Permission.MESSAGE_USERS,
    Permission.VIEW_STATE_FORMS,
    Permission.EDIT_STATE_FORMS,
    Permission.VIEW_MANAGED_USERS,
  ],

  // ── STATE Viewer ──────────────────────────────────────────────────────────
  'STATE-VIEWER': [
    Permission.VIEW_STATUS_REPORTS,
    Permission.VIEW_DASHBOARDS,
    Permission.VIEW_STATE_FORMS,
    Permission.VIEW_MANAGED_USERS,
  ],
};
