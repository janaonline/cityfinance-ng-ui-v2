import {
  ActionGate,
  DocumentAction,
  DocumentActionRole,
  DocumentRuntimeState,
  ResolvedDocumentAction,
} from './document-action-row.types';

const ACTION_META: Record<'upload' | 'reupload' | 'retry' | 'delete' | 'approve' | 'return' | 'undo', { label: string; icon: string }> = {
  upload: { label: 'Upload', icon: 'bi-upload' },
  reupload: { label: 'Re-upload', icon: 'bi-upload' },
  retry: { label: 'Retry Verification', icon: 'bi-arrow-repeat' },
  delete: { label: 'Delete', icon: 'bi-trash' },
  approve: { label: 'Approve', icon: 'bi-check-lg' },
  return: { label: 'Return', icon: 'bi-x-lg' },
  undo: { label: 'Undo', icon: 'bi-arrow-counterclockwise' },
};

function isGated(
  gates: readonly ActionGate[],
  role: DocumentActionRole,
  action: DocumentAction,
  docKey: string,
  sectionStatusId: number,
): boolean {
  return gates.some(
    (g) =>
      g.scope === 'document' &&
      g.role === role &&
      g.action === action &&
      (g.docKey === null || g.docKey === docKey) &&
      g.statusIds.includes(sectionStatusId),
  );
}

function build(action: keyof typeof ACTION_META, disabled: boolean): ResolvedDocumentAction {
  const meta = ACTION_META[action];
  return { action, label: meta.label, icon: meta.icon, disabled };
}

/**
 * Resolves which document-row action button(s) to show for one document, combining two
 * independent inputs:
 * - the Mongo-driven gate: may this role even attempt this action while the section is in
 *   this status (XviFcDocumentActionGate — a UI-visibility hint, never an authorization check)
 * - the document's own runtime state: does it have a file, what did OCR say, has STATE
 *   already decided on it
 *
 * Which exact label/icon/enablement applies within an allowed action is fixed logic — the
 * same for every document, forever, deliberately not configurable (see the gate schema for why).
 */
export function resolveDocumentActions(
  role: DocumentActionRole,
  sectionStatusId: number,
  gates: readonly ActionGate[],
  doc: DocumentRuntimeState,
): ResolvedDocumentAction[] {
  const gated = (action: DocumentAction) => isGated(gates, role, action, doc.docKey, sectionStatusId);

  if (role === 'ULB') {
    if (!doc.hasFile) {
      return gated('upload') ? [build('upload', false)] : [];
    }
    if (doc.processingStatus === 'PROCESSING') {
      if (!doc.isStale) return [];
      if (doc.isAwaitingManualReview) return [];
      return (['retry', 'reupload'] as const).filter(gated).map((a) => build(a, false));
    }
    if (doc.processingStatus === 'FAILED') {
      // A manual-review request is pending ADMIN's decision — retrying or re-uploading now would
      // change the file out from under them (or silently cancel the request), so hide both.
      if (doc.isAwaitingManualReview) return [];
      // Once ADMIN has declined a manual-review request, retrying OCR on the same file would
      // just fail the same way again — only Re-upload makes sense at that point.
      const availableActions = doc.manualReviewReturned === true ? (['reupload'] as const) : (['retry', 'reupload'] as const);
      return availableActions.filter(gated).map((a) => build(a, false));
    }
    if (doc.processingStatus === 'PASSED') {
      if (doc.latestDecision?.status === 'APPROVED') return [];
      if (doc.latestDecision?.status === 'RETURNED') {
        return gated('reupload') ? [build('reupload', false)] : [];
      }
      return gated('delete') ? [build('delete', false)] : [];
    }
    return [];
  }

  if (role === 'STATE') {
    // Optional documents don't need a STATE decision at all — the Optional badge is enough.
    if (doc.required === false) return [];
    if (doc.latestDecision) {
      return gated('undo') ? [build('undo', false)] : [];
    }
    const disabled = doc.processingStatus !== 'PASSED';
    return (['approve', 'return'] as const).filter(gated).map((a) => build(a, disabled));
  }

  return []; // MOHUA never gets a document-row action
}
