import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import {
  EulbEditableFieldCellComponent,
  EulbEditableFieldCellDataAttribute,
  EulbEditableFieldCellStatusOption,
} from './eulb-editable-field-cell.component';
import { EulbBodyStatus, EulbFieldCellKey } from '../../eulb-status.models';

@Component({
  imports: [ReactiveFormsModule, EulbEditableFieldCellComponent],
  template: `
    <table>
      <tbody>
        <tr>
          <td
            app-eulb-editable-field-cell
            class="small"
            [field]="field"
            [value]="value"
            [isEditing]="isEditing"
            [canEdit]="canEdit"
            [fieldEditable]="fieldEditable"
            [fieldEnabled]="fieldEnabled"
            [cellHasError]="cellHasError"
            [cellErrorText]="cellErrorText"
            [disabledReason]="disabledReason"
            [dateMin]="dateMin"
            [dateMax]="dateMax"
            [statusOptions]="statusOptions"
            [editControl]="editControl"
            [editFieldDataAttribute]="editFieldDataAttribute"
            [showInvalidCellClass]="showInvalidCellClass"
            (editRequested)="requestedField = $event"
          ></td>
        </tr>
      </tbody>
    </table>
  `,
})
class HostComponent {
  field: EulbFieldCellKey = 'remarks';
  value: string | null = 'Needs review';
  isEditing = false;
  canEdit = false;
  fieldEditable = true;
  fieldEnabled = true;
  cellHasError = false;
  cellErrorText = '';
  disabledReason = '';
  dateMin: string | null = null;
  dateMax: string | null = null;
  statusOptions: readonly (string | EulbEditableFieldCellStatusOption)[] = [];
  editControl: FormControl<string | null> | FormControl<EulbBodyStatus | ''> | null = new FormControl<string | null>(
    '',
  );
  editFieldDataAttribute: EulbEditableFieldCellDataAttribute = 'data-eulb-edit-field';
  showInvalidCellClass = false;
  requestedField: EulbFieldCellKey | null = null;
}

