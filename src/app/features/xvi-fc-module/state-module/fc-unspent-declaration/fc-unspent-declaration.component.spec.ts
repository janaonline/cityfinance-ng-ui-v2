import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
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
import {
  FcUnspentDeclarationData,
  FcUnspentDeclarationTemplate,
  FcUnspentSavePayload,
  FcUnspentUlbData,
} from './fc-unspent-declaration.models';

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
    { ...FC_UNSPENT_DECLARATION_FIELDS[2], value: true },
  ];
}

const UNSPENT_ULB_ROWS: FcUnspentUlbData[] = [
  {
    slNo: 1,
    ulbId: '66a000000000000000000001',
    censusCode: '800123',
    sbCode: null,
    ulbName: 'Sample Municipal Corporation',
    allocationAmount: 20,
    unspentAmount: 1.5,
    allocationPerc: 7.5,
    eligibility: true,
  },
  {
    slNo: 2,
    ulbId: '66a000000000000000000002',
    censusCode: null,
    sbCode: 'SB-0142',
    ulbName: 'Sample Municipal Council',
    allocationAmount: 8,
    unspentAmount: 1.2,
    allocationPerc: 15,
    eligibility: false,
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
      'Devolution Formula was returned by MoHUA for correction. FC Unspent can be edited and saved as a draft, but final submission is blocked until Devolution is resubmitted and accepted.',
  },
  actors: [],
  questions: questionsForYesBranch(),
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
  unspentUlbData: UNSPENT_ULB_ROWS,
};

