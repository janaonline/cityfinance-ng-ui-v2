import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { Location, NgTemplateOutlet } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom, forkJoin, merge, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  FillDisclosureService,
  DISCLOSURE_S3_FOLDER,
  type S3UrlItemDto,
  type DisclosureDocPayload,
  type SubmitDisclosurePayload,
  type DisclosureRecord,
} from './fill-disclosure.service';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href;

const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_FILES_PER_SLOT = 2;
/** Set to the actual URL once the sample document is available. */
const SAMPLE_DOCUMENT_URL: string | null = null;

/** Integer (whole rupees), positive or negative. */
const BALANCE_PATTERN = /^-?\d+$/;

/**
 * Bank account number validator.
 * Rules:
 *   - Only digits (0–9) — no alphabets, no special characters, no spaces
 *   - Minimum 9 digits
 *   - Maximum 18 digits
 *
 * Returns specific error keys so the template can show a targeted message
 * for each broken rule instead of one generic message.
 */
function accountNumberValidator(): ValidatorFn {
  return (ctrl: AbstractControl): ValidationErrors | null => {
    const value = (ctrl.value as string) ?? '';
    if (!value) return null; // Validators.required handles the empty case

    const errors: ValidationErrors = {};

    // Rule 1: no spaces
    if (/\s/.test(value)) errors['hasSpaces'] = true;

    // Rule 2: no alphabets (a–z, A–Z)
    if (/[a-zA-Z]/.test(value)) errors['hasAlphabets'] = true;

    // Rule 3: no special characters (anything that is not a digit, letter, or space)
    if (/[^a-zA-Z0-9\s]/.test(value)) errors['hasSpecialChars'] = true;

    // Rules 4 & 5: length — only meaningful once the value is purely numeric
    if (/^\d+$/.test(value)) {
      if (value.length < 9)  errors['tooShort'] = true; // minimum 9 digits
      if (value.length > 18) errors['tooLong']  = true; // maximum 18 digits
    }

    return Object.keys(errors).length ? errors : null;
  };
}

interface UlbDetails {
  ulbName: string;
  stateName: string;
  selectedYear: string;
  /** MongoDB ObjectId of the selected design year — required for API submission. */
  designYearId?: string;
  /** MongoDB ObjectId of the ULB — read from userData in localStorage. */
  ulbId?: string;
}

interface FileEntry {
  id: string;
  file: File;
  /** Blob URL — used for the open-in-new-tab preview link. */
  objectUrl: string;
  /** Total page count — populated for PDFs only. */
  pageCount?: number;
}

type PeriodForm = FormGroup<{
  balance: FormControl<string | null>;
  accountNumber: FormControl<string | null>;
}>;

interface FcPeriod {
  key: string;
  label: string;
  disclosureOnly: boolean;
  form: PeriodForm;
}

type SlotKey = 'support-14' | 'support-15' | 'doc-14' | 'doc-15';

function createPeriodForm(): PeriodForm {
  return new FormGroup({
    balance: new FormControl('', [
      Validators.required,
      Validators.pattern(BALANCE_PATTERN),
    ]),
    accountNumber: new FormControl('', [
      Validators.required,
      accountNumberValidator(),
    ]),
  });
}

@Component({
  selector: 'app-fill-disclosure',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    NgTemplateOutlet,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  templateUrl: './fill-disclosure.component.html',
  styleUrl: './fill-disclosure.component.scss',
})
export class FillDisclosureComponent {
  private readonly location        = inject(Location);
  private readonly destroyRef      = inject(DestroyRef);
  private readonly disclosureService = inject(FillDisclosureService);

  @ViewChild('fileInput') private readonly fileInputRef!: ElementRef<HTMLInputElement>;
  private pendingFileKey: SlotKey | null = null;

  // ── Static view data ────────────────────────────────────────────────────────

  readonly pageTitle = 'FC Unspent Balance Disclosure';
  readonly pageDescription =
    'Declare the unspent grant balance from the 14th and 15th Finance Commission periods, ' +
    'along with the bank account where those funds are held. Upload a supporting bank document ' +
    '(passbook, bank statement, or equivalent) as evidence for each period.';

  readonly modeOptions: {
    value: 'manual' | 'document-assisted';
    label: string;
    disabled: boolean;
    tooltip: string;
  }[] = [
    { value: 'manual', label: 'Manual Entry', disabled: false, tooltip: '' },
    { value: 'document-assisted', label: 'Document-assisted', disabled: true, tooltip: 'Coming soon' },
  ];

