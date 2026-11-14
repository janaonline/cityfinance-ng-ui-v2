import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, RouterLink } from '@angular/router';
import FileSaver from 'file-saver';
import { Observable } from 'rxjs';
import { UtilityService } from '../../../../../core/services/utility.service';
import { themedDialogConfig } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import type { ConditionalFieldConfig } from '../../../dynamic-form-visibility.service';
import {
  isBlankValue,
  letterFieldId,
} from '../../../state-module/claim-letter/components/letter-field/claim-letter-letter-field.component';
import { formatRupeesInCrore } from '../../claims-submission/claims-submission.models';
import { MohuaPageLoaderComponent } from '../../page-loader/page-loader.component';
import { OmDocumentComponent, OmEditor } from '../om-document/om-document.component';
import {
  OmGenerateDialogComponent,
  OmGenerateDialogData,
  OmGenerateDialogResult,
} from '../om-generate-dialog/om-generate-dialog.component';
import { OM_STATUS_LABEL, OmEditorView, OmHistoryRow, isIssued } from '../om-generation.models';
import { OmGenerationService } from '../om-generation.service';
import {
  OmSignedUploadDialogComponent,
  OmSignedUploadDialogData,
} from '../om-signed-upload-dialog/om-signed-upload-dialog.component';
import { OmStepsComponent } from '../om-steps/om-steps.component';

type SaveState = 'idle' | 'saving' | 'saved' | 'failed';

const SAVE_TEXT: Record<SaveState, string> = {
  idle: 'Changes save automatically',
  saving: 'Saving…',
  saved: 'All changes saved',
  failed: 'Could not save. Try again.',
};
const LOAD_ERROR = 'Could not load this Office Memorandum. Please try again.';
const GENERATE_ERROR = 'Could not generate the Office Memorandum. Please try again.';

