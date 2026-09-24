export type DocumentActionRole = 'ULB' | 'STATE' | 'MOHUA';
export type DocumentActionScope = 'document' | 'section';

export type DocumentAction =
  | 'upload'
  | 'reupload'
  | 'retry'
  | 'delete'
  | 'approve'
  | 'return'
  | 'undo'
  | 'approveSection'
  | 'returnSection'
  | 'undoSection';

/** Mirrors the backend's XviFcDocumentActionGate — a UI-visibility hint only, never an
 *  authorization check. Fetched once per page (folded into getUploadConfig's response). */
export interface ActionGate {
  docKey: string | null;
  scope: DocumentActionScope;
  role: DocumentActionRole;
  action: DocumentAction;
  statusIds: number[];
}

export type DocumentProcessingStatus = 'NOT_STARTED' | 'PROCESSING' | 'PASSED' | 'FAILED';

/** The document's own runtime facts — drives which specific button/label/enablement shows,
 *  independent of the gate (which only decides whether the role may attempt anything at all). */
export interface DocumentRuntimeState {
  docKey: string;
  /** false = optional document; exempt from submission gating and from STATE review, but ULB can still upload/manage it. */
  required: boolean;
  hasFile: boolean;
  processingStatus: DocumentProcessingStatus;
  latestDecision: { status: 'APPROVED' | 'RETURNED' } | null;
  /** True once a PROCESSING document has been stuck long enough to offer Retry/Re-upload instead of just spinning. */
  isStale: boolean;
  /** True once ADMIN has rejected a ULB's manual-review request for this failed document — re-running
   *  OCR on the same file would fail the same way, so Retry is hidden until a fresh file is uploaded. */
  manualReviewReturned?: boolean;
  /** True while a manual-review request is outstanding and ADMIN hasn't decided yet — mirrors the
   *  backend's isAwaitingManualReviewDecision guard. Retry/Re-upload are hidden so the file ADMIN
   *  is reviewing can't change out from under them. */
  isAwaitingManualReview?: boolean;
  /** True once this document has failed enough times (a retry, or a re-upload) to offer "Request
   *  Manual Review" — mirrors the same retryValidationCount>1 || version>1 threshold the button
   *  itself is shown under. While true and no request has been made yet, Retry/Re-upload are
   *  hidden too, so Request Manual Review is the only path forward rather than one option among
   *  several. */
  isEligibleForManualReview?: boolean;
  /** True once the ULB has used all 3 self-service re-upload attempts since the last manual-review
   *  rejection. Re-upload hides at this point — Request Manual Review (rendered separately) becomes
   *  the only path forward again, so self-service is exhausted without ever cutting off the human
   *  escalation path entirely. */
  manualReviewAttemptsExhausted?: boolean;
  /** True while this document is in its post-rejection cooldown (set after a *second* manual-review
   *  rejection, not merely after 3 unassisted OCR failures) — everything is hidden until the
   *  cooldown passes, mirroring the backend's isUploadBlocked guard. */
  isUploadBlocked?: boolean;
}

export interface ResolvedDocumentAction {
  action: DocumentAction;
  label: string;
  icon: string;
  disabled: boolean;
}
