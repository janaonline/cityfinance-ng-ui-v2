import { NgTemplateOutlet } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { SignedUrlDirective } from '../../../../core/directives/storage-url.directive';
import { MaterialModule } from '../../../../material.module';
import { FieldConfig } from '../../field.interface';
import { normalizeUploadedFileMetadata } from '../file/file-metadata.types';

/** Em dash used as the empty-value placeholder across all field types. */
const EMPTY = '—';

/** Resolved file metadata for template rendering. */
type FileViewModel = {
  name: string;
  sizeLabel: string | null;
  viewUrl: string | null;
};

/** One cell in the readonly table. */
type TableCellView = { colKey: string; displayValue: string };

/** One row in the readonly table. */
type TableRowView = { rowKey: string; rowLabel: string; cells: TableCellView[] };

/** Narrow view of the entries inside `FieldConfig.data` used during table rendering. */
type TableRowConfig = {
  key: string;
  label: string;
  year?: Array<{ key: string }>;
};

/**
 * Renders a single dynamic-form field in readonly view mode.
 * Reads its value from the parent `FormGroup` but never mutates it.
 * Validation errors are never shown.
 */
@Component({
  selector: 'app-dynamic-field-view',
  imports: [NgTemplateOutlet, MaterialModule, SignedUrlDirective],
  template: `
    @if (normalizedType !== 'button') {
      @if (isCertificationField) {
        <!-- Full-width block for checkbox/requiredTrue declaration fields. -->
        <!-- The declaration text is too long to be squeezed into a label column. -->
        <div>
          @if (!field.hideLabel && field.label) {
            <p class="fw-semibold mb-2 custom-font-size-6">
              {{ field.position ? field.position + '. ' : '' }}{{ field.label }}
            </p>
          }
          <span class="d-inline-flex align-items-center gap-2 px-3 py-2 rounded border bg-light">
            <mat-icon [class]="isChecked ? 'text-success' : 'text-secondary'">
              {{ isChecked ? 'check_circle' : 'radio_button_unchecked' }}
            </mat-icon>
            <span class="fw-medium">{{ isChecked ? 'Certified' : 'Not certified' }}</span>
          </span>
        </div>
      } @else if (!field.hideLabel) {
        <div class="row g-3 my-2 align-items-start">
          <div class="col-12 col-md-5">
            <p class="fw-semibold mb-0 custom-font-size-6">
              {{ field.position ? field.position + '. ' : '' }}{{ field.label }}
            </p>
          </div>
          <div class="col-12 col-md-7">
            <ng-container [ngTemplateOutlet]="answerTpl"></ng-container>
          </div>
        </div>
      } @else {
        <ng-container [ngTemplateOutlet]="answerTpl"></ng-container>
      }
    }

    <ng-template #answerTpl>
      @switch (normalizedType) {
        @case ('input') {
          <span>{{ displayValue }}</span>
        }
        @case ('input-card') {
          <span>
            @if (field.inputCardConfig?.prefixText) {
              <span class="text-secondary me-1">{{ field.inputCardConfig?.prefixText }}</span>
            }
            {{ displayValue }}
            @if (field.inputCardConfig?.suffixText) {
              <span class="text-secondary ms-1">{{ field.inputCardConfig?.suffixText }}</span>
            }
          </span>
        }
        @case ('textarea') {
          <span class="dfv-textarea">{{ displayValue }}</span>
        }
        @case ('radio') {
          <span>{{ resolvedOptionLabel }}</span>
        }
        @case ('select') {
          <span>{{ resolvedOptionLabel }}</span>
        }
        @case ('dropdown') {
          <span>{{ resolvedOptionLabel }}</span>
        }
        @case ('date') {
          <span>{{ formattedDate }}</span>
        }
        @case ('file') {
          @if (fileView) {
            <div class="d-flex flex-column align-items-start gap-1">
              <span class="fw-medium">{{ fileView.name }}</span>
              @if (fileView.sizeLabel) {
                <small class="text-secondary">{{ fileView.sizeLabel }}</small>
              }
              @if (fileView.viewUrl) {
                <a matButton="filled" [appSignedUrl]="fileView.viewUrl" target="_blank" class="mt-1">
                  <mat-icon>visibility</mat-icon>
                  View Document
                </a>
              }
            </div>
          } @else {
            <span class="text-secondary">&#x2014;</span>
          }
        }
        @case ('actualTarget') {
          <span class="d-inline-flex flex-wrap gap-3">
            <span><span class="text-secondary">Actual:</span> {{ actualTargetView.actual }}</span>
            <span><span class="text-secondary">Target:</span> {{ actualTargetView.target }}</span>
          </span>
        }
        @case ('table') {
          @if (tableRows.length) {
            <div class="table-responsive mt-2">
              <table class="table table-bordered table-sm align-middle mb-0">
                <tbody>
                  @for (row of tableRows; track row.rowKey) {
                    <tr>
                      <td class="fw-medium">{{ row.rowLabel }}</td>
                      @for (cell of row.cells; track cell.colKey) {
                        <td>{{ cell.displayValue }}</td>
                      }
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <span class="text-secondary">&#x2014;</span>
          }
        }
        @default {
          <span class="text-secondary">&#x2014;</span>
        }
      }
    </ng-template>
  `,
  styles: `
    :host {
      display: block;
    }
    .dfv-textarea {
      white-space: pre-wrap;
      word-break: break-word;
    }
  `,
})
export class DynamicFieldViewComponent implements OnChanges {
  @Input({ required: true }) field!: FieldConfig;
  @Input({ required: true }) group!: FormGroup;