  readonly fields = {
    balance: { label: 'Unspent Balance (₹)', placeholder: 'e.g. 15000 or −5000', required: true },
    accountNumber: { label: 'Bank Account Number', placeholder: 'e.g. 1234567890', required: true },
    supportDoc: { label: 'Supporting Document', hint: 'Passbook, bank statement, or equivalent' },
    docStep: 'Step 1 — Upload bank document',
    disclosureOnlyLabel: 'Disclosure only',
    disclosureOnlyTitle: 'Not counted toward current grant eligibility',
    sampleLink: { label: 'Download sample format', url: SAMPLE_DOCUMENT_URL },
    acceptedFormatsText: 'PDF, JPG or PNG only',
    maxSizeMb: MAX_FILE_SIZE_BYTES / (1024 * 1024),
    declaration:
      'I understand that this submission may contain information entered or modified by other ' +
      'users. I have reviewed the final submission and confirm that the information being ' +
      'submitted is complete and accurate to the best of my knowledge.',
  };

  readonly maxFilesPerSlot = MAX_FILES_PER_SLOT;

  readonly periods: FcPeriod[] = [
    { key: '14', label: '14th Finance Commission', disclosureOnly: false, form: createPeriodForm() },
    { key: '15', label: '15th Finance Commission', disclosureOnly: true, form: createPeriodForm() },
  ];

  // ── Reactive state ───────────────────────────────────────────────────────────

  readonly ulbDetails         = signal<UlbDetails | null>(this.loadUlbDetails());
  readonly activeMode         = signal<'manual' | 'document-assisted'>('manual');
  readonly declarationChecked = signal(false);
  readonly isSaving           = signal(false);
  readonly isLoading          = signal(false);
  readonly saveError          = signal<string | null>(null);

  readonly fileEntries = signal<Record<SlotKey, FileEntry[]>>({
    'support-14': [],
    'support-15': [],
    'doc-14': [],
    'doc-15': [],
  });

  /** Documents already saved in the DB — shown as read-only chips with a View button. */
  readonly savedDocsBySlot = signal<Record<SlotKey, DisclosureDocPayload[]>>({
    'support-14': [],
    'support-15': [],
    'doc-14': [],
    'doc-15': [],
  });

  /** _id of the fetched disclosure record — needed for the signed-URL endpoint. */
  readonly disclosureId = signal<string | null>(null);

  /** True only when a SUBMITTED disclosure was loaded — locks the entire form. */
  private readonly isSubmittedRecord = signal(false);

  /** True when a saved document chip has been removed but not yet persisted via Save. */
  readonly hasPendingDocChanges = signal(false);

  readonly processingKeys = signal<ReadonlySet<SlotKey>>(new Set());

  readonly slotErrors = signal<Record<SlotKey, string | null>>({
    'support-14': null,
    'support-15': null,
    'doc-14': null,
    'doc-15': null,
  });

  private readonly allFormsValid = toSignal(
    merge(...this.periods.map((p) => p.form.statusChanges)).pipe(map(() => this.periods.every((p) => p.form.valid))),
    { initialValue: false },
  );

  readonly canSave = computed(() => {
    if (this.isSaving()) return false;
    const mode = this.activeMode();
    const entries = this.fileEntries();
    const saved   = this.savedDocsBySlot();
    const errs    = this.slotErrors();
    if (!this.allFormsValid()) return false;
    if (!this.declarationChecked()) return false;
    const keys: SlotKey[] = mode === 'manual' ? ['support-14', 'support-15'] : ['doc-14', 'doc-15'];
    return keys.every((k) => (entries[k].length > 0 || saved[k].length > 0) && !errs[k]);
  });

  /** True only when the loaded disclosure has formStatus === 'SUBMITTED' — locks the form. */
  readonly isReadOnly = computed(() => this.isSubmittedRecord());

  readonly infoBannerText = computed(() =>
    this.activeMode() === 'manual'
      ? 'Enter each balance manually and upload the supporting bank document as evidence. All fields are required.'
      : 'Upload your bank document first. The system will attempt to extract values automatically — review carefully before saving.',
  );

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  constructor() {
    this.destroyRef.onDestroy(() => {
      for (const entries of Object.values(this.fileEntries())) {
        for (const entry of entries) URL.revokeObjectURL(entry.objectUrl);
      }
    });

    this.fetchExistingDisclosure();
  }

