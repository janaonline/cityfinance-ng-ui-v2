import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import FileSaver from 'file-saver';
import { Subject, of, throwError } from 'rxjs';
import { UtilityService } from '../../../../core/services/utility.service';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { ConditionalFieldConfig } from '../../dynamic-form-visibility.service';
import { FORM_STATUS } from '../../shared/form-progress/form-progress.component';
import { XvifcModuleService } from '../../xvi-fc-module.service';
import { UnspentUlbTableComponent } from './components/unspent-ulb-table/unspent-ulb-table.component';
import { FcUnspentDeclarationComponent } from './fc-unspent-declaration.component';
import { FcUnspentDeclarationService } from './fc-unspent-declaration.service';
import { FcUnspentUlbOptionsCacheService } from './fc-unspent-ulb-options-cache.service';
import { FcUnspentDeclarationData, FcUnspentSavePayload, FcUnspentUlbData } from './fc-unspent-declaration.models';

/** `form` is built dynamically (`fb.group({})`), so `.get()` isn't statically typed — narrow it here for tests. */
function isFcUnspentControl(component: FcUnspentDeclarationComponent): FormControl<string | null> {
  return component.form.get('isFcUnspent') as unknown as FormControl<string | null>;
}

/** Same narrowing as {@link isFcUnspentControl}, for any other dynamically-added control by key. */
function getFormControl<T>(component: FcUnspentDeclarationComponent, key: string): FormControl<T> {
  return component.form.get(key) as unknown as FormControl<T>;
}

function apiErrorResponse(errors: Record<string, { field?: string; message: string; code?: string }[]>) {
  return { success: false as const, message: 'Validation failed.', errors };
}

/** Real `responseType: 'blob'` download requests report their error body as an actual `Blob`, not a
 *  parsed object — see `handleDownloadApiError`'s doc comment on the component. Builds a
 *  `throwError`-able value shaped exactly like Angular's real `HttpErrorResponse` for the download
 *  endpoint, so tests using this actually exercise `parseBlobErrorResponse`'s `Blob.text()`/
 *  `JSON.parse` path instead of the synchronous plain-object shape `saveDraft`/`finalSubmit` use. */
function blobApiErrorResponse(
  message: string,
  errors: Record<string, { field?: string; message: string; code?: string }[]> = {},
) {
  const body = { statusCode: 400, message, errors };
  return { error: new Blob([JSON.stringify(body)], { type: 'application/json' }) };
}

/** Polls `predicate` until it's true, instead of guessing a fixed delay — needed for assertions that
 *  depend on `Blob.text()`'s real async I/O, which isn't tracked by zone.js/`fixture.whenStable()`
 *  and so can't be reliably awaited with a single fixed-duration `setTimeout`. Mirrors
 *  `elected-body-status.component.spec.ts`'s identical helper, added for the identical reason. */
