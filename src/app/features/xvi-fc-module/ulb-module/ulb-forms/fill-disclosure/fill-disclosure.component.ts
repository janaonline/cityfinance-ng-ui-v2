import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
  FormArray,
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
  type S3UrlResult,
  type DisclosureDocPayload,
  type BankAccountPayload,
  type SubmitDisclosurePayload,
  type FcPeriodPayload,
  type DisclosureRecord,
} from './fill-disclosure.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { checkPdfHasContent } from '../../../../../shared/dynamic-form/utils/pdf-blank-check.util';

const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_FILES_PER_SLOT = 2;
const SAMPLE_DOCUMENT_URL: string | null = null;

const BALANCE_MIN = -9_999_999_999;
const BALANCE_MAX =  9_999_999_999;

/** Validates unspent balance: integer format, rejects −0, enforces range limits. */
function balanceValidator(): ValidatorFn {
  return (ctrl: AbstractControl): ValidationErrors | null => {
    const raw = (ctrl.value as string | null)?.trim() ?? '';
    if (!raw) return null; // Validators.required handles the empty case
    // Accepts: 0, 15000, -5000  |  Rejects: -0, 1.5, abc, --5, 01
    if (!/^(-[1-9]\d*|[1-9]\d*|0)$/.test(raw)) return { balanceFormat: true };
    const num = Number(raw);
    if (num < BALANCE_MIN) return { balanceTooLow: true };
    if (num > BALANCE_MAX) return { balanceTooHigh: true };
    return null;
  };
}

/** 9–18 digits only, character-type rules checked separately for targeted error messages. */
function accountNumberValidator(): ValidatorFn {
  return (ctrl: AbstractControl): ValidationErrors | null => {
    const value = (ctrl.value as string) ?? '';
    if (!value) return null;

    const errors: ValidationErrors = {};
    if (/\s/.test(value))         errors['hasSpaces']       = true;
    if (/[a-zA-Z]/.test(value))   errors['hasAlphabets']    = true;
    if (/[^a-zA-Z0-9\s]/.test(value)) errors['hasSpecialChars'] = true;
    if (/^\d+$/.test(value)) {
      if (value.length < 9)  errors['tooShort'] = true;
      if (value.length > 18) errors['tooLong']  = true;
    }

    return Object.keys(errors).length ? errors : null;
  };
}

interface UlbDetails {
  ulbName: string;
  stateName: string;
  selectedYear: string;
  designYearId?: string;
  ulbId?: string;
}

interface FileEntry {
  id: string;
  file: File;
  objectUrl: string;
  pageCount?: number;
}

type PeriodKey = '14' | '15';

type AccountForm = FormGroup<{
  balance:       FormControl<string | null>;
  accountNumber: FormControl<string | null>;
}>;

interface FcPeriod {
  key:            PeriodKey;
  label:          string;
  disclosureOnly: boolean;
  accounts:       FormArray<AccountForm>;
}

