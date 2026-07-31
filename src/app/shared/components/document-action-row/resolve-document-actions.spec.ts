import { resolveDocumentActions } from './resolve-document-actions';
import { ActionGate, DocumentRuntimeState } from './document-action-row.types';

const baseDoc = (overrides: Partial<DocumentRuntimeState> = {}): DocumentRuntimeState => ({
  docKey: 'auditors-report',
  required: true,
  hasFile: false,
  processingStatus: 'NOT_STARTED',
  latestDecision: null,
  ...overrides,
});

const ULB_GATES: ActionGate[] = [
  { docKey: null, scope: 'document', role: 'ULB', action: 'upload', statusIds: [1, 2, 4, 6] },
  { docKey: null, scope: 'document', role: 'ULB', action: 'reupload', statusIds: [1, 2, 4, 6] },
  { docKey: null, scope: 'document', role: 'ULB', action: 'retry', statusIds: [1, 2, 4, 6] },
  { docKey: null, scope: 'document', role: 'ULB', action: 'delete', statusIds: [1, 2, 4, 6] },
];

const STATE_GATES: ActionGate[] = [
  { docKey: null, scope: 'document', role: 'STATE', action: 'approve', statusIds: [3] },
  { docKey: null, scope: 'document', role: 'STATE', action: 'return', statusIds: [3] },
  { docKey: null, scope: 'document', role: 'STATE', action: 'undo', statusIds: [3] },
];

describe('resolveDocumentActions', () => {
  it('ULB still gets normal actions for an optional document — "optional" only exempts it from submission gating', () => {
    const doc = baseDoc({ required: false, hasFile: false });
    const result = resolveDocumentActions('ULB', 2, ULB_GATES, doc);
    expect(result).toEqual([{ action: 'upload', label: 'Upload', icon: 'bi-upload', disabled: false }]);
  });

  it('STATE never gets an action for an optional document — no review needed, the Optional badge is enough', () => {
    const doc = baseDoc({ required: false, hasFile: true, processingStatus: 'PASSED' });
    expect(resolveDocumentActions('STATE', 3, STATE_GATES, doc)).toEqual([]);
  });

  it('returns no actions for MOHUA, ever', () => {
    const doc = baseDoc({ hasFile: true, processingStatus: 'PASSED' });
    expect(resolveDocumentActions('MOHUA', 5, [], doc)).toEqual([]);
  });

  describe('ULB', () => {
    it('shows Upload when there is no file yet and the gate allows it', () => {
      const result = resolveDocumentActions('ULB', 2, ULB_GATES, baseDoc({ hasFile: false }));
      expect(result).toEqual([{ action: 'upload', label: 'Upload', icon: 'bi-upload', disabled: false }]);
    });

    it('shows nothing when there is no file but the gate does not allow this status', () => {
      const result = resolveDocumentActions('ULB', 3, ULB_GATES, baseDoc({ hasFile: false }));
      expect(result).toEqual([]);
    });

    it('shows nothing while OCR is still processing', () => {
      const result = resolveDocumentActions(
        'ULB',
        2,
        ULB_GATES,
        baseDoc({ hasFile: true, processingStatus: 'PROCESSING' }),
      );
      expect(result).toEqual([]);
    });

    it('shows Retry + Re-upload when OCR failed', () => {
      const result = resolveDocumentActions('ULB', 2, ULB_GATES, baseDoc({ hasFile: true, processingStatus: 'FAILED' }));
      expect(result.map((a) => a.action)).toEqual(['retry', 'reupload']);
      expect(result.every((a) => !a.disabled)).toBe(true);
    });

    it('shows nothing once a document is APPROVED — locked', () => {
      const result = resolveDocumentActions(
        'ULB',
        4,
        ULB_GATES,
        baseDoc({ hasFile: true, processingStatus: 'PASSED', latestDecision: { status: 'APPROVED' } }),
      );
      expect(result).toEqual([]);
    });

    it('shows Re-upload only when a passed document was RETURNED', () => {
      const result = resolveDocumentActions(
        'ULB',
        4,
        ULB_GATES,
        baseDoc({ hasFile: true, processingStatus: 'PASSED', latestDecision: { status: 'RETURNED' } }),
      );
      expect(result).toEqual([{ action: 'reupload', label: 'Re-upload', icon: 'bi-upload', disabled: false }]);
    });

    it('shows Delete only for a passed, undecided document', () => {
      const result = resolveDocumentActions('ULB', 2, ULB_GATES, baseDoc({ hasFile: true, processingStatus: 'PASSED' }));
      expect(result).toEqual([{ action: 'delete', label: 'Delete', icon: 'bi-trash', disabled: false }]);
    });
  });

  describe('STATE', () => {
    it('shows Approve + Return, enabled, once a document has passed OCR', () => {
      const result = resolveDocumentActions('STATE', 3, STATE_GATES, baseDoc({ hasFile: true, processingStatus: 'PASSED' }));
      expect(result.map((a) => a.action)).toEqual(['approve', 'return']);
      expect(result.every((a) => !a.disabled)).toBe(true);
    });

    it('shows Approve + Return, disabled, before OCR has passed', () => {
      const result = resolveDocumentActions(
        'STATE',
        3,
        STATE_GATES,
        baseDoc({ hasFile: true, processingStatus: 'PROCESSING' }),
      );
      expect(result.map((a) => a.action)).toEqual(['approve', 'return']);
      expect(result.every((a) => a.disabled)).toBe(true);
    });

    it('shows Undo once a document has been APPROVED', () => {
      const result = resolveDocumentActions(
        'STATE',
        3,
        STATE_GATES,
        baseDoc({ hasFile: true, processingStatus: 'PASSED', latestDecision: { status: 'APPROVED' } }),
      );
      expect(result).toEqual([{ action: 'undo', label: 'Undo', icon: 'bi-arrow-counterclockwise', disabled: false }]);
    });

    it('shows Undo once a document has been RETURNED', () => {
      const result = resolveDocumentActions(
        'STATE',
        3,
        STATE_GATES,
        baseDoc({ hasFile: true, processingStatus: 'PASSED', latestDecision: { status: 'RETURNED' } }),
      );
      expect(result).toEqual([{ action: 'undo', label: 'Undo', icon: 'bi-arrow-counterclockwise', disabled: false }]);
    });

    it('shows nothing outside the gated status, even for an undecided passed document', () => {
      const result = resolveDocumentActions('STATE', 5, STATE_GATES, baseDoc({ hasFile: true, processingStatus: 'PASSED' }));
      expect(result).toEqual([]);
    });
  });

  describe('gate scoping', () => {
    it('ignores section-scoped gates when resolving document-row actions', () => {
      const sectionOnlyGates: ActionGate[] = [
        { docKey: null, scope: 'section', role: 'ULB', action: 'upload', statusIds: [1, 2, 4, 6] },
      ];
      const result = resolveDocumentActions('ULB', 2, sectionOnlyGates, baseDoc({ hasFile: false }));
      expect(result).toEqual([]);
    });

    it('honors a docKey-specific gate row and ignores it for other documents', () => {
      const scopedGates: ActionGate[] = [
        { docKey: 'auditors-report', scope: 'document', role: 'ULB', action: 'upload', statusIds: [1, 2, 4, 6] },
      ];
      const matching = resolveDocumentActions('ULB', 2, scopedGates, baseDoc({ docKey: 'auditors-report', hasFile: false }));
      const other = resolveDocumentActions('ULB', 2, scopedGates, baseDoc({ docKey: 'balance-sheet', hasFile: false }));
      expect(matching.length).toBe(1);
      expect(other).toEqual([]);
    });
  });
});
