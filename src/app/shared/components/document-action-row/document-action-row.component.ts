import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  ActionGate,
  DocumentAction,
  DocumentActionRole,
  DocumentRuntimeState,
  ResolvedDocumentAction,
} from './document-action-row.types';
import { actionMeta, resolveDocumentActions } from './resolve-document-actions';

/** These read fine as a bare icon (approve/return/undo/delete); the rest keep their text label. */
const ICON_ONLY_ACTIONS: ReadonlySet<DocumentAction> = new Set(['approve', 'return', 'undo', 'delete']);

/**
 * Renders the action button(s) for one annual-account document row — shared between the ULB
 * upload page and the STATE review page. Purely presentational: `resolveDocumentActions`
 * decides what to show, this component only renders it and emits the click.
 */
@Component({
  selector: 'app-document-action-row',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './document-action-row.component.html',
  styleUrl: './document-action-row.component.scss',
})
export class DocumentActionRowComponent {
  readonly role = input.required<DocumentActionRole>();
  readonly sectionStatusId = input.required<number>();
  readonly gates = input.required<readonly ActionGate[]>();
  readonly doc = input.required<DocumentRuntimeState>();
  /** When true, every resolved action renders disabled — the page's own permission check
   *  (e.g. canUpload()/canDelete()), independent of the gate/doc-state logic below. */
  readonly readOnly = input(false);
  /** Opt-in, per-consumer relabeling: when resolveDocumentActions() picks a given action, render
   *  (and emit) it as a different one instead — e.g. DUR has no real "delete a slot" concept (every
   *  document is always required), so it renders the PASSED-and-undecided "delete" as "reupload",
   *  which is what its onDocAction() already does with either action anyway. Resolution logic
   *  itself stays fixed and shared; this only relabels the result for forms that opt in. */
  readonly renderAs = input<Partial<Record<DocumentAction, DocumentAction>>>({});

  readonly actionClicked = output<{ action: ResolvedDocumentAction['action']; docKey: string }>();

  isIconOnly(action: DocumentAction): boolean {
    return ICON_ONLY_ACTIONS.has(action);
  }

  readonly actions = computed<ResolvedDocumentAction[]>(() => {
    const resolved = resolveDocumentActions(this.role(), this.sectionStatusId(), this.gates(), this.doc());
    const relabeled = resolved.map((a) => {
      const renderedAction = this.renderAs()[a.action];
      if (!renderedAction) return a;
      return { ...a, action: renderedAction, ...actionMeta(renderedAction as Parameters<typeof actionMeta>[0]) };
    });
    return this.readOnly() ? relabeled.map((a) => ({ ...a, disabled: true })) : relabeled;
  });

  onClick(action: ResolvedDocumentAction): void {
    if (action.disabled) return;
    this.actionClicked.emit({ action: action.action, docKey: this.doc().docKey });
  }
}