function createAccountForm(): AccountForm {
  return new FormGroup({
    balance: new FormControl('', [
      Validators.required,
      balanceValidator(),
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
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  templateUrl: './fill-disclosure.component.html',
  styleUrl: './fill-disclosure.component.scss',
})
export class FillDisclosureComponent {
  private readonly location          = inject(Location);
  private readonly destroyRef        = inject(DestroyRef);
  private readonly cdr               = inject(ChangeDetectorRef);
  private readonly disclosureService = inject(FillDisclosureService);

  @ViewChild('fileInput') private readonly fileInputRef!: ElementRef<HTMLInputElement>;
  private pendingFileKey: string | null = null;

  // ── Static view data ──────────────────────────────────────────────────────────

  readonly pageTitle = 'FC Unspent Balance Disclosure';
  readonly pageDescription =
    'Declare the unspent grant balance from the 14th and 15th Finance Commission periods. ' +
    'For each bank account where those funds are held, enter the balance, the account number, ' +
    'and upload a supporting bank document (passbook, bank statement, or equivalent) as evidence.';

  readonly fields = {
    balance:       { label: 'Unspent Balance (₹)', placeholder: 'e.g. 15000 or −5000', required: true },
    accountNumber: { label: 'Bank Account Number',  placeholder: 'e.g. 1234567890',     required: true },
    supportDoc:    { label: 'Supporting Document',  hint: 'Passbook, bank statement, or equivalent' },
    sampleLink:    { label: 'Download sample format', url: SAMPLE_DOCUMENT_URL },
    acceptedFormatsText: 'PDF, JPG or PNG only',
    maxSizeMb:     MAX_FILE_SIZE_BYTES / (1024 * 1024),
    disclosureOnlyLabel: 'Disclosure only',
    disclosureOnlyTitle: 'Not counted toward current grant eligibility',
    declaration:
      'I understand that this submission may contain information entered or modified by other ' +
      'users. I have reviewed the final submission and confirm that the information being ' +
      'submitted is complete and accurate to the best of my knowledge.',
  };

  readonly maxFilesPerSlot = MAX_FILES_PER_SLOT;

  readonly periods: FcPeriod[] = [
    { key: '14', label: '14th Finance Commission', disclosureOnly: false, accounts: new FormArray([createAccountForm()]) },
    { key: '15', label: '15th Finance Commission', disclosureOnly: true,  accounts: new FormArray([createAccountForm()]) },
  ];

  // ── Reactive state ─────────────────────────────────────────────────────────────

  readonly ulbDetails         = signal<UlbDetails | null>(this.loadUlbDetails());
  readonly declarationChecked = signal(false);
  readonly isSaving           = signal(false);
  readonly isLoading          = signal(false);
  readonly saveError          = signal<string | null>(null);

  readonly fileEntries = signal<Record<string, FileEntry[]>>({
    '14-0': [],
    '15-0': [],
  });

  readonly savedDocsBySlot = signal<Record<string, DisclosureDocPayload[]>>({
    '14-0': [],
    '15-0': [],
  });

  readonly disclosureId = signal<string | null>(null);

  private readonly isSubmittedRecord = signal(false);

  readonly hasPendingDocChanges = signal(false);

  readonly processingKeys = signal<ReadonlySet<string>>(new Set());

  readonly slotErrors = signal<Record<string, string | null>>({
    '14-0': null,
    '15-0': null,
  });

  /** Tracks the number of bank accounts per period so computed() can react to add/remove. */
  readonly accountCounts = signal<Record<PeriodKey, number>>({ '14': 1, '15': 1 });

  private readonly allFormsValid = toSignal(
    merge(...this.periods.map((p) => p.accounts.statusChanges)).pipe(
      map(() => this.periods.every((p) => p.accounts.valid)),
    ),
    { initialValue: false },
  );

  /** Flat list of all accountNumber values across both FC periods — updates on every keystroke. */
  private readonly allAccountNumbers = toSignal(
    merge(...this.periods.map((p) => p.accounts.valueChanges)).pipe(
      map(() => this.collectAccountNumbers()),
    ),
    { initialValue: this.collectAccountNumbers() },
  );

  /** Set of account numbers that appear more than once across all periods and all slots. */
  readonly duplicateAccountNumbers = computed(() => {
    const seen  = new Set<string>();
    const dupes = new Set<string>();
    for (const num of this.allAccountNumbers()) {
      if (!num) continue;
      if (seen.has(num)) dupes.add(num);
      else seen.add(num);
    }
    return dupes;
  });

  readonly canSave = computed(() => {
    if (this.isSaving())                          return false;
    if (!this.allFormsValid())                    return false;
    if (!this.declarationChecked())               return false;
    if (this.duplicateAccountNumbers().size > 0)  return false;

    const entries = this.fileEntries();
    const saved   = this.savedDocsBySlot();
    const errs    = this.slotErrors();
    const counts  = this.accountCounts();

    for (const period of this.periods) {
      const count = counts[period.key];
      for (let i = 0; i < count; i++) {
        const key    = `${period.key}-${i}`;
        const hasDoc = (entries[key]?.length ?? 0) > 0 || (saved[key]?.length ?? 0) > 0;
        if (!hasDoc || errs[key]) return false;
      }
    }

    return true;
  });

  readonly isReadOnly = computed(() => this.isSubmittedRecord());

  // ── Lifecycle ─────────────────────────────────────────────────────────────────

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
    if (!details?.designYearId) return;

    this.isLoading.set(true);
    this.disclosureService
      .getDisclosure(details.designYearId, details.ulbId)
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

    const newFileEntries:  Record<string, FileEntry[]>           = {};
    const newSavedDocs:    Record<string, DisclosureDocPayload[]> = {};
    const newSlotErrors:   Record<string, string | null>          = {};
    const newCounts:       Record<PeriodKey, number>              = { '14': 1, '15': 1 };

    for (const period of this.periods) {
      const periodData   = period.key === '14' ? disclosure.fc14 : disclosure.fc15;
      const bankAccounts = periodData?.manual?.bankAccounts ?? [];
      const count        = Math.max(bankAccounts.length, 1);

      // Rebuild the FormArray to exactly match the loaded data.
      while (period.accounts.length > 0) period.accounts.removeAt(0);
      for (let i = 0; i < count; i++) period.accounts.push(createAccountForm());

      bankAccounts.forEach((acct, i) => {
        period.accounts.at(i).patchValue({
          balance:       String(acct.unspentBalance),
          accountNumber: acct.accountNumber,
        });
        const key = `${period.key}-${i}`;
        newFileEntries[key] = [];
        newSavedDocs[key]   = acct.documents ?? [];
        newSlotErrors[key]  = null;
      });

      if (bankAccounts.length === 0) {
        newFileEntries[`${period.key}-0`] = [];
        newSavedDocs[`${period.key}-0`]   = [];
        newSlotErrors[`${period.key}-0`]  = null;
      }

      if (submitted) period.accounts.disable();
      newCounts[period.key] = count;
    }

    for (const entries of Object.values(this.fileEntries())) {
      for (const e of entries) URL.revokeObjectURL(e.objectUrl);
    }

    this.fileEntries.set(newFileEntries);
    this.savedDocsBySlot.set(newSavedDocs);
    this.slotErrors.set(newSlotErrors);
    this.accountCounts.set(newCounts);
    this.cdr.markForCheck();
  }

  // ── Account management ────────────────────────────────────────────────────────

  readonly maxAccountsPerPeriod = 2;

  addAccount(periodKey: PeriodKey): void {
    const period = this.periods.find((p) => p.key === periodKey)!;
    if (period.accounts.length >= this.maxAccountsPerPeriod) return;
    const idx    = period.accounts.length;
    period.accounts.push(createAccountForm());

    const key = `${periodKey}-${idx}`;
    this.fileEntries.update((e)  => ({ ...e,  [key]: [] }));
    this.savedDocsBySlot.update((s) => ({ ...s, [key]: [] }));
    this.slotErrors.update((e)  => ({ ...e,  [key]: null }));
    this.accountCounts.update((c) => ({ ...c, [periodKey]: period.accounts.length }));
    this.cdr.markForCheck();
  }

  removeAccount(periodKey: PeriodKey, index: number): void {
    const period = this.periods.find((p) => p.key === periodKey)!;
    if (period.accounts.length <= 1) return;

    const removedKey = `${periodKey}-${index}`;
    for (const entry of (this.fileEntries()[removedKey] ?? [])) URL.revokeObjectURL(entry.objectUrl);

    period.accounts.removeAt(index);
    const remaining = period.accounts.length;

    const rekey = <T>(map: Record<string, T>): Record<string, T> => {
      const result = { ...map };
      delete result[removedKey];
      for (let i = index; i < remaining; i++) {
        result[`${periodKey}-${i}`]     = result[`${periodKey}-${i + 1}`];
        delete result[`${periodKey}-${i + 1}`];
      }
      return result;
    };

    this.fileEntries.update((e)  => rekey(e));
    this.savedDocsBySlot.update((s) => rekey(s));
    this.slotErrors.update((e)  => rekey(e));
    this.accountCounts.update((c) => ({ ...c, [periodKey]: remaining }));
    this.hasPendingDocChanges.set(true);
    this.cdr.markForCheck();
  }

  // ── Template helpers ──────────────────────────────────────────────────────────

  accountFormAt(period: FcPeriod, index: number): AccountForm {
    return period.accounts.at(index);
  }

  isDuplicateAccount(period: FcPeriod, index: number): boolean {
    const val = (period.accounts.at(index).get('accountNumber')?.value as string | null)?.trim() ?? '';
    return val.length > 0 && this.duplicateAccountNumbers().has(val);
  }

  isFieldInvalid(form: AccountForm, field: 'balance' | 'accountNumber'): boolean {
    const ctrl = form.get(field);
    return ctrl ? ctrl.invalid && (ctrl.dirty || ctrl.touched) : false;
  }

  getFieldError(form: AccountForm, field: 'balance' | 'accountNumber'): string {
    const errors = form.get(field)?.errors;
    if (!errors) return '';

    if (field === 'balance') {
      if (errors['required'])       return 'Unspent Balance is required.';
      if (errors['balanceFormat'])  return 'Enter a whole number (e.g. 15000 or −5000). Zero (0) is allowed; −0 is not.';
      if (errors['balanceTooLow'])  return 'Value cannot be less than −9,999,999,999.';
      if (errors['balanceTooHigh']) return 'Value cannot exceed 9,999,999,999.';
    }

    if (field === 'accountNumber') {
      if (errors['required'])        return 'Bank Account Number is required.';
      if (errors['hasSpaces'])       return 'No spaces allowed.';
      if (errors['hasAlphabets'])    return 'No alphabets allowed. Digits only (0–9).';
      if (errors['hasSpecialChars']) return 'No special characters allowed. Digits only (0–9).';
      if (errors['tooShort'])        return 'Minimum 9 digits required.';
      if (errors['tooLong'])         return 'Maximum 18 digits allowed.';
    }

    return '';
  }

  entriesFor(key: string): FileEntry[] {
    return this.fileEntries()[key] ?? [];
  }

  savedDocsFor(key: string): DisclosureDocPayload[] {
    return this.savedDocsBySlot()[key] ?? [];
  }

  errorFor(key: string): string | null {
    return this.slotErrors()[key] ?? null;
  }

  isProcessingSlot(key: string): boolean {
    return this.processingKeys().has(key);
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024)        return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  previewFile(entry: FileEntry): void {
    window.open(entry.objectUrl, '_blank', 'noopener,noreferrer');
  }

  // ── Actions ───────────────────────────────────────────────────────────────────

  triggerFile(key: string): void {
    this.pendingFileKey = key;
    this.fileInputRef.nativeElement.value = '';
    this.fileInputRef.nativeElement.click();
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file || !this.pendingFileKey) return;

    const key = this.pendingFileKey;
    this.pendingFileKey = null;

    if ((this.fileEntries()[key]?.length ?? 0) >= MAX_FILES_PER_SLOT) return;

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
      id:        `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      objectUrl,
      pageCount: result.pageCount,
    };

    this.fileEntries.update((entries) => ({
      ...entries,
      [key]: [...(entries[key] ?? []), entry],
    }));
  }

  removeFile(key: string, index: number): void {
    this.fileEntries.update((entries) => {
      const list = [...(entries[key] ?? [])];
      const [removed] = list.splice(index, 1);
      URL.revokeObjectURL(removed.objectUrl);
      return { ...entries, [key]: list };
    });
    this.slotErrors.update((e) => ({ ...e, [key]: null }));
  }

  onDeclarationChange(event: Event): void {
    this.declarationChecked.set((event.target as HTMLInputElement).checked);
  }

  async saveDisclosure(): Promise<void> {
    if (!this.canSave()) return;

    this.isSaving.set(true);
    this.saveError.set(null);

    const designYearId = this.ulbDetails()?.designYearId;
    if (!designYearId) {
      this.saveError.set('Design year is missing. Please reload the page and try again.');
      this.isSaving.set(false);
      return;
    }

    try {
      const entries = this.fileEntries();

      // Collect all new file uploads across every account and period.
      const fileUploads: Array<{ slotKey: string; entry: FileEntry }> = [];
      for (const period of this.periods) {
        for (let i = 0; i < period.accounts.length; i++) {
          const slotKey = `${period.key}-${i}`;
          for (const entry of (entries[slotKey] ?? [])) {
            fileUploads.push({ slotKey, entry });
          }
        }
      }

      // 1. Request presigned PUT URLs for every file in one batch call.
      let signedUrls: S3UrlResult[] = [];
      if (fileUploads.length > 0) {
        const signItems: S3UrlItemDto[] = fileUploads.map(({ entry }) => ({
          fileName: entry.file.name,
          mimeType: entry.file.type,
          fileSize: entry.file.size,
          pages:    entry.pageCount ?? 0,
          folder:   DISCLOSURE_S3_FOLDER,
        }));
        signedUrls = await firstValueFrom(this.disclosureService.getSignedUrls(signItems));

        // 2. Upload all files to S3 in parallel.
        await firstValueFrom(
          forkJoin(signedUrls.map((r, i) => this.disclosureService.uploadToS3(r.url, fileUploads[i].entry.file))),
        );
      }

      // 3. Build a map of slotKey → newly uploaded docs.
      const newDocsBySlot = new Map<string, DisclosureDocPayload[]>();
      signedUrls.forEach((result, i) => {
        const { slotKey, entry } = fileUploads[i];
        if (!newDocsBySlot.has(slotKey)) newDocsBySlot.set(slotKey, []);
        newDocsBySlot.get(slotKey)!.push({
          filepath:     result.path,
          originalName: entry.file.name,
          mimeType:     entry.file.type,
          sizeKb:       Math.round(entry.file.size / 1024),
          pages:        entry.pageCount ?? 0,
        });
      });

      // 4. Build the submission payload.
      const saved = this.savedDocsBySlot();

      const buildFcPeriod = (period: FcPeriod): FcPeriodPayload => ({
        manual: {
          bankAccounts: Array.from<unknown, BankAccountPayload>(
            { length: period.accounts.length },
            (_, i) => {
              const form    = period.accounts.at(i);
              const slotKey = `${period.key}-${i}`;
              return {
                accountNumber:  form.get('accountNumber')?.value ?? '',
                unspentBalance: Number(form.get('balance')?.value ?? 0),
                documents: [
                  ...(saved[slotKey]               ?? []),
                  ...(newDocsBySlot.get(slotKey)   ?? []),
                ],
              };
            },
          ),
        },
      });

      const payload: SubmitDisclosurePayload = {
        designYearId,
        fc14: buildFcPeriod(this.periods[0]),
        fc15: buildFcPeriod(this.periods[1]),
      };

      // 5. Persist the disclosure record.
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
    this.savedDocsBySlot.update((docs) => {
      const list = [...(docs[key] ?? [])];
      list.splice(index, 1);
      return { ...docs, [key]: list };
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

  // ── Private: helpers ─────────────────────────────────────────────────────────

  private collectAccountNumbers(): string[] {
    return this.periods.flatMap((p) =>
      Array.from({ length: p.accounts.length }, (_, i) =>
        (p.accounts.at(i).get('accountNumber')?.value as string | null)?.trim() ?? '',
      ),
    );
  }

  // ── Private: file validation ──────────────────────────────────────────────────

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
    // Fast %PDF- header check before spinning up pdfjs.
    try {
      const h = new Uint8Array(await file.slice(0, 5).arrayBuffer());
      if (!(h[0] === 0x25 && h[1] === 0x50 && h[2] === 0x44 && h[3] === 0x46 && h[4] === 0x2d)) {
        return { valid: false, error: 'The file does not appear to be a valid PDF.' };
      }
    } catch {
      return { valid: false, error: 'Could not read the file. Please try again.' };
    }

    // Render-based blank detection via pdf.js — see checkPdfHasContent for why unexpected
    // failures (e.g. offline) fail open instead of blocking the user.
    const result = await checkPdfHasContent(file);
    if (result.fatalError === 'password') {
      return { valid: false, error: 'Password-protected files are not allowed. Please upload an unlocked file.' };
    }
    if (result.fatalError === 'invalid') {
      return { valid: false, error: 'This PDF is corrupted or unreadable. Please upload a valid file.' };
    }
    if (result.pageCount === 0) {
      return { valid: false, error: 'This PDF has no pages. Please upload a valid document.' };
    }
    if (!result.hasContent) {
      return { valid: false, error: 'The PDF appears to be blank. Please upload a document with visible content.' };
    }

    return { valid: true, pageCount: result.pageCount ?? undefined };
  }

  // ── Private: data loading ─────────────────────────────────────────────────────

  private loadUlbDetails(): UlbDetails | null {
    try {
      const raw = localStorage.getItem('xvifc_ulb_details');
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<UlbDetails>;
      if (!parsed.ulbName || !parsed.stateName || !parsed.selectedYear) return null;

      const userDataRaw = localStorage.getItem('userData');
      const ulbId: string | undefined =
        (userDataRaw ? (JSON.parse(userDataRaw) as { ulb?: string })?.ulb : undefined) ?? undefined;

      return {
        ulbName:      parsed.ulbName,
        stateName:    parsed.stateName,
        selectedYear: parsed.selectedYear,
        designYearId: parsed.designYearId ?? localStorage.getItem('xvifc_selectedYearId') ?? undefined,
        ulbId,
      };
    } catch {
      return null;
    }
  }
}