describe('EulbEditableFieldCellComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
  });

  it('renders read-mode text', () => {
    host.value = 'Plain remarks';
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Plain remarks');
  });

  it('renders an edit-mode select for electedBodyStatus', () => {
    host.field = 'electedBodyStatus';
    host.isEditing = true;
    host.editControl = new FormControl<EulbBodyStatus | ''>('Constituted');
    host.statusOptions = [
      { value: 'Constituted', label: 'Constituted' },
      { value: 'Not Constituted', label: 'Not Constituted' },
    ];
    fixture.detectChanges();

    const select = fixture.debugElement.query(By.css('select[aria-label="Elected Body Status"]'));
    const options = fixture.debugElement
      .queryAll(By.css('select[aria-label="Elected Body Status"] option'))
      .map((option) => option.nativeElement.textContent.trim());

    expect(select).not.toBeNull();
    expect(options).toEqual(['- Select -', 'Constituted', 'Not Constituted']);
  });

  it('renders an edit-mode date input with min and max', () => {
    host.field = 'dateOfConstitution';
    host.isEditing = true;
    host.editControl = new FormControl<string | null>('2026-01-01');
    host.dateMin = '2025-01-01';
    host.dateMax = '2027-01-01';
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input[type="date"]'));
    expect(input.nativeElement.getAttribute('min')).toBe('2025-01-01');
    expect(input.nativeElement.getAttribute('max')).toBe('2027-01-01');
  });

  it('renders an edit-mode remarks input', () => {
    host.field = 'remarks';
    host.isEditing = true;
    host.editControl = new FormControl<string | null>('Updated remarks');
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input[aria-label="Remarks"]'));
    expect(input).not.toBeNull();
    expect(input.nativeElement.getAttribute('placeholder')).toBe('Remarks');
  });

  it('renders the error icon and exposes the error tooltip message', () => {
    host.canEdit = true;
    host.cellHasError = true;
    host.cellErrorText = 'Remarks are required.';
    host.showInvalidCellClass = true;
    fixture.detectChanges();

    const icon = fixture.debugElement.query(By.css('button[aria-label="Remarks has a validation error"]'));
    const tooltip = fixture.debugElement.query(By.directive(EulbEditableFieldCellComponent)).injector.get(MatTooltip);

    expect(icon).not.toBeNull();
    expect(tooltip.message).toBe('Remarks are required.');
    expect(tooltip.disabled).toBeFalse();
    expect(fixture.debugElement.query(By.css('td')).classes['eulb-cell-invalid']).toBeTrue();
  });

  it('keeps the host cell as the only tooltip source for invalid editable select cells', () => {
    host.field = 'electedBodyStatus';
    host.isEditing = true;
    host.cellHasError = true;
    host.cellErrorText = 'Elected Body Status is required.';
    host.editControl = new FormControl<EulbBodyStatus | ''>('');
    fixture.detectChanges();

    const cell = fixture.debugElement.query(By.css('td[app-eulb-editable-field-cell]'));
    const select = fixture.debugElement.query(By.css('select[aria-label="Elected Body Status"]'));
    const tooltips = getTooltipSources(cell);

    expect(select).not.toBeNull();
    expect(tooltips).toHaveSize(1);
    expect(tooltips[0].message).toBe('Elected Body Status is required.');
    expect(tooltips[0].disabled).toBeFalse();
  });

  it('keeps the host cell as the only tooltip source for invalid editable date cells', () => {
    host.field = 'dateOfConstitution';
    host.isEditing = true;
    host.cellHasError = true;
    host.cellErrorText = 'Date of Constitution is required.';
    host.editControl = new FormControl<string | null>('');
    fixture.detectChanges();

    const cell = fixture.debugElement.query(By.css('td[app-eulb-editable-field-cell]'));
    const input = fixture.debugElement.query(By.css('input[aria-label="Date of Constitution"]'));
    const tooltips = getTooltipSources(cell);

    expect(input).not.toBeNull();
    expect(tooltips).toHaveSize(1);
    expect(tooltips[0].message).toBe('Date of Constitution is required.');
    expect(tooltips[0].disabled).toBeFalse();
  });

  it('exposes the disabled date tooltip reason', () => {
    host.field = 'dateOfExpiry';
    host.isEditing = true;
    host.fieldEnabled = false;
    host.disabledReason = 'Disabled until status is Constituted.';
    host.editControl = new FormControl<string | null>('');
    fixture.detectChanges();

    const tooltip = fixture.debugElement.query(By.directive(EulbEditableFieldCellComponent)).injector.get(MatTooltip);
    expect(tooltip.message).toBe('Disabled until status is Constituted.');
    expect(tooltip.disabled).toBeFalse();
  });

  it('emits an edit request when an editable errored read cell is clicked', () => {
    host.canEdit = true;
    host.cellHasError = true;
    fixture.detectChanges();

    fixture.debugElement.query(By.css('td')).triggerEventHandler('click');

    expect(host.requestedField).toBe('remarks');
  });

  it('preserves the requested edit field data attribute on the rendered control', () => {
    host.field = 'dateOfExpiry';
    host.isEditing = true;
    host.editControl = new FormControl<string | null>('');
    host.editFieldDataAttribute = 'data-eulb-post-edit-field';
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input[aria-label="Date of Expiry"]'));
    expect(input.nativeElement.getAttribute('data-eulb-post-edit-field')).toBe('dateOfExpiry');
    expect(input.nativeElement.hasAttribute('data-eulb-edit-field')).toBeFalse();
  });

  it('renders an edit-mode text input for censusCode', () => {
    host.field = 'censusCode';
    host.isEditing = true;
    host.editControl = new FormControl<string | null>('ABC001');
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input[aria-label="Census Code"]'));
    expect(input).not.toBeNull();
    expect(input.nativeElement.getAttribute('placeholder')).toBe('Census code');
  });

  it('renders an edit-mode text input for ulbName', () => {
    host.field = 'ulbName';
    host.isEditing = true;
    host.editControl = new FormControl<string | null>('New ULB');
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input[aria-label="ULB Name"]'));
    expect(input).not.toBeNull();
    expect(input.nativeElement.getAttribute('placeholder')).toBe('ULB name');
  });

  it('returns the correct aria label for censusCode errors', () => {
    host.field = 'censusCode';
    host.canEdit = true;
    host.cellHasError = true;
    host.cellErrorText = 'Census code is invalid.';
    fixture.detectChanges();

    const icon = fixture.debugElement.query(By.css('button[aria-label="Census code has a validation error"]'));
    expect(icon).not.toBeNull();
  });

  function getTooltipSources(cell: DebugElement): MatTooltip[] {
    const sources = new Set<MatTooltip>([cell.injector.get(MatTooltip)]);
    for (const tooltipElement of cell.queryAll(By.directive(MatTooltip))) {
      sources.add(tooltipElement.injector.get(MatTooltip));
    }
    return [...sources];
  }
});
