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
}

export interface ResolvedDocumentAction {
  action: DocumentAction;
  label: string;
  icon: string;
  disabled: boolean;
}
