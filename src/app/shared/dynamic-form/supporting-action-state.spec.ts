import type { FieldConfig, FieldSupportingAction, FieldSupportingContent } from './field.interface';
import { withSupportingActionState } from './supporting-action-state';

function buildAction(overrides: Partial<FieldSupportingAction> = {}): FieldSupportingAction {
  return { id: 'download-template', label: 'Download the template', ...overrides };
}

function buildField(supportingContent?: FieldSupportingContent[]): FieldConfig {
  return { key: 'excelFile', label: 'Excel File', formFieldType: 'file', supportingContent };
}

describe('withSupportingActionState', () => {
  it('returns the same field reference when patches is empty', () => {
    const field = buildField([{ type: 'actions', actions: [buildAction()] }]);
    expect(withSupportingActionState(field, [])).toBe(field);
  });

  it('returns the same field reference when supportingContent is missing', () => {
    const field = buildField(undefined);
    expect(withSupportingActionState(field, [{ actionId: 'download-template', loading: true }])).toBe(field);
  });

  it('returns the same field reference when supportingContent is empty', () => {
    const field = buildField([]);
    expect(withSupportingActionState(field, [{ actionId: 'download-template', loading: true }])).toBe(field);
  });

  it('patches only the action matching actionId, leaving sibling actions in the same block untouched', () => {
    const template = buildAction({ id: 'download-template' });
    const errorSheet = buildAction({ id: 'download-error-sheet', label: 'Download error sheet' });
    const field = buildField([{ type: 'actions', actions: [template, errorSheet] }]);

    const result = withSupportingActionState(field, [
      { actionId: 'download-template', loading: true, loadingLabel: 'Downloading template…' },
    ]);

    const block = result.supportingContent![0] as Extract<FieldSupportingContent, { type: 'actions' }>;
    expect(block.actions[0]).toEqual({ ...template, loading: true, loadingLabel: 'Downloading template…' });
    expect(block.actions[1]).toBe(errorSheet);
  });

  it('supports patching two different action ids on the same block in one call', () => {
    const template = buildAction({ id: 'download-template' });
    const errorSheet = buildAction({ id: 'download-error-sheet', label: 'Download error sheet' });
    const field = buildField([{ type: 'actions', actions: [template, errorSheet] }]);

    const result = withSupportingActionState(field, [
      { actionId: 'download-template', loading: true },
      { actionId: 'download-error-sheet', loading: true },
    ]);

    const block = result.supportingContent![0] as Extract<FieldSupportingContent, { type: 'actions' }>;
    expect(block.actions[0].loading).toBeTrue();
    expect(block.actions[1].loading).toBeTrue();
  });

  it('never mutates the input field/supportingContent/action objects', () => {
    const template = buildAction({ id: 'download-template' });
    const block: FieldSupportingContent = { type: 'actions', actions: [template] };
    const field = buildField([block]);

    withSupportingActionState(field, [{ actionId: 'download-template', loading: true }]);

    expect(template.loading).toBeUndefined();
    expect(block.actions[0]).toBe(template);
    expect(field.supportingContent![0]).toBe(block);
  });

  it('only writes keys explicitly present in the patch, leaving omitted keys untouched', () => {
    const template = buildAction({ id: 'download-template', disabled: true });
    const field = buildField([{ type: 'actions', actions: [template] }]);

    const result = withSupportingActionState(field, [{ actionId: 'download-template', loading: true }]);

    const block = result.supportingContent![0] as Extract<FieldSupportingContent, { type: 'actions' }>;
    // `disabled` was not part of the patch — the action's pre-existing value must survive.
    expect(block.actions[0].disabled).toBeTrue();
    expect(block.actions[0].loading).toBeTrue();
  });

  it('composes a disabled patch and a loading patch on different actions without either clobbering the other', () => {
    const preview = buildAction({ id: 'preview-template', label: 'Preview' });
    const download = buildAction({ id: 'download-template', label: 'Download' });
    const field = buildField([{ type: 'actions', actions: [preview, download] }]);

    const result = withSupportingActionState(field, [
      { actionId: 'preview-template', disabled: true },
      { actionId: 'download-template', disabled: true, loading: true, loadingLabel: 'Preparing download…' },
    ]);

    const block = result.supportingContent![0] as Extract<FieldSupportingContent, { type: 'actions' }>;
    expect(block.actions[0]).toEqual({ ...preview, disabled: true });
    expect(block.actions[1]).toEqual({ ...download, disabled: true, loading: true, loadingLabel: 'Preparing download…' });
  });

  it('ignores a patch whose actionId matches nothing', () => {
    const template = buildAction({ id: 'download-template' });
    const field = buildField([{ type: 'actions', actions: [template] }]);

    const result = withSupportingActionState(field, [{ actionId: 'does-not-exist', loading: true }]);

    const block = result.supportingContent![0] as Extract<FieldSupportingContent, { type: 'actions' }>;
    expect(block.actions[0]).toBe(template);
  });

  it('leaves non-actions supportingContent blocks untouched', () => {
    const infoBlock: FieldSupportingContent = { type: 'info', description: 'Some info text.' };
    const actionsBlock: FieldSupportingContent = {
      type: 'actions',
      actions: [buildAction({ id: 'download-template' })],
    };
    const field = buildField([infoBlock, actionsBlock]);

    const result = withSupportingActionState(field, [{ actionId: 'download-template', loading: true }]);

    expect(result.supportingContent![0]).toBe(infoBlock);
  });
});
