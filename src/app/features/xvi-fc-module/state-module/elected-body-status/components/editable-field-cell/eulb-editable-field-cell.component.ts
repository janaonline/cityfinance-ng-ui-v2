import { CommonModule, formatDate } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  Output,
  inject,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { EulbBodyStatus, EulbFieldCellKey } from '../../eulb-status.models';

export interface EulbEditableFieldCellStatusOption {
  readonly value: string;
  readonly label: string;
}

export type EulbEditableFieldCellDataAttribute = 'data-eulb-edit-field' | 'data-eulb-post-edit-field';

export type EulbEditableFieldCellControl =
  | FormControl<string>
  | FormControl<string | null>
  | FormControl<EulbBodyStatus | ''>;

@Component({
  selector: 'td[app-eulb-editable-field-cell]',
  imports: [CommonModule, ReactiveFormsModule],
  hostDirectives: [MatTooltip],
  template: `
    @if (isEditing) {
      @if (fieldEditable && editControl) {
        @switch (field) {
          @case ('electedBodyStatus') {
            <select
              [class]="selectControlClass"
              [class.is-invalid]="cellHasError"
              aria-label="Elected Body Status"
              [attr.aria-invalid]="cellHasError || null"
              [attr.data-eulb-edit-field]="editFieldDataAttribute === 'data-eulb-edit-field' ? field : null"
              [attr.data-eulb-post-edit-field]="editFieldDataAttribute === 'data-eulb-post-edit-field' ? field : null"
              [formControl]="editControl"
            >
              <option value="">- Select -</option>
              @for (option of statusOptions; track optionValue(option)) {
                <option [value]="optionValue(option)">{{ optionLabel(option) }}</option>
              }
            </select>
          }
          @case ('dateOfConstitution') {
            <input
              type="date"
              [class]="inputControlClass"
              [class.is-invalid]="cellHasError"
              [attr.min]="dateMin"
              [attr.max]="dateMax"
              aria-label="Date of Constitution"
              [attr.aria-invalid]="cellHasError || null"
              [attr.data-eulb-edit-field]="editFieldDataAttribute === 'data-eulb-edit-field' ? field : null"
              [attr.data-eulb-post-edit-field]="editFieldDataAttribute === 'data-eulb-post-edit-field' ? field : null"
              [formControl]="editControl"
            />
          }
          @case ('dateOfExpiry') {
            <input
              type="date"
              [class]="inputControlClass"
              [class.is-invalid]="cellHasError"
              [attr.min]="dateMin"
              [attr.max]="dateMax"
              aria-label="Date of Expiry"
              [attr.aria-invalid]="cellHasError || null"
              [attr.data-eulb-edit-field]="editFieldDataAttribute === 'data-eulb-edit-field' ? field : null"
              [attr.data-eulb-post-edit-field]="editFieldDataAttribute === 'data-eulb-post-edit-field' ? field : null"
              [formControl]="editControl"
            />
          }
          @case ('remarks') {
            <input
              type="text"
              [class]="inputControlClass"
              [class.is-invalid]="cellHasError"
              aria-label="Remarks"
              [attr.aria-invalid]="cellHasError || null"
              placeholder="Remarks"
              [attr.data-eulb-edit-field]="editFieldDataAttribute === 'data-eulb-edit-field' ? field : null"
              [attr.data-eulb-post-edit-field]="editFieldDataAttribute === 'data-eulb-post-edit-field' ? field : null"
              [formControl]="editControl"
            />
          }
          @case ('censusCode') {
            <input
              type="text"
              [class]="inputControlClass"
              [class.is-invalid]="cellHasError"
              aria-label="Census Code"
              [attr.aria-invalid]="cellHasError || null"
              placeholder="Census code"
              [attr.data-eulb-edit-field]="editFieldDataAttribute === 'data-eulb-edit-field' ? field : null"
              [attr.data-eulb-post-edit-field]="editFieldDataAttribute === 'data-eulb-post-edit-field' ? field : null"
              [formControl]="editControl"
            />
          }
          @case ('ulbName') {
            <input
              type="text"
              [class]="inputControlClass"
              [class.is-invalid]="cellHasError"
              aria-label="ULB Name"
              [attr.aria-invalid]="cellHasError || null"
              placeholder="ULB name"
              [attr.data-eulb-edit-field]="editFieldDataAttribute === 'data-eulb-edit-field' ? field : null"
              [attr.data-eulb-post-edit-field]="editFieldDataAttribute === 'data-eulb-post-edit-field' ? field : null"
              [formControl]="editControl"
            />
          }
        }
      } @else {
        <span class="small">{{ displayText }}</span>
      }
    } @else {
      <div class="d-flex align-items-center justify-content-between gap-2 w-100">
        <span class="text-truncate min-w-0">{{ displayText }}</span>
        @if (cellHasError) {
          <button
            type="button"
            [class]="errorIconClass"
            [attr.aria-label]="errorAriaLabel"
            (click)="$event.stopPropagation()"
          >
            <i class="bi bi-exclamation-triangle-fill"></i>
          </button>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EulbEditableFieldCellComponent implements OnChanges {
  private readonly tooltip = inject(MatTooltip, { self: true });

  @Input({ required: true }) field!: EulbFieldCellKey;
  @Input() value: string | null | undefined = null;
  @Input() isEditing = false;
  @Input() canEdit = false;
  @Input() fieldEditable = true;
  @Input() fieldEnabled = true;
  @Input() cellHasError = false;
  @Input() cellErrorText: string | null | undefined = null;
  @Input() disabledReason = '';
  @Input() dateMin: string | null = null;
  @Input() dateMax: string | null = null;
  @Input() statusOptions: readonly (string | EulbEditableFieldCellStatusOption)[] = [];
  @Input() editControl: EulbEditableFieldCellControl | null = null;
  @Input() editControlExtraClass = '';
  @Input() errorIconExtraClass = '';
  @Input() editFieldDataAttribute: EulbEditableFieldCellDataAttribute = 'data-eulb-edit-field';
  @Input() showInvalidCellClass = false;

  @Output() readonly editRequested = new EventEmitter<EulbFieldCellKey>();

  @HostBinding('class.cursor-pointer')
  get isClickable(): boolean {
    return !this.isEditing && this.canEdit && this.cellHasError;
  }

  @HostBinding('class.eulb-cell-invalid')
  get hasInvalidCellClass(): boolean {
    return !this.isEditing && this.showInvalidCellClass && this.cellHasError;
  }

  get displayText(): string {
    if (this.isDateField) {
      return this.formatDateValue(this.value);
    }

    const text = this.value?.trim();
    return text ? text : '-';
  }

  get selectControlClass(): string {
    return this.withExtraClass('form-select form-select-sm');
  }

  get inputControlClass(): string {
    return this.withExtraClass('form-control form-control-sm');
  }

  get errorIconClass(): string {
    return this.withExtraClass('btn btn-link btn-sm p-0 text-danger flex-shrink-0', this.errorIconExtraClass);
  }

  get errorAriaLabel(): string {
    switch (this.field) {
      case 'electedBodyStatus':
        return 'Elected body status has a validation error';
      case 'dateOfConstitution':
        return 'Date of constitution has a validation error';
      case 'dateOfExpiry':
        return 'Date of expiry has a validation error';
      case 'remarks':
        return 'Remarks has a validation error';
      case 'censusCode':
        return 'Census code has a validation error';
      case 'ulbName':
        return 'ULB name has a validation error';
    }
  }

  private get isDateField(): boolean {
    return this.field === 'dateOfConstitution' || this.field === 'dateOfExpiry';
  }

  ngOnChanges(): void {
    this.tooltip.message = this.hostTooltipMessage;
    this.tooltip.disabled = this.hostTooltipDisabled;
    this.tooltip.position = 'above';
    this.tooltip.showDelay = 100;
  }

  @HostListener('click')
  requestEdit(): void {
    if (!this.isClickable) return;
    this.editRequested.emit(this.field);
  }

  optionValue(option: string | EulbEditableFieldCellStatusOption): string {
    return typeof option === 'string' ? option : option.value;
  }

  optionLabel(option: string | EulbEditableFieldCellStatusOption): string {
    return typeof option === 'string' ? option : option.label;
  }

  private get hostTooltipMessage(): string {
    if (this.cellHasError) {
      return this.cellErrorText ?? '';
    }

    if (this.hasDisabledDateReason) {
      return this.disabledReason;
    }

    return '';
  }

  private get hostTooltipDisabled(): boolean {
    return !this.cellHasError && !this.hasDisabledDateReason;
  }

  private get hasDisabledDateReason(): boolean {
    return this.isEditing && this.isDateField && !this.fieldEnabled && this.disabledReason.trim().length > 0;
  }

  private formatDateValue(value: string | null | undefined): string {
    if (!value) return '-';

    try {
      return formatDate(value, 'dd MMM yyyy', 'en-IN', '+0530');
    } catch {
      return '-';
    }
  }

  private withExtraClass(baseClass: string, extraClass = this.editControlExtraClass): string {
    const trimmedExtraClass = extraClass.trim();
    return trimmedExtraClass ? `${baseClass} ${trimmedExtraClass}` : baseClass;
  }
}
