import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TextFieldModule } from '@angular/cdk/text-field';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MATERIAL_THEME_CLASS } from '../../../../../../core/theming/material-theme.providers';
import { resolveDateConstraint } from '../../../../../../shared/dynamic-form/date-constraint-resolver';
import { UTC_ISO_DATE_FORMATS } from '../../../../../../shared/dynamic-form/components/date/utc-iso-date-adapter';
import { ConditionalFieldConfig } from '../../../../dynamic-form-visibility.service';
import { ClaimLetterLetterDateAdapter } from './claim-letter-letter-date-adapter';

export type ClaimLetterLetterFieldKind = 'text' | 'textarea' | 'select' | 'date';

interface FieldOption {
  id: string;
  label: string;
}

/** A picked date always displays as "07 Oct 2026", whatever its stored form; "Mmm" is the widest month. */
const DATE_SIZER_TEXT = '00 Mmm 0000';

export function letterFieldId(key: string): string {
  return `cl-field-${key}`;
}

export function isBlankValue(value: unknown): boolean {
  return value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
}

/**
 * One letter-detail box drawn where the value prints in the letter. The formjson field gives the
 * type, placeholder, tooltip (label + hint) and error messages; the parent owns saving and reacts
 * to `committed` (blur for text, change for date / select).
 */
@Component({
  selector: 'app-claim-letter-letter-field',
  imports: [NgTemplateOutlet, ReactiveFormsModule, TextFieldModule, MatDatepickerModule, MatTooltipModule],
  templateUrl: './claim-letter-letter-field.component.html',
  styleUrl: './claim-letter-letter-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: DateAdapter, useClass: ClaimLetterLetterDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: UTC_ISO_DATE_FORMATS },
  ],
})
export class ClaimLetterLetterFieldComponent {
  readonly field = input.required<ConditionalFieldConfig>();
  readonly control = input.required<FormControl>();
  readonly bold = input(false);
  readonly committed = output<string>();

  readonly materialThemeClass: string | string[] = inject(MATERIAL_THEME_CLASS, { optional: true }) ?? '';

  /** Bumped on every control event so the OnPush view and the computeds below see value / status changes. */
  private readonly tick = signal(0);

  readonly id = computed(() => letterFieldId(this.field().key));
  readonly errorId = computed(() => `${this.id()}-error`);
  readonly kind = computed<ClaimLetterLetterFieldKind>(() => {
    const type = this.field().formFieldType;
    if (type === 'textarea') return 'textarea';
    if (type === 'radio' || type === 'select') return 'select';
    if (type === 'date') return 'date';
    return 'text';
  });
  readonly required = computed(() => this.field().required === true);
  readonly placeholder = computed(() => this.field().placeholder ?? this.field().label);
  readonly tooltip = computed(() => [this.field().label, this.field().hintText].filter(Boolean).join(' - '));
  readonly options = computed<FieldOption[]>(() =>
    (this.field().options ?? []).map((o: string | FieldOption) => (typeof o === 'string' ? { id: o, label: o } : o)),
  );
  readonly maxLength = computed<number | null>(() => {
    const max = this.field().validations?.find((v) => v.name === 'maxlength')?.validator;
    return typeof max === 'number' ? max : null;
  });
  readonly maxDate = computed(() => {
    const rule = this.field().validations?.find((v) => v.name === 'maxDate')?.validator ?? this.field().maxDate;
    return rule === undefined ? null : resolveDateConstraint(rule);
  });
  readonly empty = computed(() => {
    this.tick();
    return isBlankValue(this.control().value);
  });
  /** Hidden copy of what a filled box shows; it sizes the box (the control sits on top of it). */
  readonly sizerText = computed(() => {
    this.tick();
    const value = this.control().value;
    if (this.kind() === 'date') return DATE_SIZER_TEXT;
    if (this.kind() === 'select') return this.options().find((o) => o.id === value)?.label ?? '';
    return typeof value === 'string' ? value : '';
  });
  readonly error = computed<string | null>(() => {
    this.tick();
    const control = this.control();
    if (!control.errors || !(control.touched || control.dirty)) return null;
    for (const [name, detail] of Object.entries(control.errors)) {
      if (typeof detail === 'string') return detail;
      const message = this.field().validations?.find((v) => v.name === name)?.message;
      if (message) return message;
    }
    return 'Check this value.';
  });

  constructor() {
    effect((onCleanup) => {
      const sub = this.control().events.subscribe(() => this.tick.update((v) => v + 1));
      onCleanup(() => sub.unsubscribe());
    });
  }

  commit(): void {
    this.committed.emit(this.field().key);
  }
}