  private fetchExistingDisclosure(): void {
    const details = this.ulbDetails();
    const designYearId = details?.designYearId;
    if (!designYearId) return;

    this.isLoading.set(true);
    this.disclosureService
      .getDisclosure(designYearId, details?.ulbId)
      .pipe(
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((disclosure) => {
        this.isLoading.set(false);
        if (disclosure) this.patchFormFromDisclosure(disclosure);
      });
  }

  private patchFormFromDisclosure(disclosure: DisclosureRecord): void {
    this.disclosureId.set(disclosure._id);

    const submitted = disclosure.formStatus === 'SUBMITTED';
    this.isSubmittedRecord.set(submitted);

    const mode = disclosure.mode as 'manual' | 'document-assisted';
    this.activeMode.set(mode);

    const prefix = mode === 'manual' ? 'support' : 'doc';
    const slot14 = `${prefix}-14` as SlotKey;
    const slot15 = `${prefix}-15` as SlotKey;

    this.savedDocsBySlot.set({
      'support-14': [],
      'support-15': [],
      'doc-14':     [],
      'doc-15':     [],
      [slot14]: disclosure.fc14.documents ?? [],
      [slot15]: disclosure.fc15.documents ?? [],
    });

    this.periods[0].form.patchValue({
      balance:       String(disclosure.fc14.unspentBalance),
      accountNumber: disclosure.fc14.bankAccountNumber,
    });
    this.periods[1].form.patchValue({
      balance:       String(disclosure.fc15.unspentBalance),
      accountNumber: disclosure.fc15.bankAccountNumber,
    });

    if (submitted) {
      this.periods.forEach((p) => p.form.disable());
    }
  }

  // ── Template helpers ─────────────────────────────────────────────────────────

  /**
   * Returns true when a form control is invalid AND has been interacted with,
   * so validation messages are only shown after the user has touched the field.
   */
  isFieldInvalid(form: PeriodForm, field: 'balance' | 'accountNumber'): boolean {
    const ctrl = form.get(field);
    return ctrl ? ctrl.invalid && (ctrl.dirty || ctrl.touched) : false;
  }

  getFieldError(form: PeriodForm, field: 'balance' | 'accountNumber'): string {
    const errors = form.get(field)?.errors;
    if (!errors) return '';

    if (field === 'balance') {
      if (errors['required']) return 'Unspent Balance is required.';
      if (errors['pattern'])  return 'Enter a whole number. Negative values are allowed (e.g. −5000).';
    }

    if (field === 'accountNumber') {
      if (errors['required'])        return 'Bank Account Number is required.';
      // Character-type errors take priority over length errors
      if (errors['hasSpaces'])       return 'No spaces allowed.';
      if (errors['hasAlphabets'])    return 'No alphabets allowed. Digits only (0–9).';
      if (errors['hasSpecialChars']) return 'No special characters allowed. Digits only (0–9).';
      if (errors['tooShort'])        return 'Minimum 9 digits required.';
      if (errors['tooLong'])         return 'Maximum 18 digits allowed.';
    }

    return '';
  }

  /**
   * Typed accessors for template: `let-key` in ng-template is inferred as `any`,
   * which cannot directly index a typed Record. These helpers cast safely so the
   * template stays free of `$any()` casts.
   */
  entriesFor(key: string): FileEntry[] {
    return this.fileEntries()[key as SlotKey] ?? [];
  }

  savedDocsFor(key: string): DisclosureDocPayload[] {
    return this.savedDocsBySlot()[key as SlotKey] ?? [];
  }

  errorFor(key: string): string | null {
    return this.slotErrors()[key as SlotKey] ?? null;
  }

  isProcessingSlot(key: string): boolean {
    return this.processingKeys().has(key as SlotKey);
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  previewFile(entry: FileEntry): void {
    window.open(entry.objectUrl, '_blank', 'noopener,noreferrer');
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  setMode(mode: 'manual' | 'document-assisted'): void {
    if (mode === this.activeMode()) return;
    // Revoke blob URLs for the slots that are going out of view to avoid leaks.
    const leavingSlots: SlotKey[] = mode === 'manual' ? ['doc-14', 'doc-15'] : ['support-14', 'support-15'];
    this.fileEntries.update((entries) => {
      const updated = { ...entries };
      for (const slot of leavingSlots) {
        for (const entry of entries[slot]) URL.revokeObjectURL(entry.objectUrl);
        updated[slot] = [];
      }
      return updated;
    });
    this.activeMode.set(mode);
  }

  triggerFile(key: string): void {
    this.pendingFileKey = key as SlotKey;
    this.fileInputRef.nativeElement.value = '';
    this.fileInputRef.nativeElement.click();
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.pendingFileKey) return;

    const key = this.pendingFileKey;
    this.pendingFileKey = null;

    if (this.fileEntries()[key].length >= MAX_FILES_PER_SLOT) return;

    this.processingKeys.update((s) => new Set([...s, key]));
    this.slotErrors.update((e) => ({ ...e, [key]: null }));

    const result = await this.validateFile(file);

    this.processingKeys.update((s) => {
      const n = new Set(s);
      n.delete(key);
      return n;
    });

    if (!result.valid) {
      this.slotErrors.update((e) => ({ ...e, [key]: result.error ?? 'File validation failed.' }));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const entry: FileEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      objectUrl,
      pageCount: result.pageCount,
    };

    this.fileEntries.update((entries) => ({
      ...entries,
      [key]: [...entries[key], entry],
    }));
  }

  removeFile(key: string, index: number): void {
    const typedKey = key as SlotKey;
    this.fileEntries.update((entries) => {
      const list = [...entries[typedKey]];
      const [removed] = list.splice(index, 1);
      URL.revokeObjectURL(removed.objectUrl);
      return { ...entries, [typedKey]: list };
    });
    this.slotErrors.update((e) => ({ ...e, [typedKey]: null }));
  }

  onDeclarationChange(event: Event): void {
    this.declarationChecked.set((event.target as HTMLInputElement).checked);
  }

  async saveDisclosure(): Promise<void> {
    if (!this.canSave()) return;

    this.isSaving.set(true);
    this.saveError.set(null);

    const mode      = this.activeMode();
    const slotKeys  = (mode === 'manual'
      ? ['support-14', 'support-15']
      : ['doc-14', 'doc-15']) as SlotKey[];
    const entries   = this.fileEntries();

    // Flatten all file entries, preserving which slot each belongs to.
    const fileUploads: Array<{ slotKey: SlotKey; entry: FileEntry }> = slotKeys.flatMap(
      (k) => entries[k].map((entry) => ({ slotKey: k, entry })),
    );

    try {
      const designYearId = this.ulbDetails()?.designYearId;
      if (!designYearId) {
        throw new Error('Design year is missing. Please reload the page and try again.');
      }

      // 1. Request presigned PUT URLs for every file in one batch call.
      const signItems: S3UrlItemDto[] = fileUploads.map(({ entry }) => ({
        fileName: entry.file.name,
        mimeType: entry.file.type,
        fileSize: entry.file.size,
        pages:    entry.pageCount ?? 0,
        folder:   DISCLOSURE_S3_FOLDER,
      }));
      const signedUrls = await firstValueFrom(this.disclosureService.getSignedUrls(signItems));

      // 2. Upload all files to S3 in parallel using the presigned PUT URLs.
      const uploads$ = signedUrls.length > 0
        ? forkJoin(signedUrls.map((r, i) => this.disclosureService.uploadToS3(r.url, fileUploads[i].entry.file)))
        : of(null);
      await firstValueFrom(uploads$);

      // 3. Build per-slot document payloads from the S3 paths returned.
      const docsBySlot = new Map<SlotKey, DisclosureDocPayload[]>(
        slotKeys.map((k) => [k, []]),
      );
      signedUrls.forEach((result, i) => {
        const { slotKey, entry } = fileUploads[i];
        docsBySlot.get(slotKey)!.push({
          filepath:     result.path,
          originalName: entry.file.name,
          mimeType:     entry.file.type,
          sizeKb:       Math.round(entry.file.size / 1024),
          pages:        entry.pageCount ?? 0,
        });
      });

      const prefix     = mode === 'manual' ? 'support' : 'doc';
      const saved      = this.savedDocsBySlot();
      const fc14Period = this.periods[0];
      const fc15Period = this.periods[1];

      const payload: SubmitDisclosurePayload = {
        designYearId,
        mode,
        fc14: {
          unspentBalance:    Number(fc14Period.form.get('balance')?.value ?? 0),
          bankAccountNumber: fc14Period.form.get('accountNumber')?.value ?? '',
          // Keep previously saved docs + append newly uploaded ones.
          documents: [
            ...(saved[`${prefix}-14` as SlotKey] ?? []),
            ...(docsBySlot.get(`${prefix}-14` as SlotKey) ?? []),
          ],
        },
        fc15: {
          unspentBalance:    Number(fc15Period.form.get('balance')?.value ?? 0),
          bankAccountNumber: fc15Period.form.get('accountNumber')?.value ?? '',
          documents: [
            ...(saved[`${prefix}-15` as SlotKey] ?? []),
            ...(docsBySlot.get(`${prefix}-15` as SlotKey) ?? []),
          ],
        },
      };

      // 4. Persist the disclosure record.
      await firstValueFrom(this.disclosureService.submitDisclosure(payload));

      this.hasPendingDocChanges.set(false);
      this.location.back();
    } catch (err) {
      this.saveError.set(
        err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.',
      );
    } finally {
      this.isSaving.set(false);
    }
  }

  removeSavedDoc(key: string, index: number): void {
    const typedKey = key as SlotKey;
    this.savedDocsBySlot.update((docs) => {
      const list = [...docs[typedKey]];
      list.splice(index, 1);
      return { ...docs, [typedKey]: list };
    });
    this.hasPendingDocChanges.set(true);
  }

  async viewSavedDoc(filepath: string): Promise<void> {
    const disclosureId = this.disclosureId();
    if (!disclosureId) return;
    try {
      const result = await firstValueFrom(
        this.disclosureService.getDocumentSignedUrl(disclosureId, filepath),
      );
      window.open(result.signedUrl, '_blank', 'noopener,noreferrer');
    } catch {
      // Signed URL fetch failed — nothing to open.
    }
  }

  goBack(): void {
    this.location.back();
  }

  // ── Private: file validation ─────────────────────────────────────────────────

  private async validateFile(file: File): Promise<{ valid: boolean; error?: string; pageCount?: number }> {
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return { valid: false, error: 'Only PDF, JPG, and PNG files are allowed.' };
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return { valid: false, error: 'File size must not exceed 5 MB.' };
    }
    if (file.type === 'application/pdf') {
      return this.validatePdfNotBlank(file);
    }
    return { valid: true };
  }

  private async validatePdfNotBlank(file: File): Promise<{ valid: boolean; error?: string; pageCount?: number }> {
    let data: Uint8Array;
    try {
      data = new Uint8Array(await file.arrayBuffer());
    } catch {
      return { valid: false, error: 'Could not read the file. Please try again.' };
    }

    const loadingTask = getDocument({ data });
    let isPasswordProtected = false;
    loadingTask.onPassword = () => {
      isPasswordProtected = true;
      loadingTask.destroy();
    };

    let pdf: Awaited<typeof loadingTask.promise>;
    try {
      pdf = await loadingTask.promise;
    } catch (err) {
      if (isPasswordProtected || (err as { name?: string })?.name === 'PasswordException') {
        return {
          valid: false,
          error: 'Password-protected files are not allowed. Please upload an unlocked file.',
        };
      }
      return { valid: false, error: 'Could not read the PDF. Please upload a valid file.' };
    }

    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);

        // Fast path: extractable text means the page has content.
        const textContent = await page.getTextContent();
        if (textContent.items.length > 0) {
          return { valid: true, pageCount: pdf.numPages };
        }

        // Slow path: render at low resolution and check for any non-white pixel.
        // This catches image-only content, scanned documents, and vector drawings,
        // and avoids false positives from state-only operators (q, Q, cm, gs…)
        // that appear even on blank pages.
        const scale    = 0.3;
        const viewport = page.getViewport({ scale });
        const canvas   = document.createElement('canvas');
        canvas.width   = Math.floor(viewport.width);
        canvas.height  = Math.floor(viewport.height);
        const ctx      = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvas, canvasContext: ctx, viewport }).promise;
          const { data: pixels } = ctx.getImageData(0, 0, canvas.width, canvas.height);
          for (let p = 0; p < pixels.length; p += 4) {
            // Threshold of 240 tolerates JPEG compression artifacts near white.
            if (pixels[p] < 240 || pixels[p + 1] < 240 || pixels[p + 2] < 240) {
              return { valid: true, pageCount: pdf.numPages };
            }
          }
        }
      } catch {
        // Treat unreadable page as blank; continue to remaining pages.
      }
    }

    return { valid: false, error: 'The uploaded PDF appears to be blank. Please upload a document with visible content.' };
  }

  // ── Private: data loading ────────────────────────────────────────────────────

  private loadUlbDetails(): UlbDetails | null {
    try {
      const raw = localStorage.getItem('xvifc_ulb_details');
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<UlbDetails>;
      if (!parsed.ulbName || !parsed.stateName || !parsed.selectedYear) return null;

      // userData.ulb is the ULB ObjectId set by the auth layer on login.
      const userDataRaw = localStorage.getItem('userData');
      const ulbId: string | undefined =
        (userDataRaw ? (JSON.parse(userDataRaw) as { ulb?: string })?.ulb : undefined) ?? undefined;

      return {
        ulbName:      parsed.ulbName,
        stateName:    parsed.stateName,
        selectedYear: parsed.selectedYear,
        // xvifc_selectedYearId is written by the years-selection component on year change.
        designYearId: parsed.designYearId ?? localStorage.getItem('xvifc_selectedYearId') ?? undefined,
        ulbId,
      };
    } catch {
      return null;
    }
  }
}
