import { Component, DestroyRef, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { FieldConfig } from '../../field.interface';
import { MaterialModule } from '../../../../material.module';
import { NoUpDownDirective } from '../../../../core/directives/no-up-down.directive';
import { DecimalLimitDirective } from '../../../../core/directives/decimal-limit.directive';
import { TrimOnBlurDirective } from '../../../../core/directives/trim-on-blur.directive';
import { environment } from '../../../../../environments/environment';

const LOOKUP_DEBOUNCE_MS = 400;

/** Resolves a dot-path (e.g. 'bankDetails.name') off a plain object; undefined if any segment is missing. */
function resolveDotPath(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => {
    if (value === null || typeof value !== 'object') return undefined;
    return (value as Record<string, unknown>)[key];
  }, source);
}
@Component({
  selector: 'app-input',
  imports: [MaterialModule, DecimalLimitDirective, NoUpDownDirective, TrimOnBlurDirective],
  templateUrl: './input.component.html',
  styles: [
    `
      // * {
      //     font-family: var(--ff-base) !important;
      // }
      .warning-hint {
        display: block;
        color: orange;
      }
    `,
  ],
})
export class InputComponent implements OnInit, OnChanges {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  className: string = 'box1';
  @Input() field!: FieldConfig;
  @Input() group!: FormGroup;
  @Input() displayLabel: boolean = true;
  @Input() displayInlineLabel: boolean = false;
  @Input() readonly: boolean | undefined = false;
  @Input() parentField: any;
  validations: any[] = [];
  warnings: any[] = [];
  decimal: number = 0;
  maxLength: number | null = null;

  constructor() {}

  ngOnInit(): void {
    this.syncFromInputs();
    this.watchLookup();
  }

  /**
   * When `field.lookup` is set, calls its endpoint once this field's own value passes its own
   * validators (e.g. `ifscCode`'s pattern check), then patches sibling controls per `populates`.
   * Errors (network failure, no match) are logged and otherwise ignored — a failed lookup leaves
   * the sibling fields untouched rather than blocking the user from typing/correcting the value.
   */
  private watchLookup(): void {
    const lookup = this.field?.lookup;
    const control = this.group?.controls?.[this.field?.key];
    if (!lookup || !control) return;

    control.valueChanges
      .pipe(
        debounceTime(LOOKUP_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value) => {
        if (!control.valid || value === null || value === undefined || value === '') return;

        const endpoint = `${environment.api.url2}${lookup.endpoint.replace(':value', encodeURIComponent(String(value)))}`;
        this.http.get<unknown>(endpoint).subscribe({
          next: (res) => {
            const body = res !== null && typeof res === 'object' && 'success' in (res as object)
              ? (res as { data: unknown }).data
              : res;
            for (const [responseKey, targetKey] of Object.entries(lookup.populates)) {
              const resolvedValue = resolveDotPath(body, responseKey);
              if (resolvedValue !== undefined) this.group.controls[targetKey]?.patchValue(resolvedValue);
            }
          },
          error: (err) => console.error(`[dynamic-form] lookup failed for field "${this.field.key}"`, err),
        });
      });
  }

  /** Strips non-digit characters live as the user types, for text fields holding numeric
   *  identifiers (e.g. account numbers) rather than a true `number` input. No-ops otherwise. */
  onDigitsOnlyInput(event: Event): void {
    if (!this.field?.digitsOnly) return;
    const input = event.target as HTMLInputElement;
    const digitsOnly = input.value.replace(/\D/g, '');
    if (input.value !== digitsOnly) {
      input.value = digitsOnly;
      this.group.controls[this.field.key]?.setValue(digitsOnly);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['field'] || changes['parentField']) {
      this.syncFromInputs();
    }
  }

  private syncFromInputs(): void {
    this.readonly = this.parentField?.readonly || this.field?.readonly;
    this.validations = this.parentField?.validations || this.field?.validations;
    this.decimal =
      this.parentField?.decimal || this.parentField?.decimal === 0 ? this.parentField?.decimal : this.field?.decimal;
    this.warnings = this.parentField?.warning;
    this.displayInlineLabel = this.field?.displayInlineLabel || false;
    this.maxLength = this.validations?.find((v) => v.name === 'maxlength')?.validator ?? null;
  }

  hasError(key: string, name: string): boolean {
    if (name === 'email') name = 'pattern';
    const control = this.group.controls[key];
    return !!control?.hasError(name) && (control.touched || control.dirty);
  }

  /** Resolves the message shown for one `validations[]` entry: a string value on the matching
   *  control error (e.g. `{api: 'IFSC does not match the uploaded proof.'}`, set from a submit-time
   *  API error) wins over the field's own static `message`, so server-side errors can surface
   *  through the same display path as client-side ones without a separate UI. */
  errorMessage(key: string, validation: { name: string; message: string }): string {
    const dynamicMessage = this.group.controls[key]?.errors?.[validation.name];
    return typeof dynamicMessage === 'string' ? dynamicMessage : validation.message;
  }

  hasWarning(key: string, warning: any) {
    const errors: any = this.group.controls[key]?.errors;

    if (errors && errors.length) {
      return true;
    }
    const val = parseInt(this.group.controls[key]?.value);

    let res = false;
    switch (warning.condition) {
      case 'equalTo':
        res = val === warning.value;
        break;
      case 'greaterThan':
        res = val > warning.value;
        break;
    }
    return res;
  }

  onKeypressNumber() {}
}
