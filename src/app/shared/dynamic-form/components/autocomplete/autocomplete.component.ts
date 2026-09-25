import { Component, DestroyRef, Input, OnChanges, OnInit, SimpleChanges, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, of, switchMap } from 'rxjs';
import { FieldConfig, FieldRemoteSearchConfig } from '../../field.interface';
import { MaterialModule } from '../../../../material.module';
import { environment } from '../../../../../environments/environment';
import { resolveDotPath } from '../../utils/resolve-dot-path.util';

const DEFAULT_SEARCH_PARAM = 'search';
const DEFAULT_VALUE_KEY = '_id';
const DEFAULT_LABEL_KEY = 'name';
const DEFAULT_RESULTS_PATH = 'data.data';
const DEFAULT_MIN_LENGTH = 2;
const DEFAULT_DEBOUNCE_MS = 300;
const DEFAULT_LIMIT = 10;

interface AutocompleteOption {
  id: string;
  label: string;
}

/**
 * Debounced, search-as-you-type remote lookup — as opposed to `SelectComponent`'s static,
 * preloaded `options`. Driven entirely by `field.remoteSearch` (`FieldRemoteSearchConfig`), the
 * same "backend hands the frontend a relative API path to call live" convention `InputComponent`'s
 * `lookup` config already uses.
 *
 * The bound control (`group.controls[field.key]`) always holds just the plain option id (or
 * `null`) — identical to what `SelectComponent` would put there. A separate, local `searchCtrl`
 * (not part of `group`) drives the visible input and the debounced HTTP search; it's kept
 * deliberately out of the form group so nothing downstream (payload building, DTO validation) has
 * to change to accommodate a "typed text vs. selected value" distinction.
 *
 * Known limitation: there's no way today to pre-seed the visible text for an *already-selected*
 * value on load (e.g. resuming an existing draft) — the field always starts blank. Not needed yet
 * since no consumer of this field type currently loads a non-null initial value; revisit if one
 * does (the fix would be a small "resolve label for value X" companion config, not a redesign).
 */
@Component({
  selector: 'app-autocomplete',
  imports: [MaterialModule],
  template: ` @if (displayLabel && !displayInlineLabel && !field.hideLabel) {
      <label class="fw-semibold"
        >{{ field.position ? field.position + '. ' : '' }}{{ field.label }}
        @if (field.required) {
          <span class="text-danger"><sup>*</sup></span>
        }
      </label>
    }
    <mat-form-field appearance="outline" class="demo-full-width">
      @if (displayInlineLabel && !field.hideLabel) {
        <mat-label
          >{{ field.label }}
          @if (field.required) {
            <span class="text-danger"><sup>*</sup></span>
          }
        </mat-label>
      }
      <input
        matInput
        [formControl]="searchCtrl"
        [errorStateMatcher]="errorStateMatcher"
        [matAutocomplete]="auto"
        [placeholder]="field.placeholder || 'Search...'"
        [attr.data-cy]="field.key ? field.key + '-test' : null"
        (blur)="onBlur()"
      />
      <mat-autocomplete #auto="matAutocomplete" (optionSelected)="onOptionSelected($event)">
        @if (loading()) {
          <mat-option disabled>Searching…</mat-option>
        } @else if (results().length === 0 && searchCtrl.value) {
          <mat-option disabled>No matches found.</mat-option>
        } @else {
          @for (opt of results(); track opt.id) {
            <mat-option [value]="opt.id">{{ opt.label }}</mat-option>
          }
        }
      </mat-autocomplete>
      @for (validation of this.validations; track validation) {
        <ng-container ngProjectAs="mat-error">
          @if (hasError(field.key, validation.name)) {
            <mat-error>{{ validation.message }}</mat-error>
          }
        </ng-container>
      }
    </mat-form-field>`,
  styles: [],
})
export class AutocompleteComponent implements OnInit, OnChanges {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  @Input() field!: FieldConfig;
  @Input() group!: FormGroup;
  @Input() displayLabel: boolean = true;
  @Input() displayInlineLabel: boolean = false;
  @Input() parentField: any;