  normalizedType = '';
  displayValue = EMPTY;
  resolvedOptionLabel = EMPTY;
  formattedDate = EMPTY;
  isChecked = false;
  fileView: FileViewModel | null = null;
  tableRows: TableRowView[] = [];
  actualTargetView: { actual: string; target: string } = { actual: EMPTY, target: EMPTY };

  /**
   * True for checkbox fields and any field whose validations include `requiredTrue`.
   * These are declaration/certification fields that must render full-width — their label
   * text is a long declaration statement, not a short question label.
   */
  get isCertificationField(): boolean {
    return (
      this.normalizedType === 'checkbox' || (this.field?.validations?.some((v) => v.name === 'requiredTrue') ?? false)
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['field'] || changes['group']) {
      this.normalizedType = this.resolveType();
      this.refresh();
    }
  }

  private resolveType(): string {
    const t = this.field?.formFieldType ?? '';
    return ['text', 'url', 'email', 'number', 'amount'].includes(t) ? 'input' : t;
  }

  private refresh(): void {
    const raw = this.readRawValue();

    this.displayValue = EMPTY;
    this.resolvedOptionLabel = EMPTY;
    this.formattedDate = EMPTY;
    this.isChecked = false;
    this.fileView = null;
    this.tableRows = [];
    this.actualTargetView = { actual: EMPTY, target: EMPTY };

    switch (this.normalizedType) {
      case 'input':
      case 'input-card':
      case 'textarea':
        this.displayValue = this.toDisplayString(raw);
        break;
      case 'radio':
        this.resolvedOptionLabel = this.resolveRadioLabel(raw);
        break;
      case 'select':
      case 'dropdown':
        this.resolvedOptionLabel = this.resolveSelectLabel(raw);
        break;
      case 'date':
        this.formattedDate = this.formatDate(raw);
        break;
      case 'checkbox':
        this.isChecked = raw === true;
        break;
      case 'file':
        this.fileView = this.buildFileView();
        break;
      case 'table':
        this.tableRows = this.buildTableRows();
        break;
      case 'actualTarget':
        this.actualTargetView = this.buildActualTargetView(raw);
        break;
    }
  }

  private readRawValue(): unknown {
    const control: AbstractControl | null = this.group?.get(this.field?.key) ?? null;
    if (!control) return null;
    return control instanceof FormGroup ? control.getRawValue() : control.value;
  }

  /** Returns a safe display string for scalar values, or the empty placeholder for null/empty. */
  private toDisplayString(value: unknown): string {
    if (value === null || value === undefined || value === '') return EMPTY;
    return String(value);
  }

