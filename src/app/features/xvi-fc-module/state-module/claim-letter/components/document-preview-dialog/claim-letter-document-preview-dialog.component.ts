import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Subscription, forkJoin } from 'rxjs';
import FileSaver from 'file-saver';
import {
  ConfirmDialogData,
  themedDialogConfig,
} from '../../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogService } from '../../../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { DynamicFormService } from '../../../../../../shared/dynamic-form/dynamic-form.service';
import { ConditionalFieldConfig } from '../../../../dynamic-form-visibility.service';
import {
  ClaimLetterApiErrorMap,
  ClaimLetterDocument,
  ClaimLetterLetterDetails,
  ClaimLetterLetterDetailsSaveResult,
  ClaimLetterListKey,
} from '../../claim-letter.models';
import { ClaimLetterService } from '../../claim-letter.service';
import { readApiError, readBinaryApiError } from '../../claim-letter.utils';
import { isBlankValue, letterFieldId } from '../letter-field/claim-letter-letter-field.component';
import {
  ClaimLetterLetterEditor,
  ClaimLetterLetterViewComponent,
  ClaimLetterListPage,
  ClaimLetterListPageChange,
} from '../letter-view/claim-letter-letter-view.component';
import { ClaimLetterSaveStatus, LetterDetailsAutosaver, hasBlockingError } from './letter-details-autosaver';

export interface ClaimLetterDocumentPreviewDialogData {
  claimLetterId: string;
}

/** `saved` tells the detail page to refresh (a save may have removed the signed letter). */
export interface ClaimLetterDocumentPreviewDialogResult {
  saved: boolean;
}

const STATUS_TEXT: Record<ClaimLetterSaveStatus, string> = {
  idle: 'Changes save automatically',
  saving: 'Saving...',
  saved: 'All changes saved',
  invalid: 'Not saved - fix the highlighted box',
  failed: 'Save failed',
};

const SIGNED_FILE_REMOVAL_CONFIRM: Required<ConfirmDialogData> = {
  title: 'Edit the letter details?',
  message:
    'Changing any detail removes the signed claim letter you uploaded. You will need to download, sign and upload it again.',
  confirmText: 'Edit details',
  cancelText: 'Cancel',
  confirmButtonColor: 'warn',
  icon: 'bi-exclamation-triangle-fill',
};

const PREFILL_CONFIRM: Required<ConfirmDialogData> = {
  title: 'Replace the current values?',
  message: 'Some boxes already have values. Prefilling replaces them with the details saved in your previous batch.',
  confirmText: 'Replace',
  cancelText: 'Cancel',
  confirmButtonColor: 'primary',
  icon: 'bi-arrow-repeat',
};

const UNSAVED_CONFIRM: Required<ConfirmDialogData> = {
  title: 'Close without saving?',
  message: 'Some changes are not saved because they need correcting or the save failed.',
  confirmText: 'Close anyway',
  cancelText: 'Keep editing',
  confirmButtonColor: 'warn',
  icon: 'bi-exclamation-triangle-fill',
};

const EMPTY_PAGE: ClaimLetterListPage = { rows: [], pageIndex: 0, loading: false };

/**
 * The claim letter with its letter details as inline boxes (fill-in-the-blank). Each box saves on
 * its own when the user leaves it (one request at a time, later changes batched into the next);
 * Download and Close wait for pending saves. With a signed letter uploaded, the letter stays
 * read-only until the user confirms that editing removes it.
 */