  readonly searchCtrl = new FormControl<string>('', { nonNullable: true });
  readonly results = signal<AutocompleteOption[]>([]);
  readonly loading = signal(false);

  /** searchCtrl (bound to matInput) has no validators of its own, so Material's default error
   *  gating never fires - this reads the real group control instead. */
  readonly errorStateMatcher: ErrorStateMatcher = {
    isErrorState: (): boolean => {
      const control = this.group?.get(this.field?.key);
      return !!control && control.invalid && (control.touched || control.dirty);
    },
  };

  validations: any[] = [];
  /** The label text last committed to the real control via a genuine selection — used by
   *  `onBlur` to tell "still matches the last pick" apart from "edited/typed without picking." */
  private selectedLabel = '';

  ngOnInit(): void {
    this.syncFromInputs();
    this.watchSearch();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['field'] || changes['parentField']) {
      this.syncFromInputs();
    }
  }

  private syncFromInputs(): void {
    this.validations = this.parentField?.validations || this.field?.validations;
    this.displayInlineLabel = this.field?.displayInlineLabel || false;
  }

  private watchSearch(): void {
    const config = this.field?.remoteSearch;
    if (!config) return;

    this.searchCtrl.valueChanges
      .pipe(
        debounceTime(config.debounceMs ?? DEFAULT_DEBOUNCE_MS),
        distinctUntilChanged(),
        switchMap((term) => {
          const trimmed = (term ?? '').trim();
          if (trimmed.length < (config.minLength ?? DEFAULT_MIN_LENGTH)) {
            this.results.set([]);
            return of<AutocompleteOption[] | null>(null);
          }

          this.loading.set(true);
          const params: Record<string, string | number | boolean> = {
            ...(config.extraParams ?? {}),
            [config.searchParam ?? DEFAULT_SEARCH_PARAM]: trimmed,
            limit: config.limit ?? DEFAULT_LIMIT,
          };

          return this.http.get<unknown>(`${environment.api.url2}${config.endpoint}`, { params }).pipe(
            map((res) => this.extractOptions(res, config)),
            catchError((err: unknown) => {
              console.error(`[dynamic-form] remote search failed for field "${this.field.key}"`, err);
              return of<AutocompleteOption[]>([]);
            }),
            finalize(() => this.loading.set(false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((options) => {
        if (options) this.results.set(options);
      });
  }

  private extractOptions(res: unknown, config: FieldRemoteSearchConfig): AutocompleteOption[] {
    const list = resolveDotPath(res, config.resultsPath ?? DEFAULT_RESULTS_PATH);
    if (!Array.isArray(list)) return [];

    return list
      .map(
        (item): AutocompleteOption => ({
          id: String(resolveDotPath(item, config.valueKey ?? DEFAULT_VALUE_KEY) ?? ''),
          label: String(resolveDotPath(item, config.labelKey ?? DEFAULT_LABEL_KEY) ?? ''),
        }),
      )
      .filter((option) => option.id !== '');
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const selected = this.results().find((option) => option.id === event.option.value);
    if (!selected) return;

    this.selectedLabel = selected.label;
    this.searchCtrl.setValue(selected.label, { emitEvent: false });
    this.group.controls[this.field.key]?.setValue(selected.id);
    this.group.controls[this.field.key]?.markAsDirty();
  }

  /** If the visible text no longer matches the last genuine selection (nothing was ever picked,
   *  or the text was edited/cleared after picking one), clear both — a stale id must never be
   *  submitted alongside a mismatched visible label. */
  onBlur(): void {
    const control = this.group?.controls?.[this.field?.key];
    control?.markAsTouched();

    const text = (this.searchCtrl.value ?? '').trim();
    if (text && text === this.selectedLabel) return;

    this.selectedLabel = '';
    this.searchCtrl.setValue('', { emitEvent: false });
    if (control && control.value != null) {
      control.setValue(null);
      control.markAsDirty();
    }
  }

  hasError(key: string, name: string): boolean {
    const control = this.group.get(key);
    return !!control?.hasError(name) && (control.touched || control.dirty);
  }
}
