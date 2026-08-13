import type { FieldConfig, FieldSupportingContent } from './field.interface';

/**
 * One `FieldSupportingAction.id` to patch, plus the disabled/loading state to apply to it.
 * Each key is written only when explicitly present (not `undefined`) — omit a key to leave that
 * action's existing value untouched, which is what lets one caller compose a `disabled` override
 * (e.g. "disabled while there are unsaved changes") with another caller's `loading` override
 * (e.g. "loading while a download is in flight") without either clobbering the other.
 */
export interface SupportingActionStatePatch {
  actionId: string;
  disabled?: boolean;
  loading?: boolean;
  /** Only meaningful while `loading` is `true`; the button falls back to its own default ('Loading…') when unset. */
  loadingLabel?: string;
}

/**
 * Returns a shallow-patched copy of `field` with `disabled`/`loading`/`loadingLabel` overridden on
 * whichever `FieldSupportingAction`s — across every `type: 'actions'` supportingContent block —
 * match a `patches[].actionId`. Supports patching multiple action ids on the same field in one call
 * (e.g. a field with independently-loading "download template" and "download error sheet" actions).
 *
 * Pure and immutable — `field` and its nested arrays/objects are never mutated; unaffected blocks
 * and actions are returned by reference. Returns `field` unchanged (same reference) when there is
 * nothing to patch, so callers that conditionally patch (e.g. "only override while downloading")
 * can safely `computed()` this without breaking reference-equality checks elsewhere.
 *
 * @param field    The field config to patch (its `supportingContent`, if present, is read).
 * @param patches  Action ids to override, and the disabled/loading state to apply to each.
 */
export function withSupportingActionState<T extends FieldConfig>(
  field: T,
  patches: readonly SupportingActionStatePatch[],
): T {
  if (!patches.length || !field.supportingContent?.length) return field;

  const patchByActionId = new Map(patches.map((patch) => [patch.actionId, patch]));

  return {
    ...field,
    supportingContent: field.supportingContent.map((block): FieldSupportingContent =>
      block.type === 'actions'
        ? {
            ...block,
            actions: block.actions.map((action) => {
              const patch = patchByActionId.get(action.id);
              if (!patch) return action;
              return {
                ...action,
                ...(patch.disabled !== undefined ? { disabled: patch.disabled } : {}),
                ...(patch.loading !== undefined ? { loading: patch.loading } : {}),
                ...(patch.loadingLabel !== undefined ? { loadingLabel: patch.loadingLabel } : {}),
              };
            }),
          }
        : block,
    ),
  };
}