  /**
   * Finds the human-readable label for a radio value.
   * Radio options use `{ id, label }` objects; the stored value is `opt.id || opt`.
   */
  private resolveRadioLabel(value: unknown): string {
    if (value === null || value === undefined || value === '') return EMPTY;
    const options: unknown[] = this.field.options ?? [];
    for (const opt of options) {
      if (typeof opt === 'string' || typeof opt === 'number') {
        if (opt === value) return String(opt);
      } else if (opt !== null && typeof opt === 'object') {
        const o = opt as Record<string, unknown>;
        if ((o['id'] ?? o) === value) {
          return String(o['label'] ?? o['id'] ?? value);
        }
      }
    }
    return String(value);
  }

  /**
   * Resolves a human-readable label for select/dropdown stored values.
   * Select stores the full option item as its value; primitives are shown directly.
   */
  private resolveSelectLabel(value: unknown): string {
    if (value === null || value === undefined || value === '') return EMPTY;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    if (value !== null && typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      const label = obj['label'] ?? obj['name'] ?? obj['id'];
      if (label !== undefined && label !== null) return String(label);
    }
    return EMPTY;
  }

  /** Formats a date control value (ISO string or Date) as "26 Jun 2026". */
  private formatDate(value: unknown): string {
    if (value === null || value === undefined || value === '') return EMPTY;
    try {
      const d = value instanceof Date ? value : new Date(value as string | number);
      if (isNaN(d.getTime())) return String(value);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return String(value);
    }
  }

  /** Builds the file view model from the canonical standalone control shape (pre-canonical persisted values are normalized). */
  private buildFileView(): FileViewModel | null {
    const control = this.group?.get(this.field?.key);
    if (!control) return null;
    const raw = control instanceof FormGroup ? control.getRawValue() : control.value;

    const value = normalizeUploadedFileMetadata(raw);
    if (!value) return null;

    return {
      name: value.originalName,
      sizeLabel: value.sizeKb > 0 ? this.formatBytes(value.sizeKb * 1024) : null,
      viewUrl: value.path || null,
    };
  }

  /** Builds readonly table row data by reading values from the nested FormGroup. */
  private buildTableRows(): TableRowView[] {
    const rows = (this.field?.data ?? []) as TableRowConfig[];
    const tableGroup = this.group?.get(this.field?.key);
    if (!rows.length || !(tableGroup instanceof FormGroup)) return [];

    return rows.map((row) => {
      const rowGroup = tableGroup.get(row.key);
      const cols = row.year ?? [];
      const cells: TableCellView[] = cols.map((col) => ({
        colKey: col.key,
        displayValue: this.toDisplayString(rowGroup?.get(col.key)?.value ?? null),
      }));
      return { rowKey: row.key, rowLabel: row.label, cells };
    });
  }

  /** Formats a `{ actual, target }` pair value with the field's unit suffix, if any. */
  private buildActualTargetView(raw: unknown): { actual: string; target: string } {
    const pair = (raw ?? {}) as { actual?: unknown; target?: unknown };
    const suffixText = this.field?.inputCardConfig?.suffixText;
    const suffix = suffixText ? ` ${suffixText}` : '';
    const format = (value: unknown): string =>
      value === null || value === undefined || value === '' ? EMPTY : `${value}${suffix}`;
    return { actual: format(pair.actual), target: format(pair.target) };
  }

  private asNonEmptyString(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const s = value.trim();
    return s.length > 0 ? s : null;
  }

  private fileNameFromUrl(url: string | null): string {
    if (!url) return 'Unknown file';
    return url.split('/').pop()?.split('?')[0] || url;
  }

  private resolveFileSizeLabel(value: unknown): string | null {
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
      return this.formatBytes(value);
    }
    if (typeof value === 'string') {
      const n = Number(value.trim());
      if (Number.isFinite(n) && n >= 0) return this.formatBytes(n);
      const s = value.trim();
      return s.length > 0 ? s : null;
    }
    return null;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(0))} ${sizes[i]}`;
  }
}