function previewData(): FcUnspentDeclarationData {
  return DEFAULT_PREVIEW_DATA;
}

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

  it('adds a blank row when switching to yes with an empty array', () => {
    component.unspentUlbData.removeAt(1);
    component.unspentUlbData.removeAt(0);
    isFcUnspentControl(component).setValue('no');
    fixture.detectChanges();

    expect(component.unspentUlbData.length).toBe(0);

    isFcUnspentControl(component).setValue('yes');
    fixture.detectChanges();

    expect(component.unspentUlbData.length).toBe(1);
    expect(component.unspentUlbData.controls[0].controls.ulbId.value).toBeNull();
    expect(component.unspentUlbData.controls[0].controls.unspentAmount.value).toBeNull();
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
      { ulbId: '66a000000000000000000001', unspentAmount: 1.5 },
      { ulbId: '66a000000000000000000002', unspentAmount: 1.2 },
    ]);
  });

  it('drops incomplete rows from the payload instead of sending null ulbId/unspentAmount', () => {
    spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
    const saveDraftSpy = spyOn(fcUnspentService, 'saveDraft').and.returnValue(of(undefined));
    component.unspentUlbData.controls[1].controls.ulbId.setValue(null);

    component.onSubmit('saveAsDraft');

    const payload = saveDraftSpy.calls.mostRecent().args[0] as FcUnspentSavePayload;
    expect(payload.data.unspentUlbData).toEqual([{ ulbId: '66a000000000000000000001', unspentAmount: 1.5 }]);
  });

  it('excludes backend-owned dependency/row-review fields from the payload — only whitelisted keys are sent', () => {
    spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
    const saveDraftSpy = spyOn(fcUnspentService, 'saveDraft').and.returnValue(of(undefined));

    component.onSubmit('saveAsDraft');

    const payload = saveDraftSpy.calls.mostRecent().args[0] as FcUnspentSavePayload;
    const dataKeys = Object.keys(payload.data).sort();
    expect(dataKeys).toEqual(['checkboxConfirmation', 'isFcUnspent', 'unspentUlbData']);
    for (const row of payload.data.unspentUlbData ?? []) {
      expect(Object.keys(row).sort()).toEqual(['ulbId', 'unspentAmount']);
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

    component.onSubmit('finalSubmit');

    expect(getFormSpy).toHaveBeenCalledTimes(2);
  });

  it('does not reload when save fails', () => {
    spyOn(TestBed.inject(ConfirmDialogService), 'confirm').and.returnValue(of(true));
    spyOn(fcUnspentService, 'saveDraft').and.returnValue(throwError(() => new Error('save failed')));

    component.onSubmit('saveAsDraft');

    expect(getFormSpy).toHaveBeenCalledTimes(1);
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

  describe('declaration-template download', () => {
    const template: FcUnspentDeclarationTemplate = {
      fileName: 'FC-Unspent-Declaration.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      url: '/file/download?signature=abc123',
    };

    let getDeclarationTemplateSpy: jasmine.Spy;
    let clickSpy: jasmine.Spy;
    let removeSpy: jasmine.Spy;

    function triggerDownload(): void {
      component.onSupportingAction({ fieldKey: 'fcDeclaration', actionId: 'download-template' });
    }

    /** Spies on `document.createElement` just for this call, returning the real anchor it created
     *  so its `href`/`download`/`rel` can be asserted without letting the click navigate anywhere. */
    function captureCreatedAnchor(): { anchor: HTMLAnchorElement | undefined } {
      const captured: { anchor: HTMLAnchorElement | undefined } = { anchor: undefined };
      const original = document.createElement.bind(document);
      spyOn(document, 'createElement').and.callFake((tagName: string) => {
        const el = original(tagName);
        if (tagName === 'a') captured.anchor = el as HTMLAnchorElement;
        return el;
      });
      return captured;
    }

    beforeEach(() => {
      getDeclarationTemplateSpy = spyOn(fcUnspentService, 'getDeclarationTemplate').and.returnValue(of(template));
      clickSpy = spyOn(HTMLAnchorElement.prototype, 'click');
      removeSpy = spyOn(HTMLAnchorElement.prototype, 'remove');
    });

    it('invokes the service only for the exact fcDeclaration / download-template action', () => {
      triggerDownload();
      expect(getDeclarationTemplateSpy).toHaveBeenCalledWith('state-test-id', 'year-test-id');
    });

    it('ignores an unrelated action id, and ignores the action id on an unrelated field', () => {
      component.onSupportingAction({ fieldKey: 'fcDeclaration', actionId: 'some-other-action' });
      component.onSupportingAction({ fieldKey: 'isFcUnspent', actionId: 'download-template' });

      expect(getDeclarationTemplateSpy).not.toHaveBeenCalled();
    });

    it('blocks the request when stateId is missing', () => {
      localStorage.removeItem('userData');

      triggerDownload();

      expect(getDeclarationTemplateSpy).not.toHaveBeenCalled();
    });

    it('ignores duplicate clicks while a download is already in flight', () => {
      const pending = new Subject<FcUnspentDeclarationTemplate>();
      getDeclarationTemplateSpy.and.returnValue(pending);

      triggerDownload();
      triggerDownload();
      triggerDownload();

      expect(getDeclarationTemplateSpy).toHaveBeenCalledTimes(1);
      pending.next(template);
      pending.complete();
    });

    it('triggers a temporary-anchor download using the backend filename, with rel=noopener', () => {
      const captured = captureCreatedAnchor();

      triggerDownload();

      expect(captured.anchor?.download).toBe(template.fileName);
      expect(captured.anchor?.rel).toBe('noopener');
      expect(captured.anchor?.href).toContain('/file/download?signature=abc123');
      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(removeSpy).toHaveBeenCalledTimes(1);
    });

    it('accepts a same-origin URL whose path ends with /file/download behind a versioned API prefix', () => {
      getDeclarationTemplateSpy.and.returnValue(
        of({ ...template, url: `${window.location.origin}/api/v2/file/download?signature=xyz` }),
      );

      triggerDownload();

      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it('accepts the real backend shape: a different-origin URL with a versioned API prefix', () => {
      getDeclarationTemplateSpy.and.returnValue(
        of({ ...template, url: 'http://localhost:3000/api/v2/file/download?signature=K6VpsJ-K8-q9_oqSvZgpn' }),
      );

      triggerDownload();

      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it('sanitizes path separators and control characters out of an unsafe filename', () => {
      const captured = captureCreatedAnchor();
      getDeclarationTemplateSpy.and.returnValue(of({ ...template, fileName: '../../evilname.docx' }));

      triggerDownload();

      expect(captured.anchor?.download).toBe('....evilname.docx');
    });

    it('falls back to the default filename when the backend name is empty', () => {
      const captured = captureCreatedAnchor();
      getDeclarationTemplateSpy.and.returnValue(of({ ...template, fileName: '   ' }));

      triggerDownload();

      expect(captured.anchor?.download).toBe('FC-Unspent-Declaration.docx');
    });

    it('does not change a normal filename, including its extension', () => {
      const captured = captureCreatedAnchor();

      triggerDownload();

      expect(captured.anchor?.download).toBe('FC-Unspent-Declaration.docx');
    });

    it('shows the generic fallback message and does not download when the URL is unsafe', () => {
      const snackbarSpy = spyOn(utilityService, 'triggerSnackbar');
      getDeclarationTemplateSpy.and.returnValue(of({ ...template, url: 'https://evil.example.com/file' }));

      triggerDownload();

      expect(clickSpy).not.toHaveBeenCalled();
      expect(snackbarSpy).toHaveBeenCalledWith('Failed to download the declaration template.', 'snackbar-danger');
    });

    it('shows the generic fallback message and does not download when the URL is empty', () => {
      const snackbarSpy = spyOn(utilityService, 'triggerSnackbar');
      getDeclarationTemplateSpy.and.returnValue(of({ ...template, url: '' }));

      triggerDownload();

      expect(clickSpy).not.toHaveBeenCalled();
      expect(snackbarSpy).toHaveBeenCalledWith('Failed to download the declaration template.', 'snackbar-danger');
    });

    it('shows the backend error message on a service-thrown success:false failure', () => {
      const snackbarSpy = spyOn(utilityService, 'triggerSnackbar');
      getDeclarationTemplateSpy.and.returnValue(
        throwError(() => ({ success: false, message: 'Template not configured.' })),
      );

      triggerDownload();

      expect(snackbarSpy).toHaveBeenCalledWith('Template not configured.', 'snackbar-danger');
    });

    it('shows the backend error message on an HttpErrorResponse-shaped failure', () => {
      const snackbarSpy = spyOn(utilityService, 'triggerSnackbar');
      getDeclarationTemplateSpy.and.returnValue(
        throwError(() => ({ error: { statusCode: 500, message: 'Server error.' } })),
      );

      triggerDownload();

      expect(snackbarSpy).toHaveBeenCalledWith('Server error.', 'snackbar-danger');
    });

    it('shows the generic fallback message when no backend message is available', () => {
      const snackbarSpy = spyOn(utilityService, 'triggerSnackbar');
      getDeclarationTemplateSpy.and.returnValue(throwError(() => new Error('network error')));

      triggerDownload();

      expect(snackbarSpy).toHaveBeenCalledWith('Failed to download the declaration template.', 'snackbar-danger');
    });

    it('resets isDownloadingTemplate after a successful download', () => {
      triggerDownload();
      expect(component.isDownloadingTemplate()).toBe(false);
    });

    it('resets isDownloadingTemplate after a failed download', () => {
      getDeclarationTemplateSpy.and.returnValue(throwError(() => new Error('network error')));
      triggerDownload();
      expect(component.isDownloadingTemplate()).toBe(false);
    });

    it('leaves form values unchanged and never reloads the form after a download (success or failure)', () => {
      isFcUnspentControl(component).setValue('no');
      fixture.detectChanges();
      const fcDeclarationBefore = getFormControl<unknown>(component, 'fcDeclaration').value;

      triggerDownload();
      expect(getFormControl<unknown>(component, 'fcDeclaration').value).toEqual(fcDeclarationBefore);
      expect(getFormSpy).toHaveBeenCalledTimes(1);

      getDeclarationTemplateSpy.and.returnValue(throwError(() => new Error('network error')));
      triggerDownload();
      expect(getFormControl<unknown>(component, 'fcDeclaration').value).toEqual(fcDeclarationBefore);
      expect(getFormSpy).toHaveBeenCalledTimes(1);
    });
  });
});