/** One verified claim letter's OM: its ULBs (collapsible), the OM to fill in, Generate, the signed upload. */
@Component({
  selector: 'app-om-letter',
  imports: [RouterLink, MohuaPageLoaderComponent, OmStepsComponent, OmDocumentComponent],
  templateUrl: './om-letter.component.html',
  styleUrl: './om-letter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OmLetterComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(OmGenerationService);
  private readonly dialog = inject(MatDialog);
  private readonly utilityService = inject(UtilityService);
  private readonly destroyRef = inject(DestroyRef);
  /** Must be resolved in this field-initializer injection context — see themedDialogConfig's own doc. */
  private readonly dialogConfig = themedDialogConfig();

  readonly mohuaRoute = this.route.parent;
  readonly formatCrore = formatRupeesInCrore;
  readonly statusLabel = OM_STATUS_LABEL;
  readonly claimLetterId = this.route.snapshot.paramMap.get('claimLetterId') ?? '';

  readonly view = signal<OmEditorView | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly editor = signal<OmEditor | null>(null);
  readonly saveState = signal<SaveState>('idle');
  readonly generating = signal(false);
  readonly ulbsOpen = signal(false);
  /** Bumped on every box change so the required counter follows the controls. */
  private readonly tick = signal(0);

  readonly saveText = computed(() => SAVE_TEXT[this.saveState()]);
  readonly requiredKeys = computed(() =>
    (this.view()?.fields ?? []).filter((f) => f.required === true).map((f) => f.key),
  );
  readonly filledCount = computed(() => {
    this.tick();
    const controls = this.editor()?.controls ?? {};
    return this.requiredKeys().filter((key) => !isBlankValue(controls[key]?.value)).length;
  });
  readonly issued = computed(() => isIssued(this.view()?.status ?? null));
  readonly canGenerate = computed(
    () => !this.issued() && this.filledCount() === this.requiredKeys().length && this.saveState() !== 'saving',
  );
  readonly totalClaimed = computed(() => (this.view()?.ulbs ?? []).reduce((sum, u) => sum + u.claimedAmount, 0));

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service
      .getEditor(this.claimLetterId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (view) => {
          this.applyView(view);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(LOAD_ERROR);
          this.loading.set(false);
        },
      });
  }

  toggleUlbs(): void {
    this.ulbsOpen.update((open) => !open);
  }

  /** A box was left (or the date picked): saves just that box. */
  onFieldCommitted(key: string): void {
    const control = this.editor()?.controls[key];
    // A blank required box is still saved (as blank); only a value that breaks a rule is held back.
    if (!control || (control.invalid && !control.hasError('required'))) return;
    this.saveState.set('saving');
    this.service
      .saveDraft(this.claimLetterId, { [key]: serialize(control.value) })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (view) => {
          this.view.set(view);
          this.saveState.set('saved');
        },
        error: (err: HttpErrorResponse) => {
          this.saveState.set('failed');
          this.snack(err, 'Could not save the OM.');
        },
      });
  }

  /** Scrolls to and focuses the first required box still empty. */
  nextEmpty(): void {
    const controls = this.editor()?.controls ?? {};
    const key = this.requiredKeys().find((k) => isBlankValue(controls[k]?.value));
    if (!key) return;
    const el = document.getElementById(letterFieldId(key));
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el?.focus();
  }

  /** Confirm with the counts, then generate, download and offer the signed upload. */
  confirmGenerate(): void {
    const view = this.view();
    if (!view || !this.canGenerate()) return;
    this.dialog
      .open<OmGenerateDialogComponent, OmGenerateDialogData, OmGenerateDialogResult | undefined>(OmGenerateDialogComponent, {
        ...this.dialogConfig,
        data: { counts: view.counts },
        width: '520px',
        maxWidth: '95vw',
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result === 'generate') this.generate();
        if (result === 'preview') document.querySelector('app-om-document')?.scrollIntoView({ behavior: 'smooth' });
      });
  }

  /** The issued OM's PDF (with the claim letter's annexures) again. */
  download(): void {
    const omId = this.view()?.omId;
    if (!omId) return;
    this.saveFile(this.service.downloadPdf(omId), 'Office-Memorandum.pdf');
  }

  /** Opens the signed upload for an OM already issued. */
  uploadSigned(): void {
    const view = this.view();
    if (!view?.omId) return;
    this.openUpload({ omId: view.omId, refNo: view.refNo ?? '', ulbCount: view.content.ulbCount, justGenerated: false });
  }

  private generate(): void {
    this.generating.set(true);
    this.service
      .generate(this.claimLetterId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (file) => {
          FileSaver.saveAs(file.blob, file.fileName ?? 'Office-Memorandum.pdf');
          // Reload to get the issued OM's id and number for the upload step.
          this.service
            .getEditor(this.claimLetterId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (view) => {
                this.generating.set(false);
                this.applyView(view);
                if (view.omId) {
                  this.openUpload({
                    omId: view.omId,
                    refNo: view.refNo ?? '',
                    ulbCount: view.content.ulbCount,
                    justGenerated: true,
                  });
                }
              },
              error: () => {
                this.generating.set(false);
                this.load();
              },
            });
        },
        error: (err: HttpErrorResponse) => {
          this.generating.set(false);
          this.snack(err, GENERATE_ERROR);
        },
      });
  }

  private openUpload(data: OmSignedUploadDialogData): void {
    this.dialog
      .open<OmSignedUploadDialogComponent, OmSignedUploadDialogData, OmHistoryRow | undefined>(OmSignedUploadDialogComponent, {
        ...this.dialogConfig,
        data,
        width: '560px',
        maxWidth: '95vw',
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((row) => {
        if (!row) return;
        this.utilityService.triggerSnackbar('Signed OM uploaded.', 'snackbar-success');
        this.load();
      });
  }

  private applyView(view: OmEditorView): void {
    this.view.set(view);
    this.saveState.set('idle');
    if (isIssued(view.status)) {
      this.editor.set(null);
      return;
    }
    const fields: Record<string, ConditionalFieldConfig> = {};
    const controls: Record<string, FormControl> = {};
    for (const field of view.fields) {
      const maxLength = field.validations?.find((v) => v.name === 'maxlength')?.validator;
      const control = new FormControl<unknown>(view.values[field.key as keyof typeof view.values] ?? null, [
        ...(field.required ? [Validators.required] : []),
        ...(typeof maxLength === 'number' ? [Validators.maxLength(maxLength)] : []),
      ]);
      control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.tick.update((n) => n + 1));
      fields[field.key] = field;
      controls[field.key] = control;
    }
    this.editor.set({ fields, controls });
    this.tick.update((n) => n + 1);
  }

  private saveFile(request: Observable<{ blob: Blob; fileName: string | null }>, fallback: string): void {
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (file) => FileSaver.saveAs(file.blob, file.fileName ?? fallback),
      error: (err: HttpErrorResponse) => this.snack(err, 'Could not download the OM.'),
    });
  }

  private snack(err: HttpErrorResponse, fallback: string): void {
    const message = err.error?.message;
    this.utilityService.triggerSnackbar(typeof message === 'string' ? message : fallback, 'snackbar-danger');
  }
}

/** Blank → null; a picked date (Date) → ISO; text as typed. */
function serialize(value: unknown): string | null {
  if (isBlankValue(value)) return null;
  if (value instanceof Date) return value.toISOString();
  return typeof value === 'string' ? value : String(value);
}