async function waitUntil(predicate: () => boolean, timeoutMs = 2000, intervalMs = 10): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!predicate()) {
    if (Date.now() > deadline) throw new Error('waitUntil: timed out waiting for condition');
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

// ─── Test fixtures ────────────────────────────────────────────────────────────
// Test-only data standing in for a real `getForm()` response — there is no static frontend
// question source anymore; the real dynamic-form field config comes entirely from the backend
// (see `fc-unspent-declaration.service.ts`'s HTTP-backed `getForm()`).

const FC_UNSPENT_DECLARATION_FIELDS: ConditionalFieldConfig[] = [
  {
    formFieldType: 'radio',
    label: 'Do any ULBs in the state have unspent 14th FC balance to report?',
    key: 'isFcUnspent',
    value: 'no',
    options: [
      {
        label: 'No (no ULB in the state has unspent 14th FC balance to report)',
        id: 'no',
      },
      {
        label: 'Yes (one or more ULBs have unspent 14th FC balance to report)',
        id: 'yes',
      },
    ],
    validations: [
      {
        name: 'required',
        validator: null,
        message: 'This field is required.',
      },
    ],
    radioLayout: 'vertical',
    supportingContent: [
      {
        type: 'info',
        position: 'after',
        description:
          'Select No if your state has confirmed that none of its ULBs hold any unspent 14th Finance Commission balance. Select Yes if one or more ULBs need to report a balance.',
      },
    ],
  },
  {
    formFieldType: 'file',
    label: 'State-Level Declaration - 14th Finance Commission',
    key: 'fcDeclaration',
    value: null,
    validations: [
      {
        name: 'required',
        validator: null,
        message: 'This field is required.',
      },
    ],
    folderPath: 'fc-unspent/fc-declaration',
    maxFileSize: 5,
    allowedFileTypes: ['pdf'],
    appearance: {
      color: 'success',
      variant: 'soft',
    },
    visibleWhen: {
      mode: 'all',
      conditions: [
        {
          key: 'isFcUnspent',
          operator: 'equals',
          value: 'no',
        },
      ],
    },
    clearValueWhenDisabled: true,
    layout: {
      variant: 'inline',
      labelWidth: 'lg',
    },
    supportingContent: [
      {
        type: 'actions',
        position: 'before',
        layout: 'inline',
        separator: 'dot',
        description:
          'Download the official template, have it signed by the authorized State DMA officer, and upload the signed declaration. Declarations on unofficial letterhead will not be accepted.',
        actions: [
          {
            id: 'download-template',
            label: 'Download the official template',
            icon: 'bi bi-file-earmark-word',
            tone: 'primary',
            visible: true,
          },
        ],
        badges: [],
      },
    ],
  },
  {
    formFieldType: 'file',
    label: 'State-Level Declaration - 14th Finance Commission (ULB-wise)',
    key: 'fcUnspentDeclaration',
    value: null,
    validations: [
      {
        name: 'required',
        validator: null,
        message: 'This field is required.',
      },
    ],
    folderPath: 'fc-unspent/fc-unspent-declaration',
    maxFileSize: 5,
    allowedFileTypes: ['pdf'],
    appearance: {
      color: 'success',
      variant: 'soft',
    },
    visibleWhen: {
      mode: 'all',
      conditions: [
        {
          key: 'isFcUnspent',
          operator: 'equals',
          value: 'yes',
        },
        {
          key: 'savedUnspentUlbData',
          operator: 'isNotEmpty',
        },
      ],
    },
    clearValueWhenDisabled: true,
    layout: {
      variant: 'inline',
      labelWidth: 'lg',
    },
    supportingContent: [
      {
        type: 'actions',
        position: 'before',
        layout: 'inline',
        separator: 'dot',
        description:
          'Download the declaration (with the ULB-wise table filled in), have it signed by the authorized State DMA officer, and upload the signed copy below.',
        actions: [
          {
            id: 'download-declaration',
            label: 'Download the declaration',
            icon: 'bi bi-file-earmark-word',
            tone: 'primary',
            visible: true,
          },
        ],
        badges: [],
      },
    ],
  },
  {
    formFieldType: 'checkbox',
    key: 'checkboxConfirmation',
    label:
      'I certify that the 14th FC unspent balances entered above have been compiled from figures reported by each ULB, and are accurate to the best of my knowledge.',
    value: false,
    validations: [
      {
        name: 'requiredTrue',
        validator: null,
        message: 'Please confirm before submitting.',
      },
    ],
    visibleWhen: {
      mode: 'all',
      conditions: [
        {
          key: 'isFcUnspent',
          operator: 'equals',
          value: 'yes',
        },
      ],
    },
    clearValueWhenDisabled: true,
  },
];

function questionsForYesBranch(): FcUnspentDeclarationData['questions'] {
  return [
    { ...FC_UNSPENT_DECLARATION_FIELDS[0], value: 'yes' },
    { ...FC_UNSPENT_DECLARATION_FIELDS[1], value: null },
    { ...FC_UNSPENT_DECLARATION_FIELDS[2], value: null },
    { ...FC_UNSPENT_DECLARATION_FIELDS[3], value: true },
  ];
}

/** Same shape as `questionsForYesBranch`, but loaded as No — used where a test needs the No branch
 *  already *saved* (not just switched to locally), so `hasUnsavedBranchChange()` starts false. */
function questionsForNoBranch(): FcUnspentDeclarationData['questions'] {
  return [
    { ...FC_UNSPENT_DECLARATION_FIELDS[0], value: 'no' },
    { ...FC_UNSPENT_DECLARATION_FIELDS[1], value: null },
    { ...FC_UNSPENT_DECLARATION_FIELDS[2], value: null },
    { ...FC_UNSPENT_DECLARATION_FIELDS[3], value: false },
  ];
}

/** Stand-in for the backend's `rowEditFields` metadata (ulbId/unspentAmount) — required now that
 *  `UnspentUlbTableComponent`/`createFcUnspentUlbRowGroup` no longer fall back to a hardcoded
 *  field config of their own. */
const ROW_EDIT_FIELDS: ConditionalFieldConfig[] = [
  {
    key: 'ulbId',
    label: 'ULB',
    formFieldType: 'select',
    validations: [{ name: 'required', validator: null, message: 'ULB selection is required.' }],
  },
  {
    key: 'unspentAmount',
    label: 'Unspent Amount',
    formFieldType: 'number',
    validations: [
      { name: 'required', validator: null, message: 'Unspent amount is required.' },
      { name: 'min', validator: Number.MIN_VALUE, message: 'Unspent amount must be greater than zero.' },
      { name: 'max', validator: 1000, message: 'Unspent amount cannot exceed 1000.' },
    ],
  },
  {
    key: 'previousFcUnspentBalance',
    label: 'Previous FC Unspent Balance',
    formFieldType: 'number',
    validations: [
      { name: 'required', validator: null, message: 'Previous FC unspent balance is required.' },
      {
        name: 'min',
        validator: Number.MIN_VALUE,
        message: 'Previous FC unspent balance must be greater than zero.',
      },
      { name: 'max', validator: 1000, message: 'Previous FC unspent balance cannot exceed 1000.' },
    ],
  },
];

const UNSPENT_ULB_ROWS: FcUnspentUlbData[] = [
  {
    slNo: 1,
    ulbId: '66a000000000000000000001',
    censusCode: '800123',
    sbCode: null,
    ulbName: 'Sample Municipal Corporation',
    allocationAmount: 20,
    unspentAmount: 1.5,
    previousFcUnspentBalance: 0.5,
    allocationPerc: 7.5,
    eligibility: true,
    rowStatus: null,
  },
  {
    slNo: 2,
    ulbId: '66a000000000000000000002',
    censusCode: null,
    sbCode: 'SB-0142',
    ulbName: 'Sample Municipal Council',
    allocationAmount: 8,
    unspentAmount: 1.2,
    previousFcUnspentBalance: 0.4,
    allocationPerc: 15,
    eligibility: false,
    rowStatus: null,
  },
];

/** Devolution is UNDER_REVIEW_BY_MOHUA — the normal, fully-editable-and-submittable case. */
const FC_UNSPENT_SCENARIO_DEVOLUTION_UNDER_REVIEW: FcUnspentDeclarationData = {
  stateName: 'Sample State',
  applicableFc: '14TH_FC',
  threshold: 10,
  currentFormStatus: FORM_STATUS.IN_PROGRESS,
  permissions: { canView: true, canEdit: true, canSaveDraft: true, canFinalSubmit: true },
  dependency: {
    devolutionStatus: FORM_STATUS.UNDER_REVIEW_BY_MOHUA,
    devolutionDatasetExists: true,
    editableDueToDevolutionReturn: false,
    blockingMessage: null,
  },
  actors: [],
  questions: questionsForYesBranch(),
  rowEditFields: ROW_EDIT_FIELDS,
  unspentUlbData: UNSPENT_ULB_ROWS,
};

/** Devolution was RETURNED_BY_MOHUA — FC Unspent reopens for editing/draft-saving, but final submit stays blocked. */
const FC_UNSPENT_SCENARIO_DEVOLUTION_RETURNED: FcUnspentDeclarationData = {
  stateName: 'Sample State',
  applicableFc: '14TH_FC',
  threshold: 10,
  currentFormStatus: FORM_STATUS.IN_PROGRESS,
  permissions: { canView: true, canEdit: true, canSaveDraft: true, canFinalSubmit: false },
  dependency: {
    devolutionStatus: FORM_STATUS.RETURNED_BY_MOHUA,
    devolutionDatasetExists: true,
    editableDueToDevolutionReturn: true,
    blockingMessage:
      'ULB-wise Allocation was returned by MoHUA for correction. FC Unspent can be edited and saved as a draft, but final submission is blocked until ULB-wise Allocation is resubmitted and accepted.',
  },
  actors: [],
  questions: questionsForYesBranch(),
  rowEditFields: ROW_EDIT_FIELDS,
  unspentUlbData: UNSPENT_ULB_ROWS,
};

/**
 * No active Installment-1 Devolution allocation dataset exists yet. Row-level unspent-amount entry
 * is meaningless without an allocation to check it against, so this scenario locks the whole form
 * (canEdit/canSaveDraft/canFinalSubmit all false) rather than allowing edits with no valid ULB
 * allocation-dependent row actions available.
 */
const FC_UNSPENT_SCENARIO_MISSING_DEVOLUTION_DATASET: FcUnspentDeclarationData = {
  stateName: 'Sample State',
  applicableFc: '14TH_FC',
  threshold: 10,
  currentFormStatus: FORM_STATUS.NOT_STARTED,
  permissions: { canView: true, canEdit: false, canSaveDraft: false, canFinalSubmit: false },
  dependency: {
    devolutionStatus: null,
    devolutionDatasetExists: false,
    editableDueToDevolutionReturn: false,
    blockingMessage:
      'An active Installment 1 Devolution allocation dataset is required before FC Unspent can be edited or submitted.',
  },
  actors: [],
  questions: questionsForYesBranch(),
  rowEditFields: ROW_EDIT_FIELDS,
  unspentUlbData: [],
};

/** What `FcUnspentDeclarationService.getForm()` returns for the default (Yes-branch, fully-permitted) case. */
const DEFAULT_PREVIEW_DATA: FcUnspentDeclarationData = {
  stateName: 'Sample State',
  applicableFc: '14TH_FC',
  threshold: 10,
  currentFormStatus: FORM_STATUS.IN_PROGRESS,
  permissions: { canView: true, canEdit: true, canSaveDraft: true, canFinalSubmit: true },
  dependency: {
    devolutionStatus: FORM_STATUS.UNDER_REVIEW_BY_MOHUA,
    devolutionDatasetExists: true,
    editableDueToDevolutionReturn: false,
    blockingMessage: null,
  },
  actors: [
    {
      action: 'Created by',
      designation: 'State DMA Officer',
      by: '15thfcdesk5@gmail.com',
      date: '2026-07-13T13:06:49.890Z',
    },
    {
      action: 'Updated by',
      designation: 'State DMA Officer',
      by: '15thfcdesk5@gmail.com',
      date: '2026-07-13T13:06:52.370Z',
    },
  ],
  questions: questionsForYesBranch(),
  rowEditFields: ROW_EDIT_FIELDS,
  unspentUlbData: UNSPENT_ULB_ROWS,
};

function previewData(): FcUnspentDeclarationData {
  return DEFAULT_PREVIEW_DATA;
}

/** Same as `DEFAULT_PREVIEW_DATA` but loaded as the No branch (no rows) — for tests that need a
 *  component whose saved and live isFcUnspent already agree on 'no' (no unsaved branch change),
 *  rather than one that loads as Yes and then switches locally (which is itself now a real
 *  "unsaved change" the download actions must gate on — see the "unsaved-state gating" describe). */
const NO_BRANCH_PREVIEW_DATA: FcUnspentDeclarationData = {
  ...DEFAULT_PREVIEW_DATA,
  questions: questionsForNoBranch(),
  unspentUlbData: [],
};

describe('FcUnspentDeclarationComponent', () => {
  let component: FcUnspentDeclarationComponent;
  let fixture: ComponentFixture<FcUnspentDeclarationComponent>;
  let utilityService: UtilityService;
  let fcUnspentService: FcUnspentDeclarationService;
  let getFormSpy: jasmine.Spy;

  beforeEach(async () => {
    localStorage.setItem('userData', JSON.stringify({ state: 'state-test-id' }));

    const moduleService = jasmine.createSpyObj<XvifcModuleService>('XvifcModuleService', ['yearId']);
    moduleService.yearId.and.returnValue('year-test-id');

    await TestBed.configureTestingModule({
      providers: [
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: XvifcModuleService, useValue: moduleService },
      ],
      imports: [HttpClientTestingModule, RouterTestingModule, FcUnspentDeclarationComponent],
    }).compileComponents();

    fcUnspentService = TestBed.inject(FcUnspentDeclarationService);
    getFormSpy = spyOn(fcUnspentService, 'getForm').and.returnValue(of(previewData()));
    utilityService = TestBed.inject(UtilityService);

    fixture = TestBed.createComponent(FcUnspentDeclarationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem('userData');
  });

  function findTable(): UnspentUlbTableComponent {
    return fixture.debugElement.query(By.directive(UnspentUlbTableComponent))
      .componentInstance as UnspentUlbTableComponent;
  }

  /** Creates a fresh component instance seeded with the given scenario, rather than calling
   *  `loadForm()` again on the shared `component` — `createFormControls()` isn't re-entrant-safe
   *  (it would push a second copy of `unspentUlbData`'s rows onto the same FormArray). */
  function createComponentForScenario(data: FcUnspentDeclarationData): ComponentFixture<FcUnspentDeclarationComponent> {
    getFormSpy.and.returnValue(of(data));
    const scenarioFixture = TestBed.createComponent(FcUnspentDeclarationComponent);
    scenarioFixture.detectChanges();
    return scenarioFixture;
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('hydrates page state from the real GET response', () => {
    const data = previewData();
    expect(getFormSpy).toHaveBeenCalledWith('state-test-id', 'year-test-id');
    expect(component.stateName()).toBe(data.stateName);
    expect(component.applicableFcLabel()).toBe('14th');
    expect(component.currentFormStatus()).toBe(data.currentFormStatus);
    expect(component.canEdit()).toBe(data.permissions.canEdit);
    expect(component.canFinalSubmit()).toBe(data.permissions.canFinalSubmit);
    expect(component.threshold()).toBe(data.threshold);
    expect(component.savedUnspentUlbData()).toEqual(data.unspentUlbData);
  });

  it('creates FormArray rows from the GET response via createContorl-backed controls', () => {
    expect(component.unspentUlbData.length).toBe(2);

    const [row0, row1] = component.unspentUlbData.controls;
    expect(row0.controls.ulbId).toBeInstanceOf(FormControl);
    expect(row0.controls.unspentAmount).toBeInstanceOf(FormControl);
    expect(row0.controls.ulbId.value).toBe('66a000000000000000000001');
    expect(row0.controls.unspentAmount.value).toBe(1.5);
    expect(row1.controls.ulbId.value).toBe('66a000000000000000000002');
    expect(row1.controls.unspentAmount.value).toBe(1.2);
  });

  it('shows the table when isFcUnspent is yes (mock default)', () => {
    expect(isFcUnspentControl(component).value).toBe('yes');
    expect(component.isYesBranch()).toBe(true);

    const table = fixture.debugElement.query(By.directive(UnspentUlbTableComponent));
    expect(table).toBeTruthy();
  });

  it('hides the table when isFcUnspent is switched to no', () => {
    isFcUnspentControl(component).setValue('no');
    fixture.detectChanges();

    expect(component.isYesBranch()).toBe(false);
    const table = fixture.debugElement.query(By.directive(UnspentUlbTableComponent));
    expect(table).toBeFalsy();
    // Rows are preserved even though the table isn't rendered.
    expect(component.unspentUlbData.length).toBe(2);
  });

  it('restores the existing rows when switched back to yes', () => {
    isFcUnspentControl(component).setValue('no');
    fixture.detectChanges();
    isFcUnspentControl(component).setValue('yes');
    fixture.detectChanges();

    expect(component.isYesBranch()).toBe(true);
    expect(component.unspentUlbData.length).toBe(2);
    expect(component.unspentUlbData.controls[0].controls.ulbId.value).toBe('66a000000000000000000001');
    const table = fixture.debugElement.query(By.directive(UnspentUlbTableComponent));
    expect(table).toBeTruthy();
  });

  it('leaves unspentUlbData empty when switching to yes with zero rows — Add ULB is the only way to add one', () => {
    component.unspentUlbData.removeAt(1);
    component.unspentUlbData.removeAt(0);
    isFcUnspentControl(component).setValue('no');
    fixture.detectChanges();

    expect(component.unspentUlbData.length).toBe(0);

    isFcUnspentControl(component).setValue('yes');
    fixture.detectChanges();

    expect(component.unspentUlbData.length).toBe(0);
  });

  it('fails final-submit validation when the Yes branch has zero rows', () => {
    const snackbarSpy = spyOn(utilityService, 'triggerSnackbar');
    component.unspentUlbData.removeAt(1);
    component.unspentUlbData.removeAt(0);

    component.onSubmit('finalSubmit');

    expect(snackbarSpy).toHaveBeenCalledWith(jasmine.any(String), 'snackbar-danger');
  });

  it('fails final-submit validation for an invalid row', () => {
    const snackbarSpy = spyOn(utilityService, 'triggerSnackbar');
    component.unspentUlbData.controls[0].controls.unspentAmount.setValue(0);

    component.onSubmit('finalSubmit');

    expect(snackbarSpy).toHaveBeenCalledWith(jasmine.any(String), 'snackbar-danger');
    expect(component.unspentUlbData.controls[0].controls.unspentAmount.touched).toBe(true);
  });

  it('leaves the No-branch file field visibility behavior intact', () => {
    isFcUnspentControl(component).setValue('no');
    fixture.detectChanges();
    expect(component.fields().find((f) => f.key === 'fcDeclaration')?.hidden).toBe(false);

    isFcUnspentControl(component).setValue('yes');
    fixture.detectChanges();
    expect(component.fields().find((f) => f.key === 'fcDeclaration')?.hidden).toBe(true);
  });

  it('leaves the checkboxConfirmation visibility behavior intact', () => {
    expect(component.fields().find((f) => f.key === 'checkboxConfirmation')?.hidden).toBe(false);

    isFcUnspentControl(component).setValue('no');
    fixture.detectChanges();
    expect(component.fields().find((f) => f.key === 'checkboxConfirmation')?.hidden).toBe(true);
  });

  // ─── Load failure / retry ──────────────────────────────────────────────────

  it('sets loadError and shows a danger snackbar when getForm fails, and loadForm() retry recovers', () => {
    const snackbarSpy = spyOn(utilityService, 'triggerSnackbar');
    getFormSpy.and.returnValue(throwError(() => new Error('network error')));

    component.loadForm();

    expect(component.loadError()).toBe(true);
    expect(component.isLoading()).toBe(false);
    expect(snackbarSpy).toHaveBeenCalledWith(jasmine.any(String), 'snackbar-danger');

    getFormSpy.and.returnValue(of(previewData()));
    component.loadForm();

    expect(component.loadError()).toBe(false);
    expect(component.stateName()).toBe(previewData().stateName);
  });

  it('renders a Retry button on load failure that reloads the form when clicked', () => {
    getFormSpy.and.returnValue(throwError(() => new Error('network error')));
    component.loadForm();
    fixture.detectChanges();

    const retryButton = fixture.debugElement.query(By.css('[data-cy="fc-unspent-declaration-retry"]'));
    expect(retryButton).toBeTruthy();

    getFormSpy.and.returnValue(of(previewData()));
    retryButton.nativeElement.click();
    fixture.detectChanges();

    expect(component.loadError()).toBe(false);
  });

  // ─── ULB picker wiring (no full ULB list is ever fetched by this page) ─────

  it("never requests a ULB options page from the page itself — that is entirely the picker dialog's concern", () => {
    const getUlbOptionsSpy = spyOn(fcUnspentService, 'getUlbOptions');

    isFcUnspentControl(component).setValue('no');
    fixture.detectChanges();
    isFcUnspentControl(component).setValue('yes');
    fixture.detectChanges();

    expect(getUlbOptionsSpy).not.toHaveBeenCalled();
  });

  it('passes the preview threshold, saved-row snapshot, and state/year context into the table', () => {
    const table = findTable();
    expect(table.threshold()).toBe(previewData().threshold);
    expect(table.savedRows()).toEqual(previewData().unspentUlbData);
    expect(table.stateId()).toBe('state-test-id');
    expect(table.yearId()).toBe('year-test-id');
  });

  // ─── Feature-scoped ULB-options cache (component-provided, shared across picker reopenings) ──

  it('provides one FcUnspentUlbOptionsCacheService instance scoped to this page component', () => {
    const cache = fixture.debugElement.injector.get(FcUnspentUlbOptionsCacheService);
    expect(cache).toBeInstanceOf(FcUnspentUlbOptionsCacheService);
  });

  it('clears the ULB-options cache whenever the form (re)loads, centralizing invalidation in loadForm', () => {
    const cache = fixture.debugElement.injector.get(FcUnspentUlbOptionsCacheService);
    const clearSpy = spyOn(cache, 'clear');

    component.loadForm();

    expect(clearSpy).toHaveBeenCalled();
  });

  it('clears the ULB-options cache after a successful save/final-submit reload', () => {
    const cache = fixture.debugElement.injector.get(FcUnspentUlbOptionsCacheService);
    spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
    spyOn(fcUnspentService, 'saveDraft').and.returnValue(of(undefined));
    const clearSpy = spyOn(cache, 'clear');

    component.onSubmit('saveAsDraft');

    expect(clearSpy).toHaveBeenCalled();
  });

  it('clears the ULB-options cache when the page component is destroyed', () => {
    const cache = fixture.debugElement.injector.get(FcUnspentUlbOptionsCacheService);
    cache.getOrFetch('probe-key', () => of({ options: [], page: 1, limit: 20, total: 0 })).subscribe();
    expect(cache.get('probe-key')).toBeDefined();

    fixture.destroy();

    expect(cache.get('probe-key')).toBeUndefined();
  });

  // ─── Boolean conversion at the API boundary ─────────────────────────────────

  it("sends isFcUnspent: true when the radio value is 'yes'", () => {
    spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
    const saveDraftSpy = spyOn(fcUnspentService, 'saveDraft').and.returnValue(of(undefined));

    component.onSubmit('saveAsDraft'); // mock default is 'yes'

    const payload = saveDraftSpy.calls.mostRecent().args[0] as FcUnspentSavePayload;
    expect(payload.data.isFcUnspent).toBe(true);
  });

  it("sends isFcUnspent: false when the radio value is 'no'", () => {
    spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
    const saveDraftSpy = spyOn(fcUnspentService, 'saveDraft').and.returnValue(of(undefined));

    isFcUnspentControl(component).setValue('no');
    fixture.detectChanges();
    component.onSubmit('saveAsDraft');

    const payload = saveDraftSpy.calls.mostRecent().args[0] as FcUnspentSavePayload;
    expect(payload.data.isFcUnspent).toBe(false);
    expect(payload.data.unspentUlbData).toBeUndefined();
    expect(payload.data.checkboxConfirmation).toBeUndefined();
    expect(payload.data.fcUnspentDeclaration).toBeUndefined();
  });

  it('blocks final submit for an unrecognized isFcUnspent value even though required validation passes', () => {
    const snackbarSpy = spyOn(utilityService, 'triggerSnackbar');
    const saveDraftSpy = spyOn(fcUnspentService, 'finalSubmit');
    isFcUnspentControl(component).setValue('maybe');
    fixture.detectChanges();

    component.onSubmit('finalSubmit');

    expect(snackbarSpy).toHaveBeenCalledWith(jasmine.any(String), 'snackbar-danger');
    expect(saveDraftSpy).not.toHaveBeenCalled();
  });

  // ─── Payload whitelist ──────────────────────────────────────────────────────

  it('buildPayload wraps the whitelisted row values in the { stateId, yearId, data } envelope', () => {
    spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
    const saveDraftSpy = spyOn(fcUnspentService, 'saveDraft').and.returnValue(of(undefined));

    component.onSubmit('saveAsDraft');

    expect(saveDraftSpy).toHaveBeenCalledTimes(1);
    const payload = saveDraftSpy.calls.mostRecent().args[0] as FcUnspentSavePayload;
    expect(payload.stateId).toBe('state-test-id');
    expect(payload.yearId).toBe('year-test-id');
    expect(payload.data.unspentUlbData).toEqual([
      { ulbId: '66a000000000000000000001', unspentAmount: 1.5, previousFcUnspentBalance: 0.5 },
      { ulbId: '66a000000000000000000002', unspentAmount: 1.2, previousFcUnspentBalance: 0.4 },
    ]);
  });

  it('drops incomplete rows from the payload instead of sending null ulbId/unspentAmount/previousFcUnspentBalance', () => {
    spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
    const saveDraftSpy = spyOn(fcUnspentService, 'saveDraft').and.returnValue(of(undefined));
    component.unspentUlbData.controls[1].controls.ulbId.setValue(null);

    component.onSubmit('saveAsDraft');

    const payload = saveDraftSpy.calls.mostRecent().args[0] as FcUnspentSavePayload;
    expect(payload.data.unspentUlbData).toEqual([
      { ulbId: '66a000000000000000000001', unspentAmount: 1.5, previousFcUnspentBalance: 0.5 },
    ]);
  });

  it('excludes backend-owned dependency/row-review fields from the payload — only whitelisted keys are sent', () => {
    spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
    const saveDraftSpy = spyOn(fcUnspentService, 'saveDraft').and.returnValue(of(undefined));

    component.onSubmit('saveAsDraft');

    const payload = saveDraftSpy.calls.mostRecent().args[0] as FcUnspentSavePayload;
    const dataKeys = Object.keys(payload.data).sort();
    expect(dataKeys).toEqual(['checkboxConfirmation', 'fcUnspentDeclaration', 'isFcUnspent', 'unspentUlbData']);
    for (const row of payload.data.unspentUlbData ?? []) {
      expect(Object.keys(row).sort()).toEqual(['previousFcUnspentBalance', 'ulbId', 'unspentAmount']);
    }
  });

  // ─── Save/final-submit signal wiring + reload ───────────────────────────────

  it('toggles isSavingDraft true then false around a saveDraft call, and shows a success snackbar', () => {
    spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
    const snackbarSpy = spyOn(utilityService, 'triggerSnackbar');
    const saveSubject = new Subject<void>();
    spyOn(fcUnspentService, 'saveDraft').and.returnValue(saveSubject);

    expect(component.isSavingDraft()).toBe(false);
    component.onSubmit('saveAsDraft');
    expect(component.isSavingDraft()).toBe(true);

    saveSubject.next();
    saveSubject.complete();

    expect(component.isSavingDraft()).toBe(false);
    expect(snackbarSpy).toHaveBeenCalledWith(jasmine.any(String), 'snackbar-success');
  });

  it('resets isSavingDraft, shows a danger snackbar, and leaves the form untouched when saveDraft fails', () => {
    spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
    spyOn(fcUnspentService, 'saveDraft').and.returnValue(throwError(() => new Error('save failed')));
    const snackbarSpy = spyOn(utilityService, 'triggerSnackbar');
    const ulbIdBefore = component.unspentUlbData.controls[0].controls.ulbId.value;

    component.onSubmit('saveAsDraft');

    expect(component.isSavingDraft()).toBe(false);
    expect(snackbarSpy).toHaveBeenCalledWith(jasmine.any(String), 'snackbar-danger');
    expect(component.unspentUlbData.controls[0].controls.ulbId.value).toBe(ulbIdBefore);
  });

  it('toggles isFinalSubmitting true then false around a finalSubmit call', () => {
    spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
    const submitSubject = new Subject<void>();
    spyOn(fcUnspentService, 'finalSubmit').and.returnValue(submitSubject);
    getFormControl<unknown>(component, 'fcUnspentDeclaration').setValue({
      originalName: 'unspent-declaration.pdf',
      path: 'https://example.test/unspent-declaration.pdf',
      mimeType: 'application/pdf',
      sizeKb: 1,
    });

    expect(component.isFinalSubmitting()).toBe(false);
    component.onSubmit('finalSubmit');
    expect(component.isFinalSubmitting()).toBe(true);

    submitSubject.next();
    submitSubject.complete();

    expect(component.isFinalSubmitting()).toBe(false);
  });

  it('reloads the real GET response after a successful draft save', () => {
    spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
    spyOn(fcUnspentService, 'saveDraft').and.returnValue(of(undefined));

    component.onSubmit('saveAsDraft');

    expect(getFormSpy).toHaveBeenCalledTimes(2);
    // Rows are rebuilt from the reloaded response, not duplicated onto the same FormArray.
    expect(component.unspentUlbData.length).toBe(2);
  });

  it('reloads the real GET response after a successful final submit', () => {
    spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
    spyOn(fcUnspentService, 'finalSubmit').and.returnValue(of(undefined));
    getFormControl<unknown>(component, 'fcUnspentDeclaration').setValue({
      originalName: 'unspent-declaration.pdf',
      path: 'https://example.test/unspent-declaration.pdf',
      mimeType: 'application/pdf',
      sizeKb: 1,
    });

    component.onSubmit('finalSubmit');

    expect(getFormSpy).toHaveBeenCalledTimes(2);
  });

  it('does not reload when save fails', () => {
    spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
    spyOn(fcUnspentService, 'saveDraft').and.returnValue(throwError(() => new Error('save failed')));

    component.onSubmit('saveAsDraft');

    expect(getFormSpy).toHaveBeenCalledTimes(1);
  });

  // ─── Leave-page prompt (unsaved-changes guard) ──────────────────────────────

  describe('unsaved-changes prompt', () => {
    it('is not raised right after load', () => {
      expect(component.hasUnsavedChanges()).toBeFalse();
    });

    it('is raised once a row amount is edited', () => {
      component.unspentUlbData.controls[0].controls.unspentAmount.setValue(2);
      component.unspentUlbData.controls[0].controls.unspentAmount.markAsDirty();

      expect(component.hasUnsavedChanges()).toBeTrue();
    });

    it('is cleared after a successful draft save, even though the Yes-branch table was edited first', () => {
      spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
      spyOn(fcUnspentService, 'saveDraft').and.returnValue(of(undefined));
      const amount = component.unspentUlbData.controls[0].controls.unspentAmount;
      amount.setValue(2);
      amount.markAsDirty();
      expect(component.hasUnsavedChanges()).toBeTrue();

      component.onSubmit('saveAsDraft');

      // The reload reuses the same `unspentUlbData` FormArray; its stale dirty flag used to flip the
      // brand-new form back to dirty, so leaving the page prompted to save again.
      expect(getFormSpy).toHaveBeenCalledTimes(2);
      expect(component.hasUnsavedChanges()).toBeFalse();
      expect(component.unspentUlbData.dirty).toBeFalse();
    });

    it('is cleared after a successful final submit as well', () => {
      spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
      spyOn(fcUnspentService, 'finalSubmit').and.returnValue(of(undefined));
      getFormControl<unknown>(component, 'fcUnspentDeclaration').setValue({
        originalName: 'unspent-declaration.pdf',
        path: 'https://example.test/unspent-declaration.pdf',
        mimeType: 'application/pdf',
        sizeKb: 1,
      });
      const amount = component.unspentUlbData.controls[0].controls.unspentAmount;
      amount.setValue(2);
      amount.markAsDirty();

      component.onSubmit('finalSubmit');

      expect(component.hasUnsavedChanges()).toBeFalse();
    });

    it('stays raised when the draft save fails, so the user is still warned about unsaved work', () => {
      spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
      spyOn(fcUnspentService, 'saveDraft').and.returnValue(throwError(() => new Error('save failed')));
      const amount = component.unspentUlbData.controls[0].controls.unspentAmount;
      amount.setValue(2);
      amount.markAsDirty();

      component.onSubmit('saveAsDraft');

      expect(component.hasUnsavedChanges()).toBeTrue();
    });

    it('is raised again by a new edit after a save', () => {
      spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
      spyOn(fcUnspentService, 'saveDraft').and.returnValue(of(undefined));
      component.unspentUlbData.controls[0].controls.unspentAmount.markAsDirty();
      component.onSubmit('saveAsDraft');
      expect(component.hasUnsavedChanges()).toBeFalse();

      const amount = component.unspentUlbData.controls[0].controls.unspentAmount;
      amount.setValue(3);
      amount.markAsDirty();

      expect(component.hasUnsavedChanges()).toBeTrue();
    });
  });

  // ─── A draft keeps selected ULBs even with empty amounts ────────────────────

  describe('draft with ULBs that have no amounts yet', () => {
    function submitDraftAndGetRows() {
      spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
      const saveDraftSpy = spyOn(fcUnspentService, 'saveDraft').and.returnValue(of(undefined));
      component.onSubmit('saveAsDraft');
      return (saveDraftSpy.calls.mostRecent().args[0] as FcUnspentSavePayload).data.unspentUlbData;
    }

    it('sends a selected ULB whose two amounts are both empty (null) instead of dropping it', () => {
      const [row0, row1] = component.unspentUlbData.controls;
      row1.controls.unspentAmount.setValue(null);
      row1.controls.previousFcUnspentBalance.setValue(null);

      expect(submitDraftAndGetRows()).toEqual([
        { ulbId: row0.controls.ulbId.value as string, unspentAmount: 1.5, previousFcUnspentBalance: 0.5 },
        { ulbId: '66a000000000000000000002', unspentAmount: null, previousFcUnspentBalance: null },
      ]);
    });

    it('sends a partially filled row with only the entered amount', () => {
      component.unspentUlbData.controls[1].controls.previousFcUnspentBalance.setValue(null);

      expect(submitDraftAndGetRows()?.[1]).toEqual({
        ulbId: '66a000000000000000000002',
        unspentAmount: 1.2,
        previousFcUnspentBalance: null,
      });
    });

    it('still drops a row that has no ULB at all', () => {
      component.unspentUlbData.controls[1].controls.ulbId.setValue(null);

      expect(submitDraftAndGetRows()).toEqual([
        { ulbId: '66a000000000000000000001', unspentAmount: 1.5, previousFcUnspentBalance: 0.5 },
      ]);
    });

    it('does not block the draft on empty amounts, but still blocks a provided invalid amount', () => {
      const snackbarSpy = spyOn(utilityService, 'triggerSnackbar');
      const saveDraftSpy = spyOn(fcUnspentService, 'saveDraft').and.returnValue(of(undefined));
      spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
      const row = component.unspentUlbData.controls[1];
      row.controls.unspentAmount.setValue(null);
      row.controls.previousFcUnspentBalance.setValue(null);
      component.onSubmit('saveAsDraft');
      expect(saveDraftSpy).toHaveBeenCalledTimes(1);

      // The successful save reloaded the form, so the row controls are new instances: re-read them.
      saveDraftSpy.calls.reset();
      component.unspentUlbData.controls[1].controls.unspentAmount.setValue(0);
      component.onSubmit('saveAsDraft');
      expect(saveDraftSpy).not.toHaveBeenCalled();
      expect(snackbarSpy).toHaveBeenCalledWith(jasmine.any(String), 'snackbar-danger');
    });

    it('still blocks final submit while a ULB is missing an amount', () => {
      const snackbarSpy = spyOn(utilityService, 'triggerSnackbar');
      const finalSubmitSpy = spyOn(fcUnspentService, 'finalSubmit').and.returnValue(of(undefined));
      component.unspentUlbData.controls[1].controls.unspentAmount.setValue(null);

      component.onSubmit('finalSubmit');

      expect(finalSubmitSpy).not.toHaveBeenCalled();
      expect(snackbarSpy).toHaveBeenCalledWith(jasmine.any(String), 'snackbar-danger');
    });
  });

  // ─── Backend API error mapping ──────────────────────────────────────────────

  it('displays a backend field error on a dynamic field control', () => {
    const snackbarSpy = spyOn(utilityService, 'triggerSnackbar');
    spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
    spyOn(fcUnspentService, 'saveDraft').and.returnValue(
      throwError(() =>
        apiErrorResponse({
          checkboxConfirmation: [{ field: 'checkboxConfirmation', message: 'Please confirm.', code: 'requiredTrue' }],
        }),
      ),
    );

    component.onSubmit('saveAsDraft');

    expect(snackbarSpy).toHaveBeenCalledWith('Validation failed.', 'snackbar-danger');
    const control = component.form.get('checkboxConfirmation');
    expect(control?.hasError('requiredTrue')).toBe(true);
    expect(component.fields().find((f) => f.key === 'checkboxConfirmation')?.validations).toContain(
      jasmine.objectContaining({ name: 'requiredTrue', message: 'Please confirm.' }),
    );
  });

  it('clears a dynamic field server error once the user edits that control', () => {
    spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
    spyOn(fcUnspentService, 'saveDraft').and.returnValue(
      throwError(() =>
        apiErrorResponse({
          checkboxConfirmation: [{ field: 'checkboxConfirmation', message: 'Please confirm.', code: 'requiredTrue' }],
        }),
      ),
    );

    component.onSubmit('saveAsDraft');
    const control = getFormControl<boolean>(component, 'checkboxConfirmation');
    expect(control.hasError('requiredTrue')).toBe(true);

    control.setValue(true);
    expect(control.hasError('requiredTrue')).toBe(false);
  });

  it('maps an indexed row error to the matching row control as apiErrors', () => {
    spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
    spyOn(fcUnspentService, 'saveDraft').and.returnValue(
      throwError(() =>
        apiErrorResponse({
          'unspentUlbData.0.unspentAmount': [
            {
              field: 'unspentUlbData.0.unspentAmount',
              message: 'Unspent amount must be greater than zero.',
              code: 'invalidAmount',
            },
          ],
        }),
      ),
    );

    component.onSubmit('saveAsDraft');

    const control = component.unspentUlbData.controls[0].controls.unspentAmount;
    expect(control.errors?.['apiErrors']).toEqual(['Unspent amount must be greater than zero.']);
  });

  it('clears row apiErrors once that row control changes', () => {
    spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
    spyOn(fcUnspentService, 'saveDraft').and.returnValue(
      throwError(() =>
        apiErrorResponse({
          'unspentUlbData.0.unspentAmount': [
            { field: 'unspentUlbData.0.unspentAmount', message: 'Must be greater than zero.', code: 'invalidAmount' },
          ],
        }),
      ),
    );

    component.onSubmit('saveAsDraft');
    const control = component.unspentUlbData.controls[0].controls.unspentAmount;
    expect(control.errors?.['apiErrors']).toEqual(['Must be greater than zero.']);

    control.setValue(5);
    expect(control.errors?.['apiErrors']).toBeUndefined();
  });

  it('maps a bare class-validator message array (no errors map) to the matching row control', () => {
    spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
    spyOn(fcUnspentService, 'saveDraft').and.returnValue(
      throwError(() => ({
        success: false as const,
        message: ['unspentUlbData.0.unspentAmount must be an integer number'],
      })),
    );

    component.onSubmit('saveAsDraft');

    const control = component.unspentUlbData.controls[0].controls.unspentAmount;
    expect(control.errors?.['apiErrors']).toEqual(['unspentUlbData.0.unspentAmount must be an integer number']);
  });

  it('surfaces an unmatched bare message via the compact alert instead of dropping it', () => {
    spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
    spyOn(fcUnspentService, 'saveDraft').and.returnValue(
      throwError(() => ({
        success: false as const,
        message: ['expectedRevision must be an integer number'],
      })),
    );

    component.onSubmit('saveAsDraft');
    fixture.detectChanges();

    expect(component.formLevelErrors()).toEqual(['expectedRevision must be an integer number']);
  });

  it('shows a _form error in the compact alert', () => {
    spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
    spyOn(fcUnspentService, 'saveDraft').and.returnValue(
      throwError(() =>
        apiErrorResponse({ _form: [{ message: 'Draft save is currently blocked.', code: 'devolutionBlocked' }] }),
      ),
    );

    component.onSubmit('saveAsDraft');
    fixture.detectChanges();

    expect(component.formLevelErrors()).toEqual(['Draft save is currently blocked.']);
    const alert = fixture.debugElement.query(By.css('[data-cy="fc-unspent-declaration-form-errors-alert"]'));
    expect(alert.nativeElement.textContent).toContain('Draft save is currently blocked.');
  });

  it('shows a whole-array unspentUlbData error in the compact alert', () => {
    spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
    spyOn(fcUnspentService, 'saveDraft').and.returnValue(
      throwError(() =>
        apiErrorResponse({
          unspentUlbData: [
            { field: 'unspentUlbData', message: 'Duplicate ULB rows are not allowed.', code: 'duplicateUlb' },
          ],
        }),
      ),
    );

    component.onSubmit('saveAsDraft');

    expect(component.formLevelErrors()).toEqual(['Duplicate ULB rows are not allowed.']);
  });

  it('extracts errors from an HttpErrorResponse-shaped error (err.error.errors)', () => {
    const snackbarSpy = spyOn(utilityService, 'triggerSnackbar');
    spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
    spyOn(fcUnspentService, 'saveDraft').and.returnValue(
      throwError(() => ({
        error: {
          statusCode: 400,
          message: 'Validation failed.',
          errors: { _form: [{ message: 'Blocked.', code: 'devolutionBlocked' }] },
        },
      })),
    );

    component.onSubmit('saveAsDraft');

    expect(snackbarSpy).toHaveBeenCalledWith('Validation failed.', 'snackbar-danger');
    expect(component.formLevelErrors()).toEqual(['Blocked.']);
  });

  // ─── Permission gating (canView/canEdit/canSaveDraft/canFinalSubmit independence) ─────────────

  it('Save is disabled by canSaveDraft independently of canEdit/canFinalSubmit', () => {
    const saveButton = fixture.debugElement.query(By.css('[data-cy="fc-unspent-declaration-submit-test"]'))
      .nativeElement as HTMLButtonElement;
    expect(saveButton.disabled).toBe(false); // mock default: canSaveDraft true

    // canEdit/canFinalSubmit stay true — only canSaveDraft flips — to prove Save is gated by its
    // own permission rather than by canEdit or canFinalSubmit.
    const scenarioFixture = createComponentForScenario({
      ...FC_UNSPENT_SCENARIO_DEVOLUTION_UNDER_REVIEW,
      permissions: { ...FC_UNSPENT_SCENARIO_DEVOLUTION_UNDER_REVIEW.permissions, canSaveDraft: false },
    });
    expect(scenarioFixture.componentInstance.canEdit()).toBe(true);
    expect(scenarioFixture.componentInstance.canFinalSubmit()).toBe(true);
    const disabledSaveButton = scenarioFixture.debugElement.query(
      By.css('[data-cy="fc-unspent-declaration-submit-test"]'),
    ).nativeElement as HTMLButtonElement;
    expect(disabledSaveButton.disabled).toBe(true);
  });

  it('renders no action footer at all when canEdit/canSaveDraft/canFinalSubmit are all false', () => {
    const scenarioFixture = createComponentForScenario(FC_UNSPENT_SCENARIO_MISSING_DEVOLUTION_DATASET);
    const saveButton = scenarioFixture.debugElement.query(By.css('[data-cy="fc-unspent-declaration-submit-test"]'));
    expect(saveButton).toBeFalsy();
  });

  it('never derives canFinalSubmit from currentFormStatus — uses permissions.canFinalSubmit verbatim', () => {
    const scenarioFixture = createComponentForScenario(FC_UNSPENT_SCENARIO_DEVOLUTION_RETURNED);
    const scenarioComponent = scenarioFixture.componentInstance;

    // currentFormStatus is IN_PROGRESS here (same as the fully-submittable default scenario) —
    // only the backend-provided permission, not the status, explains canFinalSubmit being false.
    expect(scenarioComponent.currentFormStatus()).toBe(FC_UNSPENT_SCENARIO_DEVOLUTION_RETURNED.currentFormStatus);
    expect(scenarioComponent.canFinalSubmit()).toBe(FC_UNSPENT_SCENARIO_DEVOLUTION_RETURNED.permissions.canFinalSubmit);
    expect(scenarioComponent.canFinalSubmit()).toBe(false);
  });

  // ─── Devolution dependency scenarios ───────────────────────────────────────

  it('Devolution-returned scenario keeps FC Unspent editable but blocks final submit', () => {
    const scenarioFixture = createComponentForScenario(FC_UNSPENT_SCENARIO_DEVOLUTION_RETURNED);
    const scenarioComponent = scenarioFixture.componentInstance;

    expect(scenarioComponent.canEdit()).toBe(true);
    expect(scenarioComponent.canSaveDraft()).toBe(true);
    expect(scenarioComponent.canFinalSubmit()).toBe(false);

    const finalSubmitButton = scenarioFixture.debugElement.query(
      By.css('[data-cy="fc-unspent-declaration-final-submit-test"]'),
    );
    expect(finalSubmitButton).toBeFalsy(); // only rendered when canFinalSubmit() is true
  });

  it('shows the backend-provided blocking message as a warning banner', () => {
    const scenarioFixture = createComponentForScenario(FC_UNSPENT_SCENARIO_DEVOLUTION_RETURNED);

    const banner = scenarioFixture.debugElement.query(By.css('[data-cy="fc-unspent-declaration-dependency-alert"]'));
    expect(banner).toBeTruthy();
    expect(banner.nativeElement.textContent).toContain(
      FC_UNSPENT_SCENARIO_DEVOLUTION_RETURNED.dependency.blockingMessage,
    );
  });

  it('shows no banner when dependency.blockingMessage is null', () => {
    const banner = fixture.debugElement.query(By.css('[data-cy="fc-unspent-declaration-dependency-alert"]'));
    expect(banner).toBeFalsy();
  });

  it('missing Devolution dataset scenario blocks final submit and shows its blocking message', () => {
    const scenarioFixture = createComponentForScenario(FC_UNSPENT_SCENARIO_MISSING_DEVOLUTION_DATASET);

    expect(scenarioFixture.componentInstance.canFinalSubmit()).toBe(false);
    const banner = scenarioFixture.debugElement.query(By.css('[data-cy="fc-unspent-declaration-dependency-alert"]'));
    expect(banner.nativeElement.textContent).toContain(
      FC_UNSPENT_SCENARIO_MISSING_DEVOLUTION_DATASET.dependency.blockingMessage,
    );
  });

  it('keeps existing saved rows visible when final submit is blocked', () => {
    const scenarioFixture = createComponentForScenario(FC_UNSPENT_SCENARIO_DEVOLUTION_RETURNED);
    const scenarioComponent = scenarioFixture.componentInstance;

    expect(scenarioComponent.canFinalSubmit()).toBe(false);
    expect(scenarioComponent.unspentUlbData.length).toBe(FC_UNSPENT_SCENARIO_DEVOLUTION_RETURNED.unspentUlbData.length);
    const table = scenarioFixture.debugElement.query(By.directive(UnspentUlbTableComponent));
    expect(table).toBeTruthy();
  });

  // ─── Declaration-template download ─────────────────────────────────────────

  describe('declaration document download', () => {
    const blob = new Blob(['docx content']);

    let downloadSpy: jasmine.Spy;
    let saveAsSpy: jasmine.Spy;

    function triggerYesBranchDownload(): void {
      component.onSupportingAction({ fieldKey: 'fcUnspentDeclaration', actionId: 'download-declaration' });
    }

    beforeEach(() => {
      downloadSpy = spyOn(fcUnspentService, 'downloadDeclarationDocument').and.returnValue(
        of({ blob, fileName: null }),
      );
      saveAsSpy = spyOn(FileSaver, 'saveAs');
    });

    it('invokes the service for the exact fcDeclaration / download-template action (No branch)', () => {
      // Loaded already-saved as No (not switched to locally) so hasUnsavedBranchChange() is false
      // and the belt-and-suspenders guard in onSupportingAction() doesn't block this.
      const scenarioComponent = createComponentForScenario(NO_BRANCH_PREVIEW_DATA).componentInstance;
      scenarioComponent.onSupportingAction({ fieldKey: 'fcDeclaration', actionId: 'download-template' });
      expect(downloadSpy).toHaveBeenCalledWith('state-test-id', 'year-test-id');
    });

    it('invokes the service for the exact fcUnspentDeclaration / download-declaration action (Yes branch, mock default)', () => {
      triggerYesBranchDownload();
      expect(downloadSpy).toHaveBeenCalledWith('state-test-id', 'year-test-id');
    });

    it('ignores an unrelated action id, and ignores the action id on an unrelated field', () => {
      component.onSupportingAction({ fieldKey: 'fcDeclaration', actionId: 'some-other-action' });
      component.onSupportingAction({ fieldKey: 'isFcUnspent', actionId: 'download-template' });
      component.onSupportingAction({ fieldKey: 'fcUnspentDeclaration', actionId: 'some-other-action' });

      expect(downloadSpy).not.toHaveBeenCalled();
    });

    it("does not cross-wire the two branches' field/action pairs", () => {
      component.onSupportingAction({ fieldKey: 'fcDeclaration', actionId: 'download-declaration' });
      component.onSupportingAction({ fieldKey: 'fcUnspentDeclaration', actionId: 'download-template' });

      expect(downloadSpy).not.toHaveBeenCalled();
    });

    it('blocks the request when stateId is missing', () => {
      localStorage.removeItem('userData');

      triggerYesBranchDownload();

      expect(downloadSpy).not.toHaveBeenCalled();
    });

    it('ignores duplicate clicks while a download is already in flight', () => {
      const pending = new Subject<{ blob: Blob; fileName: null }>();
      downloadSpy.and.returnValue(pending);

      triggerYesBranchDownload();
      triggerYesBranchDownload();
      triggerYesBranchDownload();

      expect(downloadSpy).toHaveBeenCalledTimes(1);
      pending.next({ blob, fileName: null });
      pending.complete();
    });

    it('saves the returned blob via FileSaver, falling back to a literal branch-based filename when Content-Disposition is absent', () => {
      triggerYesBranchDownload();
      expect(saveAsSpy).toHaveBeenCalledOnceWith(blob, 'Fc-unspent-declaration-yes.docx');
    });

    it('saves the returned blob under the backend Content-Disposition filename verbatim when present', () => {
      downloadSpy.and.returnValue(of({ blob, fileName: 'CF_Sample-State_fc-unspent-declaration_2024-25.docx' }));
      triggerYesBranchDownload();
      expect(saveAsSpy).toHaveBeenCalledOnceWith(blob, 'CF_Sample-State_fc-unspent-declaration_2024-25.docx');
    });

    it('shows loading on the download-declaration action (Yes branch) while the request is in flight, then clears it', () => {
      const pending = new Subject<{ blob: Blob; fileName: null }>();
      downloadSpy.and.returnValue(pending);

      function findAction() {
        const field = component.effectiveVisibleFields().find((f) => f.key === 'fcUnspentDeclaration');
        const block = field?.supportingContent?.find((b) => b.type === 'actions');
        return block && block.type === 'actions'
          ? block.actions.find((a) => a.id === 'download-declaration')
          : undefined;
      }

      triggerYesBranchDownload();

      expect(findAction()?.loading).toBeTrue();
      expect(findAction()?.loadingLabel).toBe('Downloading declaration…');

      pending.next({ blob, fileName: null });
      pending.complete();

      expect(findAction()?.loading).toBeFalsy();
    });

    it('shows loading on the download-template action (No branch) while the request is in flight, then clears it', () => {
      // fcDeclaration is only visible when isFcUnspent is 'no' — loaded already-saved as No (not
      // switched to locally) so hasUnsavedBranchChange() is false and the action isn't disabled.
      const scenarioComponent = createComponentForScenario(NO_BRANCH_PREVIEW_DATA).componentInstance;
      const pending = new Subject<{ blob: Blob; fileName: null }>();
      downloadSpy.and.returnValue(pending);

      function findAction() {
        const field = scenarioComponent.effectiveVisibleFields().find((f) => f.key === 'fcDeclaration');
        const block = field?.supportingContent?.find((b) => b.type === 'actions');
        return block && block.type === 'actions' ? block.actions.find((a) => a.id === 'download-template') : undefined;
      }

      scenarioComponent.onSupportingAction({ fieldKey: 'fcDeclaration', actionId: 'download-template' });

      expect(findAction()?.loading).toBeTrue();

      pending.next({ blob, fileName: null });
      pending.complete();

      expect(findAction()?.loading).toBeFalsy();
    });

    // These three go through `handleDownloadApiError`, which is `async` (it awaits
    // `parseBlobErrorResponse`, needed so real `Blob`-bodied download errors can be read via
    // `Blob.text()` — see that method's doc comment) even when, as here, `err.error` isn't a `Blob`
    // and the fallback path resolves with no real I/O — the `await` still defers to a microtask, so
    // these must poll rather than assert synchronously right after triggering the download.

    it('shows the backend error message on a service-thrown success:false failure', async () => {
      const snackbarSpy = spyOn(utilityService, 'triggerSnackbar');
      downloadSpy.and.returnValue(throwError(() => ({ success: false, message: 'Nothing to certify yet.' })));

      triggerYesBranchDownload();
      await waitUntil(() => snackbarSpy.calls.count() > 0);

      expect(snackbarSpy).toHaveBeenCalledWith('Nothing to certify yet.', 'snackbar-danger');
    });

    it('shows the backend error message on an HttpErrorResponse-shaped failure', async () => {
      const snackbarSpy = spyOn(utilityService, 'triggerSnackbar');
      downloadSpy.and.returnValue(throwError(() => ({ error: { statusCode: 500, message: 'Server error.' } })));

      triggerYesBranchDownload();
      await waitUntil(() => snackbarSpy.calls.count() > 0);

      expect(snackbarSpy).toHaveBeenCalledWith('Server error.', 'snackbar-danger');
    });

    it('shows the generic fallback message when no backend message is available', async () => {
      const snackbarSpy = spyOn(utilityService, 'triggerSnackbar');
      downloadSpy.and.returnValue(throwError(() => new Error('network error')));

      triggerYesBranchDownload();
      await waitUntil(() => snackbarSpy.calls.count() > 0);

      expect(snackbarSpy).toHaveBeenCalledWith('Failed to download the declaration document.', 'snackbar-danger');
    });

    it('never calls FileSaver.saveAs on a failed download', () => {
      downloadSpy.and.returnValue(throwError(() => new Error('network error')));
      triggerYesBranchDownload();
      expect(saveAsSpy).not.toHaveBeenCalled();
    });

    it('resets isDownloadingDeclaration after a successful download', () => {
      triggerYesBranchDownload();
      expect(component.isDownloadingDeclaration()).toBe(false);
    });

    it('resets isDownloadingDeclaration after a failed download', () => {
      downloadSpy.and.returnValue(throwError(() => new Error('network error')));
      triggerYesBranchDownload();
      expect(component.isDownloadingDeclaration()).toBe(false);
    });

    it('leaves form values unchanged and never reloads the form after a download (success or failure)', () => {
      const fcUnspentDeclarationBefore = getFormControl<unknown>(component, 'fcUnspentDeclaration').value;

      triggerYesBranchDownload();
      expect(getFormControl<unknown>(component, 'fcUnspentDeclaration').value).toEqual(fcUnspentDeclarationBefore);
      expect(getFormSpy).toHaveBeenCalledTimes(1);

      downloadSpy.and.returnValue(throwError(() => new Error('network error')));
      triggerYesBranchDownload();
      expect(getFormControl<unknown>(component, 'fcUnspentDeclaration').value).toEqual(fcUnspentDeclarationBefore);
      expect(getFormSpy).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Unsaved-state gating — GET .../fc-unspent-declaration-document only reflects saved data ──

  describe('hasUnsavedBranchChange / hasUnsavedRowChanges', () => {
    it('are both false right after load', () => {
      expect(component.hasUnsavedBranchChange()).toBeFalse();
      expect(component.hasUnsavedRowChanges()).toBeFalse();
    });

    it('hasUnsavedBranchChange becomes true after changing the radio, and false again once changed back', () => {
      isFcUnspentControl(component).setValue('no');
      expect(component.hasUnsavedBranchChange()).toBeTrue();

      isFcUnspentControl(component).setValue('yes');
      expect(component.hasUnsavedBranchChange()).toBeFalse();
    });

    it('hasUnsavedRowChanges becomes true after editing a row amount, and false again once changed back', () => {
      const amountControl = component.unspentUlbData.controls[0].controls.unspentAmount;
      const original = amountControl.value;

      amountControl.setValue((original ?? 0) + 1);
      expect(component.hasUnsavedRowChanges()).toBeTrue();

      amountControl.setValue(original);
      expect(component.hasUnsavedRowChanges()).toBeFalse();
    });

    it('hasUnsavedRowChanges becomes true after removing a row', () => {
      component.unspentUlbData.removeAt(0);
      expect(component.hasUnsavedRowChanges()).toBeTrue();
    });
  });

  // ─── Download action: "Save & download" ─────────────────────────────────────
  // `GET .../fc-unspent-declaration-document` only reflects saved data, so while the screen holds a branch/ULB
  // change the action saves the draft first and downloads only after that save succeeds.

  function findDownloadAction(comp: FcUnspentDeclarationComponent, fieldKey: string, actionId: string) {
    const field = comp.effectiveVisibleFields().find((f) => f.key === fieldKey);
    const block = field?.supportingContent?.find((b) => b.type === 'actions');
    return block && block.type === 'actions' ? block.actions.find((a) => a.id === actionId) : undefined;
  }

  const SAVE_AND_DOWNLOAD = 'Save & download the declaration';

  describe('download action state', () => {
    it('keeps its own label and is enabled when nothing is unsaved (mock default)', () => {
      const action = findDownloadAction(component, 'fcUnspentDeclaration', 'download-declaration');
      expect(action?.label).not.toBe(SAVE_AND_DOWNLOAD);
      expect(action?.disabled).toBeFalsy();
    });

    it('switches to "Save & download" while a row amount is unsaved, and back once it is changed back', () => {
      const amountControl = component.unspentUlbData.controls[0].controls.unspentAmount;
      const original = amountControl.value;

      amountControl.setValue((original ?? 0) + 1);
      const changed = findDownloadAction(component, 'fcUnspentDeclaration', 'download-declaration');
      expect(changed?.label).toBe(SAVE_AND_DOWNLOAD);
      expect(changed?.disabled).toBeFalsy();

      amountControl.setValue(original);
      expect(findDownloadAction(component, 'fcUnspentDeclaration', 'download-declaration')?.label).not.toBe(
        SAVE_AND_DOWNLOAD,
      );
    });

    it('switches the No branch\'s action to "Save & download" when the branch was changed without saving', () => {
      isFcUnspentControl(component).setValue('no');

      const action = findDownloadAction(component, 'fcDeclaration', 'download-template');
      expect(action?.label).toBe(SAVE_AND_DOWNLOAD);
      expect(action?.disabled).toBeFalsy();
    });

    it('no longer swaps in a red "save first" explanation', () => {
      component.unspentUlbData.controls[0].controls.unspentAmount.setValue(999);

      const field = component.effectiveVisibleFields().find((f) => f.key === 'fcUnspentDeclaration');
      const block = field?.supportingContent?.find((b) => b.type === 'actions');
      expect(block && block.type === 'actions' ? block.descriptionTone : undefined).toBeUndefined();
    });

    it('is disabled while a draft save is running', () => {
      spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
      spyOn(fcUnspentService, 'saveDraft').and.returnValue(new Subject<void>());

      component.onSubmit('saveAsDraft');

      expect(component.isSavingDraft()).toBeTrue();
      expect(findDownloadAction(component, 'fcUnspentDeclaration', 'download-declaration')?.disabled).toBeTrue();
    });

    it('is disabled when there is something to save but this user cannot save a draft', () => {
      component.canSaveDraft.set(false);
      component.unspentUlbData.controls[0].controls.unspentAmount.setValue(999);

      const action = findDownloadAction(component, 'fcUnspentDeclaration', 'download-declaration');
      expect(action?.disabled).toBeTrue();
      expect(action?.label).not.toBe(SAVE_AND_DOWNLOAD);
    });
  });

  describe('Save & download', () => {
    let downloadSpy: jasmine.Spy;
    let saveDraftSpy: jasmine.Spy;
    let confirmSpy: jasmine.Spy;
    let callOrder: string[];

    const clickYesDownload = () =>
      component.onSupportingAction({ fieldKey: 'fcUnspentDeclaration', actionId: 'download-declaration' });

    beforeEach(() => {
      callOrder = [];
      downloadSpy = spyOn(fcUnspentService, 'downloadDeclarationDocument').and.callFake(() => {
        callOrder.push('download');
        return of({ blob: new Blob(), fileName: null });
      });
      saveDraftSpy = spyOn(fcUnspentService, 'saveDraft').and.callFake(() => {
        callOrder.push('save');
        return of(undefined);
      });
      confirmSpy = spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
      spyOn(FileSaver, 'saveAs');
    });

    it('downloads straight away, without saving, when nothing has changed', () => {
      clickYesDownload();

      expect(saveDraftSpy).not.toHaveBeenCalled();
      expect(downloadSpy).toHaveBeenCalledOnceWith('state-test-id', 'year-test-id');
    });

    it('saves the draft first and downloads after it, with no confirm dialog, when a ULB amount changed', () => {
      component.unspentUlbData.controls[0].controls.unspentAmount.setValue(2);

      clickYesDownload();

      expect(callOrder).toEqual(['save', 'download']);
      expect(confirmSpy).not.toHaveBeenCalled();
      // What is saved is exactly what is on screen, so the document generated afterwards matches it.
      const payload = saveDraftSpy.calls.mostRecent().args[0] as FcUnspentSavePayload;
      expect(payload.data.unspentUlbData?.[0].unspentAmount).toBe(2);
    });

    it('downloads exactly once after saving, even though the saved form reloads', () => {
      component.unspentUlbData.controls[0].controls.unspentAmount.setValue(2);

      clickYesDownload();

      expect(getFormSpy).toHaveBeenCalledTimes(2);
      expect(downloadSpy).toHaveBeenCalledTimes(1);
    });

    it('No branch: saves the branch change, then downloads the nil declaration', () => {
      isFcUnspentControl(component).setValue('no');

      component.onSupportingAction({ fieldKey: 'fcDeclaration', actionId: 'download-template' });

      expect(callOrder).toEqual(['save', 'download']);
      expect((saveDraftSpy.calls.mostRecent().args[0] as FcUnspentSavePayload).data.isFcUnspent).toBeFalse();
    });

    it('downloads nothing when the save fails, and reports the failed save', () => {
      saveDraftSpy.and.returnValue(throwError(() => new Error('save failed')));
      component.unspentUlbData.controls[0].controls.unspentAmount.setValue(2);

      clickYesDownload();

      expect(downloadSpy).not.toHaveBeenCalled();
    });

    it('neither saves nor downloads when a ULB row fails validation', () => {
      const snackbarSpy = spyOn(utilityService, 'triggerSnackbar');
      component.unspentUlbData.controls[0].controls.unspentAmount.setValue(0);

      clickYesDownload();

      expect(saveDraftSpy).not.toHaveBeenCalled();
      expect(downloadSpy).not.toHaveBeenCalled();
      expect(snackbarSpy).toHaveBeenCalledWith(jasmine.any(String), 'snackbar-danger');
    });

    it('neither saves nor downloads while a ULB still has an empty amount, and flags the empty fields', () => {
      const snackbarSpy = spyOn(utilityService, 'triggerSnackbar');
      const row = component.unspentUlbData.controls[1];
      row.controls.unspentAmount.setValue(null);
      row.controls.previousFcUnspentBalance.setValue(null);

      clickYesDownload();

      expect(saveDraftSpy).not.toHaveBeenCalled();
      expect(downloadSpy).not.toHaveBeenCalled();
      expect(snackbarSpy).toHaveBeenCalledWith(
        'Enter the unspent and previous balances for every ULB before downloading the declaration.',
        'snackbar-danger',
      );
      expect(row.controls.unspentAmount.touched).toBeTrue();
      expect(row.controls.previousFcUnspentBalance.touched).toBeTrue();
    });

    it('ignores a second click while the save is still running', () => {
      const pendingSave = new Subject<void>();
      saveDraftSpy.and.returnValue(pendingSave);
      component.unspentUlbData.controls[0].controls.unspentAmount.setValue(2);

      clickYesDownload();
      clickYesDownload();
      expect(saveDraftSpy).toHaveBeenCalledTimes(1);
      expect(downloadSpy).not.toHaveBeenCalled();

      pendingSave.next();
      pendingSave.complete();
      expect(downloadSpy).toHaveBeenCalledTimes(1);
    });

    it('does nothing when there is something to save but this user cannot save a draft', () => {
      component.canSaveDraft.set(false);
      component.unspentUlbData.controls[0].controls.unspentAmount.setValue(2);

      clickYesDownload();

      expect(saveDraftSpy).not.toHaveBeenCalled();
      expect(downloadSpy).not.toHaveBeenCalled();
    });
  });

  // ─── Saved ULB rows that are still missing amounts (a draft keeps a ULB-only row) ────────────

  describe('saved ULB rows that are still missing amounts', () => {
    const INCOMPLETE_ROWS_DATA: FcUnspentDeclarationData = {
      ...DEFAULT_PREVIEW_DATA,
      unspentUlbData: [
        UNSPENT_ULB_ROWS[0],
        {
          ...UNSPENT_ULB_ROWS[1],
          unspentAmount: null,
          previousFcUnspentBalance: null,
          allocationPerc: null,
          eligibility: false,
        },
      ],
    };

    let incomplete: FcUnspentDeclarationComponent;

    beforeEach(() => {
      incomplete = createComponentForScenario(INCOMPLETE_ROWS_DATA).componentInstance;
    });

    it('hydrates the empty amounts as null in the row controls and keeps the ULB selected', () => {
      const row = incomplete.unspentUlbData.controls[1];
      expect(row.controls.ulbId.value).toBe('66a000000000000000000002');
      expect(row.controls.unspentAmount.value).toBeNull();
      expect(row.controls.previousFcUnspentBalance.value).toBeNull();
    });

    it('is not an unsaved change on load, and becomes one once an amount is entered', () => {
      expect(incomplete.hasUnsavedRowChanges()).toBeFalse();
      expect(incomplete.hasUnsavedChanges()).toBeFalse();

      incomplete.unspentUlbData.controls[1].controls.unspentAmount.setValue(5);
      expect(incomplete.hasUnsavedRowChanges()).toBeTrue();

      incomplete.unspentUlbData.controls[1].controls.unspentAmount.setValue(null);
      expect(incomplete.hasUnsavedRowChanges()).toBeFalse();
    });

    it('reports an unsaved change when a saved ULB-only row is removed', () => {
      incomplete.unspentUlbData.removeAt(1);
      expect(incomplete.hasUnsavedRowChanges()).toBeTrue();
    });

    it('does not request the document while a ULB lacks its amounts, and tells the user why', () => {
      const downloadSpy = spyOn(fcUnspentService, 'downloadDeclarationDocument');
      const snackbarSpy = spyOn(utilityService, 'triggerSnackbar');

      incomplete.onSupportingAction({ fieldKey: 'fcUnspentDeclaration', actionId: 'download-declaration' });

      expect(downloadSpy).not.toHaveBeenCalled();
      expect(snackbarSpy).toHaveBeenCalledWith(
        jasmine.stringContaining('Enter the unspent and previous'),
        'snackbar-danger',
      );
      expect(incomplete.unspentUlbData.controls[1].controls.unspentAmount.touched).toBeTrue();
    });
  });

  describe('design-year policy (Devolution-linked vs independent)', () => {
    const subtitle = (f: ComponentFixture<FcUnspentDeclarationComponent>): string =>
      (f.debugElement.query(By.css('.page-subtitle')).nativeElement as HTMLElement).textContent!.replace(/\s+/g, ' ');

    it('defaults to the Devolution-linked percent rule when the backend sends no policy', () => {
      expect(component.showAllocation()).toBeTrue();
      expect(component.noUnspentAllowed()).toBeFalse();
      expect(subtitle(fixture)).toContain('must not exceed 10% of the ULB');
    });

    it('independent 14th-FC year: hides allocation, states that any unspent balance makes a ULB ineligible', () => {
      const independent: FcUnspentDeclarationData = {
        ...FC_UNSPENT_SCENARIO_DEVOLUTION_UNDER_REVIEW,
        threshold: 0,
        policy: { devolutionLinked: false, eligibilityRule: { type: 'NO_UNSPENT_ALLOWED' } },
        // No Devolution form exists in these years, and nothing blocks editing.
        dependency: {
          devolutionStatus: null,
          devolutionDatasetExists: false,
          editableDueToDevolutionReturn: false,
          blockingMessage: null,
        },
      };
      const scenario = createComponentForScenario(independent);

      expect(scenario.componentInstance.showAllocation()).toBeFalse();
      expect(scenario.componentInstance.noUnspentAllowed()).toBeTrue();
      expect(subtitle(scenario)).toContain('still holds any unspent 14th Finance Commission balance is not eligible');
      expect(subtitle(scenario)).not.toContain('must not exceed');
      expect(scenario.debugElement.query(By.css('[data-cy="fc-unspent-declaration-dependency-alert"]'))).toBeNull();

      const table = scenario.debugElement.query(By.directive(UnspentUlbTableComponent))
        .componentInstance as UnspentUlbTableComponent;
      expect(table.showAllocation()).toBeFalse();
    });

    it('a linked 15th-FC year keeps the allocation column and the percent wording', () => {
      const linked: FcUnspentDeclarationData = {
        ...FC_UNSPENT_SCENARIO_DEVOLUTION_UNDER_REVIEW,
        applicableFc: '15TH_FC',
        threshold: 10,
        policy: {
          devolutionLinked: true,
          eligibilityRule: { type: 'MAX_PERCENT_OF_ALLOCATION', thresholdPercent: 10 },
        },
      };
      const scenario = createComponentForScenario(linked);

      expect(scenario.componentInstance.showAllocation()).toBeTrue();
      expect(subtitle(scenario)).toContain('must not exceed 10% of the ULB');
      const table = scenario.debugElement.query(By.directive(UnspentUlbTableComponent))
        .componentInstance as UnspentUlbTableComponent;
      expect(table.showAllocation()).toBeTrue();
    });
  });

  describe('savedUnspentUlbData synthetic control (follows the ULBs picked in the table)', () => {
    const emptyYesScenario: FcUnspentDeclarationData = {
      ...FC_UNSPENT_SCENARIO_DEVOLUTION_UNDER_REVIEW,
      unspentUlbData: [],
    };

    const newRow = (ulbId: string) =>
      new FormGroup({
        ulbId: new FormControl<string | null>(ulbId),
        unspentAmount: new FormControl<number | null>(null),
        previousFcUnspentBalance: new FormControl<number | null>(null),
      });

    it('initializes from the ULBs in the GET response', () => {
      expect(getFormControl<{ ulbId: string }[]>(component, 'savedUnspentUlbData').value).toEqual(
        UNSPENT_ULB_ROWS.map((row) => ({ ulbId: row.ulbId })),
      );
    });

    it('shows fcUnspentDeclaration when isFcUnspent is yes and ULBs are present (mock default)', () => {
      expect(component.fields().find((f) => f.key === 'fcUnspentDeclaration')?.hidden).toBeFalse();
    });

    it('hides fcUnspentDeclaration when isFcUnspent is yes but no ULB has been picked yet', () => {
      const scenarioComponent = createComponentForScenario(emptyYesScenario).componentInstance;

      expect(getFormControl<unknown[]>(scenarioComponent, 'savedUnspentUlbData').value).toEqual([]);
      expect(scenarioComponent.fields().find((f) => f.key === 'fcUnspentDeclaration')?.hidden).toBeTrue();
      expect(scenarioComponent.effectiveVisibleFields().some((f) => f.key === 'fcUnspentDeclaration')).toBeFalse();
    });

    it('shows fcUnspentDeclaration as soon as a ULB is picked, before anything is saved', () => {
      const scenarioComponent = createComponentForScenario(emptyYesScenario).componentInstance;

      scenarioComponent.unspentUlbData.push(newRow(UNSPENT_ULB_ROWS[0].ulbId));

      expect(scenarioComponent.fields().find((f) => f.key === 'fcUnspentDeclaration')?.hidden).toBeFalse();
      expect(scenarioComponent.effectiveVisibleFields().some((f) => f.key === 'fcUnspentDeclaration')).toBeTrue();
    });

    it('hides it again once the last ULB is removed', () => {
      const scenarioComponent = createComponentForScenario(emptyYesScenario).componentInstance;
      scenarioComponent.unspentUlbData.push(newRow(UNSPENT_ULB_ROWS[0].ulbId));

      scenarioComponent.unspentUlbData.removeAt(0);

      expect(scenarioComponent.fields().find((f) => f.key === 'fcUnspentDeclaration')?.hidden).toBeTrue();
    });

    it('is not re-evaluated by amount edits, only when the set of picked ULBs changes', () => {
      const control = getFormControl<{ ulbId: string }[]>(component, 'savedUnspentUlbData');
      const before = control.value;

      component.unspentUlbData.controls[0].controls.unspentAmount.setValue(7);
      expect(control.value).toBe(before);

      component.unspentUlbData.push(newRow('66a000000000000000000009'));
      expect(control.value).not.toBe(before);
      expect(control.value.map((row) => row.ulbId)).toContain('66a000000000000000000009');
    });

    it('does not mark the form dirty by itself (only the user changing something does)', () => {
      const scenarioComponent = createComponentForScenario(emptyYesScenario).componentInstance;

      scenarioComponent.unspentUlbData.push(newRow(UNSPENT_ULB_ROWS[0].ulbId));

      expect(getFormControl<unknown[]>(scenarioComponent, 'savedUnspentUlbData').dirty).toBeFalse();
    });

    it('hides fcUnspentDeclaration on the No branch (unaffected — driven by the unchanged isFcUnspent condition)', () => {
      const scenarioComponent = createComponentForScenario(NO_BRANCH_PREVIEW_DATA).componentInstance;
      expect(scenarioComponent.fields().find((f) => f.key === 'fcUnspentDeclaration')?.hidden).toBeTrue();
    });
  });

  describe('old "save your draft to unlock the upload" alert', () => {
    it('is gone: nothing prompts the user to save before the upload field, with or without ULBs', () => {
      const emptyYes = createComponentForScenario({
        ...FC_UNSPENT_SCENARIO_DEVOLUTION_UNDER_REVIEW,
        unspentUlbData: [],
      });
      emptyYes.detectChanges();

      expect(emptyYes.debugElement.query(By.css('[data-cy="fc-unspent-declaration-save-prompt"]'))).toBeNull();
      expect(fixture.debugElement.query(By.css('[data-cy="fc-unspent-declaration-save-prompt"]'))).toBeNull();
    });
  });

  describe('download error display (routes through the same applyApiErrors path as submit)', () => {
    let downloadSpy: jasmine.Spy;

    beforeEach(() => {
      downloadSpy = spyOn(fcUnspentService, 'downloadDeclarationDocument');
    });

    it('shows a _form (branchNotChosen) error in formLevelErrors, not just a snackbar', async () => {
      downloadSpy.and.returnValue(
        throwError(() =>
          blobApiErrorResponse('Validation failed.', {
            _form: [{ message: 'Answer whether any ULBs have unspent balance...', code: 'branchNotChosen' }],
          }),
        ),
      );

      component.onSupportingAction({ fieldKey: 'fcUnspentDeclaration', actionId: 'download-declaration' });
      await waitUntil(() => component.formLevelErrors().length > 0);

      expect(component.formLevelErrors()).toEqual(['Answer whether any ULBs have unspent balance...']);
    });

    it('shows a field-keyed (noRows) error below the fcUnspentDeclaration field, not just a snackbar', async () => {
      downloadSpy.and.returnValue(
        throwError(() =>
          blobApiErrorResponse('Validation failed.', {
            fcUnspentDeclaration: [{ field: 'fcUnspentDeclaration', code: 'noRows', message: 'No ULB rows found...' }],
          }),
        ),
      );

      component.onSupportingAction({ fieldKey: 'fcUnspentDeclaration', actionId: 'download-declaration' });
      const control = getFormControl<unknown>(component, 'fcUnspentDeclaration');
      await waitUntil(() => !!control.errors?.['noRows']);

      expect(control.errors?.['noRows']).toBeTrue();
      const field = component.fields().find((f) => f.key === 'fcUnspentDeclaration');
      expect(field?.validations?.some((v) => v.name === 'noRows' && v.message === 'No ULB rows found...')).toBeTrue();
    });

    it('the noRows message wins over the pre-existing required validation when both are present (ordering fix)', async () => {
      // fcUnspentDeclaration has no file set in this fixture, so `required` is already in
      // control.errors before the download is even attempted — the exact scenario from the bug
      // report (Yes branch, zero rows, file not yet uploaded).
      const control = getFormControl<unknown>(component, 'fcUnspentDeclaration');
      expect(control.errors?.['required']).toBeTrue();

      downloadSpy.and.returnValue(
        throwError(() =>
          blobApiErrorResponse('Validation failed.', {
            fcUnspentDeclaration: [{ field: 'fcUnspentDeclaration', code: 'noRows', message: 'No ULB rows found...' }],
          }),
        ),
      );

      component.onSupportingAction({ fieldKey: 'fcUnspentDeclaration', actionId: 'download-declaration' });
      await waitUntil(() => !!control.errors?.['noRows']);

      expect(control.errors?.['required']).toBeTrue();
      expect(control.errors?.['noRows']).toBeTrue();
      const field = component.fields().find((f) => f.key === 'fcUnspentDeclaration')!;
      const noRowsIdx = field.validations!.findIndex((v) => v.name === 'noRows');
      const requiredIdx = field.validations!.findIndex((v) => v.name === 'required');
      expect(noRowsIdx).toBeGreaterThanOrEqual(0);
      expect(requiredIdx).toBeGreaterThanOrEqual(0);
      expect(noRowsIdx).toBeLessThan(requiredIdx);
    });

    it('clears a stale error from a previous failed download once a new download attempt starts', async () => {
      downloadSpy.and.returnValue(
        throwError(() =>
          blobApiErrorResponse('Validation failed.', { _form: [{ message: 'stale error', code: 'branchNotChosen' }] }),
        ),
      );
      component.onSupportingAction({ fieldKey: 'fcUnspentDeclaration', actionId: 'download-declaration' });
      await waitUntil(() => component.formLevelErrors().length > 0);
      expect(component.formLevelErrors()).toEqual(['stale error']);

      downloadSpy.and.returnValue(of({ blob: new Blob(), fileName: null }));
      component.onSupportingAction({ fieldKey: 'fcUnspentDeclaration', actionId: 'download-declaration' });
      await waitUntil(() => component.formLevelErrors().length === 0);
      expect(component.formLevelErrors()).toEqual([]);
    });
  });

  describe('download error display — non-Blob error shape (network-level failure fallback)', () => {
    // `parseBlobErrorResponse` falls back to `extractApiErrorResponse(err)` when `err.error` isn't a
    // `Blob` at all (e.g. a genuine network-level failure where no response body was ever received) —
    // covers that branch explicitly, distinct from the real-transport Blob-body tests above.
    it('still shows the fallback message when err.error is not a Blob', async () => {
      const downloadSpy = spyOn(fcUnspentService, 'downloadDeclarationDocument').and.returnValue(
        throwError(() => new Error('Network failure')),
      );
      const snackbarSpy = spyOn(utilityService, 'triggerSnackbar');

      component.onSupportingAction({ fieldKey: 'fcUnspentDeclaration', actionId: 'download-declaration' });
      await waitUntil(() => snackbarSpy.calls.count() > 0);

      expect(downloadSpy).toHaveBeenCalled();
      expect(snackbarSpy).toHaveBeenCalledWith('Failed to download the declaration document.', 'snackbar-danger');
    });
  });

  // ─── hasUnsavedChanges (read by unsavedChangesGuard / beforeunload) ────────

  describe('hasUnsavedChanges', () => {
    it('is false right after the form loads', () => {
      expect(component.hasUnsavedChanges()).toBeFalse();
    });

    it('is true once the user edits a field', () => {
      isFcUnspentControl(component).markAsDirty();

      expect(component.hasUnsavedChanges()).toBeTrue();
    });

    it('is false when the form is dirty but the page is read-only (canEdit is false)', () => {
      component.canEdit.set(false);
      component.form.markAsDirty();

      expect(component.hasUnsavedChanges()).toBeFalse();
    });
  });
});