@Component({
  selector: 'app-claim-letter-document-preview-dialog',
  imports: [MatDialogModule, MatButtonModule, ClaimLetterLetterViewComponent],
  templateUrl: './claim-letter-document-preview-dialog.component.html',
  styleUrl: './claim-letter-document-preview-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClaimLetterDocumentPreviewDialogComponent implements OnInit {
  private readonly dialogRef = inject(
    MatDialogRef<ClaimLetterDocumentPreviewDialogComponent, ClaimLetterDocumentPreviewDialogResult>,
  );
  readonly data = inject<ClaimLetterDocumentPreviewDialogData>(MAT_DIALOG_DATA);
  private readonly claimLetterService = inject(ClaimLetterService);
  private readonly dynamicService = inject(DynamicFormService);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly dialogConfig = themedDialogConfig();

  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly details = signal<ClaimLetterLetterDetails | null>(null);
  readonly document = signal<ClaimLetterDocument | null>(null);
  readonly pages = signal<Record<ClaimLetterListKey, ClaimLetterListPage>>({
    ELIGIBLE: EMPTY_PAGE,
    INELIGIBLE: EMPTY_PAGE,
  });
  readonly pageError = signal<string | null>(null);

  readonly fields = computed(() => this.details()?.fields ?? []);
  readonly configured = computed(() => this.fields().length > 0);
  readonly canEdit = computed(() => this.details()?.canEdit ?? false);
  readonly previous = computed(() => this.details()?.previous ?? null);
  readonly hasSignedFile = signal(false);
  readonly isComplete = signal(false);
  readonly unlocked = signal(false);
  readonly editable = computed(() => this.canEdit() && this.configured() && (!this.hasSignedFile() || this.unlocked()));
  private readonly editor = signal<ClaimLetterLetterEditor | null>(null);
  /** The letter view draws boxes only while editable; otherwise it prints the server's text. */
  readonly letterEditor = computed(() => (this.editable() ? this.editor() : null));

  private readonly autosaver = new LetterDetailsAutosaver({
    save: (data, confirmRemoval) =>
      this.claimLetterService.saveLetterDetails(this.data.claimLetterId, data, confirmRemoval),
    control: (key) => this.form?.get(key) ?? null,
    serialize: (key) => this.serialize(key),
    canSave: () => this.editable(),
    hasUnsavedValue: () => this.hasUnsavedValue(),
    onSaved: (result) => this.onSaved(result),
    onRejected: (errors) => this.markRejected(errors),
    onConflict: (message) => {
      this.notice.set(`${message ?? 'The letter details changed.'} The latest details have been loaded.`);
      this.load();
    },
    changed: () => this.bump(),
    destroyRef: this.destroyRef,
  });
  readonly status = this.autosaver.status;
  readonly statusText = computed(() => STATUS_TEXT[this.status()]);
  readonly saveError = this.autosaver.saveError;
  readonly notice = signal<string | null>(null);
  readonly downloading = signal(false);
  readonly downloadError = signal<string | null>(null);
  readonly closing = signal(false);

  /** Bumped on form events so the computeds below re-read the (non-signal) form. */
  private readonly formVersion = signal(0);
  readonly requiredSummary = computed(() => {
    this.formVersion();
    const required = this.fields().filter((f) => f.required === true);
    const filled = required.filter((f) => !isBlankValue(this.form?.get(f.key)?.value)).length;
    return { filled, total: required.length };
  });
  readonly canDownload = computed(() => {
    this.formVersion();
    if (this.loading() || this.loadError() || !this.configured() || this.downloading() || this.closing()) return false;
    return this.letterEditor() ? this.firstProblemKey() === null && this.status() !== 'failed' : this.isComplete();
  });

  form: FormGroup | null = null;
  private formSub: Subscription | null = null;
  private fieldByKey = new Map<string, ConditionalFieldConfig>();
  private lastFocusedKey: string | null = null;

  ngOnInit(): void {
    this.load();
  }

  async close(): Promise<void> {
    if (this.closing()) return;
    this.closing.set(true);
    await this.autosaver.whenIdle();
    const unsaved = this.autosaver.hasPending || this.hasUnsavedValue();
    if (!unsaved) {
      this.dialogRef.close({ saved: this.autosaver.savedAny });
      return;
    }
    this.confirmDialogService
      .confirm(UNSAVED_CONFIRM, this.dialogConfig)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        this.closing.set(false);
        if (confirmed) this.dialogRef.close({ saved: this.autosaver.savedAny });
      });
  }

  /** A box was left (or a date / option picked): save it if it is valid and changed. */
  onFieldCommitted(key: string): void {
    if (this.autosaver.queue(key)) this.autosaver.flush();
  }

  onFocusIn(event: FocusEvent): void {
    const id = (event.target as HTMLElement | null)?.id ?? '';
    const key = this.fields().find((f) => letterFieldId(f.key) === id)?.key;
    if (key) this.lastFocusedKey = key;
  }

  /** Focuses the next empty box after the last one used, in letter order (wraps around). */
  focusNextEmpty(): void {
    const keys = this.fields().map((f) => f.key);
    const start = this.lastFocusedKey ? keys.indexOf(this.lastFocusedKey) : -1;
    for (let step = 1; step <= keys.length; step++) {
      const key = keys[(start + step) % keys.length];
      if (isBlankValue(this.form?.get(key)?.value)) {
        this.focusField(key);
        return;
      }
    }
    this.notice.set('Every box is filled.');
  }

  /** Signed letter uploaded: one confirm unlocks the boxes; the first changed save removes the file. */
  unlock(): void {
    this.confirmDialogService
      .confirm(SIGNED_FILE_REMOVAL_CONFIRM, this.dialogConfig)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.autosaver.allowSignedFileRemoval();
        this.unlocked.set(true);
        this.syncEnabled();
      });
  }

  /** Fills the boxes from the previous batch (Letter No. and date excluded by the backend) and saves
   *  them in one request. */
  prefill(): void {
    const previous = this.previous();
    const form = this.form;
    if (!previous || !form || !this.editable()) return;
    const keys = Object.keys(previous.values).filter((key) => form.get(key));

    const apply = () => {
      for (const key of keys) {
        const control = form.get(key)!;
        control.setValue(previous.values[key]);
        control.markAsTouched();
      }
      const { yearLabel, installment, batchNumber } = previous.source;
      this.notice.set(`Filled from Batch ${batchNumber} (FY ${yearLabel}, Installment ${installment}).`);
      for (const key of keys) this.autosaver.queue(key);
      this.autosaver.flush();
    };

    if (!keys.some((key) => !isBlankValue(form.get(key)!.value))) {
      apply();
      return;
    }
    this.confirmDialogService
      .confirm(PREFILL_CONFIRM, this.dialogConfig)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (confirmed) apply();
      });
  }

  retry(): void {
    this.autosaver.retry();
  }

  async download(): Promise<void> {
    if (this.downloading()) return;
    this.downloading.set(true);
    this.downloadError.set(null);
    await this.autosaver.whenIdle();

    const problem = this.letterEditor() ? this.firstProblemKey() : null;
    if (this.status() === 'failed' || problem) {
      this.downloadError.set(
        problem
          ? 'Fill the required boxes and correct the highlighted ones before downloading.'
          : 'Some changes are not saved yet. Click Retry, then download.',
      );
      if (problem) this.focusField(problem);
      this.downloading.set(false);
      return;
    }

    this.claimLetterService
      .downloadDocumentDocx(this.data.claimLetterId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ blob, fileName }) => {
          FileSaver.saveAs(blob, fileName ?? 'Claim-letter.docx');
          this.downloading.set(false);
        },
        error: (err: unknown) => {
          void readBinaryApiError(err).then((api) => {
            this.downloadError.set(api.message ?? 'Unable to download the claim letter. Please try again.');
            this.downloading.set(false);
          });
        },
      });
  }

  onPageChange(change: ClaimLetterListPageChange): void {
    // A failed page keeps its previous rows and index, so the old error can go once a new request starts.
    this.pageError.set(null);
    this.pages.update((pages) => ({ ...pages, [change.list]: { ...pages[change.list], loading: true } }));
    this.claimLetterService
      .getDocumentUlbs(this.data.claimLetterId, change.list, change.pageIndex + 1)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) =>
          this.pages.update((pages) => ({
            ...pages,
            [change.list]: { rows: page.rows, pageIndex: change.pageIndex, loading: false },
          })),
        error: (err: unknown) => {
          this.pages.update((pages) => ({ ...pages, [change.list]: { ...pages[change.list], loading: false } }));
          this.pageError.set(readApiError(err).message ?? 'Unable to load the ULB list. Please try again.');
        },
      });
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private load(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.pageError.set(null);
    const id = this.data.claimLetterId;
    forkJoin({
      details: this.claimLetterService.getLetterDetails(id),
      document: this.claimLetterService.getDocument(id),
      eligible: this.claimLetterService.getDocumentUlbs(id, 'ELIGIBLE', 1),
      ineligible: this.claimLetterService.getDocumentUlbs(id, 'INELIGIBLE', 1),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ details, document, eligible, ineligible }) => {
          this.document.set(document);
          this.pages.set({
            ELIGIBLE: { rows: eligible.rows, pageIndex: 0, loading: false },
            INELIGIBLE: { rows: ineligible.rows, pageIndex: 0, loading: false },
          });
          this.applyDetails(details);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.loadError.set(readApiError(err).message ?? 'Unable to load the claim letter. Please try again.');
          this.loading.set(false);
        },
      });
  }

  private applyDetails(details: ClaimLetterLetterDetails): void {
    this.details.set(details);
    this.autosaver.reset(details.values);
    this.hasSignedFile.set(details.hasSignedFile);
    this.isComplete.set(details.isComplete);
    this.unlocked.set(false);

    const form = this.dynamicService.toFormGroup(details.fields);
    this.formSub?.unsubscribe();
    this.formSub = form.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.bump());
    this.form = form;
    this.fieldByKey = new Map(details.fields.map((f) => [f.key, f]));
    this.editor.set({
      controls: form.controls as Record<string, FormControl>,
      fields: Object.fromEntries(this.fieldByKey),
    });
    this.syncEnabled();
  }

  private syncEnabled(): void {
    if (this.editable()) this.form?.enable({ emitEvent: false });
    else this.form?.disable({ emitEvent: false });
    this.bump();
  }

  private onSaved(result: ClaimLetterLetterDetailsSaveResult): void {
    this.hasSignedFile.set(result.hasSignedFile);
    this.isComplete.set(result.isComplete);
    if (result.signedFileRemoved) {
      this.notice.set('The uploaded signed letter was removed. Download, sign and upload it again.');
    }
  }

  /** Marks each refused box with its formjson rule's message, or the server's own text. */
  private markRejected(errors: ClaimLetterApiErrorMap): void {
    for (const [key, list] of Object.entries(errors)) {
      const control = this.form?.get(key);
      const code = list[0]?.code ?? 'server';
      const known = this.fieldByKey.get(key)?.validations?.some((v) => v.name === code);
      control?.setErrors(known ? { [code]: true } : { server: list[0]?.message ?? 'Invalid value.' });
      control?.markAsTouched();
    }
  }

  /** A box holds a value that was not saved because it breaks a rule (or the server refused it). */
  private hasUnsavedValue(): boolean {
    if (!this.letterEditor() || !this.form) return false;
    return Object.values(this.form.controls).some(hasBlockingError);
  }

  /** Blank text is sent as null so the server removes the key; dates go out as UTC ISO strings. */
  private serialize(key: string): unknown {
    const field = this.fieldByKey.get(key);
    const raw = this.form?.get(key)?.value;
    const value = field ? this.dynamicService.serializeFieldValue(field, raw) : raw;
    if (typeof value === 'string') return value.trim() || null;
    return value ?? null;
  }

  /** The first box (letter order) that is a blank required one or invalid; null when ready. */
  private firstProblemKey(): string | null {
    const form = this.form;
    if (!form) return null;
    for (const field of this.fields()) {
      const control = form.get(field.key);
      if (!control) continue;
      if (control.invalid || (field.required === true && isBlankValue(control.value))) return field.key;
    }
    return null;
  }

  private focusField(key: string): void {
    const element = this.host.nativeElement.querySelector<HTMLElement>(`#${letterFieldId(key)}`);
    element?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    element?.focus({ preventScroll: true });
    this.lastFocusedKey = key;
  }

  private bump(): void {
    this.formVersion.update((v) => v + 1);
  }
}
