import { Component, computed, inject, signal } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { MATERIAL_THEME_CLASS } from '../../../../../core/theming/material-theme.providers';
import { UtilityService } from '../../../../../core/services/utility.service';
import { ConfirmDialogService } from '../../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { NoteDialogService } from '../../../../../shared/components/note-dialog/note-dialog.service';
import { XVIFC_LS_KEYS } from '../../../shared/years-selection/years-selection.component';
import type { UploadPageConfig } from '../../../ulb-module/ulb-forms/upload-documents/upload-documents.component';
import { UploadDocumentsService } from '../../../ulb-module/ulb-forms/upload-documents/upload-documents.service';

type SectionKey = 'auditedData' | 'unauditedData';
type TabKey = SectionKey | 'PFMS';
type Decision = 'APPROVED' | 'RETURNED';

interface DecisionEntry {
  status: Decision;
  note: string | null;
  decidedAt: string;
}

interface SectionPermissions {
  canView: boolean;
  canUpload: boolean;
  canReview: boolean;
  canApprove: boolean;
  canMohuaReview: boolean;
  canMohuaApprove: boolean;
}

interface StatusDoc {
  docId: string;
  uploadStatus: string;
  processingStatus: 'NOT_STARTED' | 'PROCESSING' | 'PASSED' | 'FAILED';
  currentUpload: {
    uploadId: string;
    versionLabel: string;
    file: { originalName: string; sizeKb: number };
    userInfo: { userId: string; role: string } | null;
    uploadedAt: string;
  } | null;
  stateDecision: DecisionEntry[];
}

interface StatusSection {
  form_status: string;
  form_status_id: number;
  yearId: string;
  year: string;
  permissions: SectionPermissions;
  stateDecision: DecisionEntry | null;
  mohuaDecision: DecisionEntry | null;
  documents: StatusDoc[];
}

interface StatusResponse {
  annualAccountId: string | null;
  ulbName: string | null;
  ulbCode: string | null;
  auditedData: StatusSection | null;
  unauditedData: StatusSection | null;
}

interface ReviewDocRow {
  docId: string;
  title: string;
  subtitle: string;
  processingStatus: StatusDoc['processingStatus'];
  fileName: string | null;
  sizeKb: number | null;
  versionLabel: string | null;
  uploadedAt: Date | null;
  uploaderRole: string | null;
  uploadId: string | null;
  latestDecision: DecisionEntry | null;
  /** True when the ULB re-uploaded a corrected file after STATE's last decision on this document. */
  wasReuploaded: boolean;
}

interface BankAccountData {
  id: string;
  ifscCode: string;
  bankDetails: { name: string; branch: string; address: string; city: string; state?: string; micr: string | null };
  accountNumberMasked: string;
  accountNumberLast4: string;
  currentFormStatus: number;
  currentFormStatusLabel: string;
  stateDecision: DecisionEntry | null;
  mohuaDecision: DecisionEntry | null;
  permissions: { canReview: boolean; canApprove: boolean };
}

/** Raw shape returned by GET /xvi-fc/bank-account — the record id comes back as `_id`, not `id`. */
type BankAccountApiResponse = Omit<BankAccountData, 'id'> & { _id: string };

const NOT_STARTED_PERMISSIONS: SectionPermissions = {
  canView: true,
  canUpload: false,
  canReview: false,
  canApprove: false,
  canMohuaReview: false,
  canMohuaApprove: false,
};

const NOT_STARTED_SECTION: StatusSection = {
  form_status: 'NOT_STARTED',
  form_status_id: 1,
  yearId: '',
  year: '',
  permissions: NOT_STARTED_PERMISSIONS,
  stateDecision: null,
  mohuaDecision: null,
  documents: [],
};

const API_ANNUAL = `${environment.api.url2}xvi-fc/annual-account/`;
const API_BANK = `${environment.api.url2}xvi-fc/bank-account/`;

function unwrap<T>(response: unknown): T {
  const r = response as Record<string, unknown>;
  return (r && 'data' in r ? r['data'] : r) as T;
}

// Numeric-state trigger: :increment plays when the bound index goes up (tab moved right),
// :decrement when it goes down (tab moved left) — Angular resolves the direction automatically.
const TAB_SLIDE = trigger('tabSlide', [
  transition(':increment', [
    style({ transform: 'translateX(40px)', opacity: 0 }),
    animate('420ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
  ]),
  transition(':decrement', [
    style({ transform: 'translateX(-40px)', opacity: 0 }),
    animate('420ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
  ]),
]);

const RETURN_NOTE_MIN_LENGTH = 50;
const RETURN_NOTE_MAX_LENGTH = 200;

@Component({
  selector: 'app-annual-account-review',
  standalone: true,
  imports: [DatePipe, MatButtonModule, MatTooltipModule],
  templateUrl: './annual-account-review.component.html',
  styleUrl: './annual-account-review.component.scss',
  animations: [TAB_SLIDE],
})
export class AnnualAccountReviewComponent {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly utilityService = inject(UtilityService);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly noteDialogService = inject(NoteDialogService);
  private readonly uploadDocumentsService = inject(UploadDocumentsService);
  private readonly themeClass = inject(MATERIAL_THEME_CLASS, { optional: true });

  private readonly ulbId = this.route.snapshot.paramMap.get('ulbId')!;
  private readonly ulbNameFallback = this.route.snapshot.queryParamMap.get('ulbName');

  readonly sectionTabs: ReadonlyArray<{ key: TabKey | null; label: string; icon: string; disabled?: boolean }> = [
    { key: 'auditedData', label: 'Audited', icon: 'file-earmark-text' },
    { key: 'unauditedData', label: 'Provisional', icon: 'file-earmark-spreadsheet' },
    { key: 'PFMS', label: 'PFMS', icon: 'bank' },
    { key: null, label: 'Service Level Benchmarks', icon: 'speedometer2', disabled: true },
  ];

  readonly activeSection = signal<TabKey>(this.resolveInitialSection());
  readonly statusData = signal<StatusResponse | null>(null);
  readonly configBySection = signal<Partial<Record<SectionKey, UploadPageConfig>>>({});

  readonly bankAccountData = signal<BankAccountData | null>(null);
  readonly bankAccountLoaded = signal(false);

  readonly isLoading = signal(true);
  readonly isDeciding = signal(false);
  readonly loadError = signal(false);

  readonly currentSection = computed(() => {
    const key = this.activeSection();
    if (key === 'PFMS') return null;
    return this.statusData()?.[key] ?? null;
  });
  readonly ulbName = computed(() => this.statusData()?.ulbName ?? this.ulbNameFallback ?? '');
  readonly activeSectionIndex = computed(() => this.sectionTabs.findIndex((tab) => tab.key === this.activeSection()));

  readonly rows = computed<ReviewDocRow[]>(() => {
    const key = this.activeSection();
    if (key === 'PFMS') return [];

    const section = this.currentSection();
    const config = this.configBySection()[key];
    if (!section || !config) return [];

    return config.documents.map((def): ReviewDocRow => {
      const doc = section.documents.find((d) => d.docId === def.id);
      const rawLatestDecision = doc?.stateDecision.length ? doc.stateDecision[doc.stateDecision.length - 1] : null;
      const uploadedAt = doc?.currentUpload?.uploadedAt ? new Date(doc.currentUpload.uploadedAt) : null;

      // A decision only counts against the file it was made on. If the ULB re-uploaded a
      // corrected file after that decision, the old APPROVED/RETURNED verdict is stale —
      // treat the document as freshly pending review again until STATE re-decides it.
      const isStale =
        rawLatestDecision && uploadedAt ? uploadedAt.getTime() > new Date(rawLatestDecision.decidedAt).getTime() : false;
      const latestDecision = isStale ? null : rawLatestDecision;

      return {
        docId: def.id,
        title: def.title,
        subtitle: def.subtitle,
        processingStatus: doc?.processingStatus ?? 'NOT_STARTED',
        fileName: doc?.currentUpload?.file.originalName ?? null,
        sizeKb: doc?.currentUpload?.file.sizeKb ?? null,
        versionLabel: doc?.currentUpload?.versionLabel ?? null,
        uploadedAt,
        uploaderRole: doc?.currentUpload?.userInfo?.role ?? null,
        uploadId: doc?.currentUpload?.uploadId ?? null,
        latestDecision,
        wasReuploaded: isStale,
      };
    });
  });

  readonly allPassed = computed(() => this.rows().length > 0 && this.rows().every((r) => r.processingStatus === 'PASSED'));

  readonly approvedRowCount = computed(() => this.rows().filter((r) => r.latestDecision?.status === 'APPROVED').length);

  /** Approve Section is blocked only by a currently-returned document — undecided documents get auto-approved. */
  readonly canApproveSection = computed(
    () => this.rows().length > 0 && this.rows().every((r) => r.latestDecision?.status !== 'RETURNED'),
  );

  readonly canReview = computed(() => this.currentSection()?.permissions.canReview ?? false);
  readonly canApprove = computed(() => this.currentSection()?.permissions.canApprove ?? false);

  readonly canReviewPfms = computed(() => this.bankAccountData()?.permissions.canReview ?? false);
  readonly canApprovePfms = computed(() => this.bankAccountData()?.permissions.canApprove ?? false);

  readonly returnNoteMinLength = RETURN_NOTE_MIN_LENGTH;
  readonly returnNoteMaxLength = RETURN_NOTE_MAX_LENGTH;

  constructor() {
    this.loadStatus();
  }

  onTabClick(tab: { key: TabKey | null }): void {
    if (tab.key) void this.switchTab(tab.key);
  }

  async switchTab(tab: TabKey): Promise<void> {
    this.activeSection.set(tab);
    if (tab === 'PFMS') {
      if (!this.bankAccountLoaded()) await this.loadBankAccount();
      return;
    }
    if (!this.configBySection()[tab]) {
      await this.loadConfigForSection(tab);
    }
  }

  async previewFile(row: ReviewDocRow): Promise<void> {
    const id = this.statusData()?.annualAccountId;
    if (!row.uploadId || !id) return;
    try {
      const result = await firstValueFrom(this.http.get<unknown>(`${API_ANNUAL}${id}/documents/${row.uploadId}/signed-url`));
      window.open(unwrap<{ url: string }>(result).url, '_blank', 'noopener');
    } catch {
      this.utilityService.triggerSnackbar('Failed to open document preview.', 'snackbar-danger');
    }
  }

  async approveDocument(docId: string): Promise<void> {
    const confirmed = await firstValueFrom(
      this.confirmDialogService.confirm(
        {
          title: 'Approve this document?',
          message: 'The document will be locked and cannot be re-uploaded by the ULB once approved.',
          confirmText: 'Yes, approve',
          confirmButtonColor: 'primary',
          icon: 'bi-check-circle-fill',
        },
        this.themeClass ? { panelClass: this.themeClass } : undefined,
      ),
    );
    if (!confirmed) return;
    await this.submitDocumentDecision(docId, 'APPROVED', undefined);
  }

  /** docId of the row whose inline return-reason panel is currently open, if any. */
  readonly returningDocId = signal<string | null>(null);
  readonly returnNoteDraft = signal('');

  startReturn(docId: string): void {
    this.returningDocId.set(docId);
    this.returnNoteDraft.set('');
  }

  cancelReturn(): void {
    this.returningDocId.set(null);
    this.returnNoteDraft.set('');
  }

  isReturnNoteValid(note: string): boolean {
    const length = note.trim().length;
    return length >= RETURN_NOTE_MIN_LENGTH && length <= RETURN_NOTE_MAX_LENGTH;
  }

  async confirmReturn(docId: string): Promise<void> {
    const note = this.returnNoteDraft().trim();
    if (!this.isReturnNoteValid(note)) return;
    await this.submitDocumentDecision(docId, 'RETURNED', note);
    this.returningDocId.set(null);
    this.returnNoteDraft.set('');
  }

  async decideSection(decision: Decision): Promise<void> {
    const id = this.statusData()?.annualAccountId;
    if (!id) return;
    let note: string | undefined;

    const dialogConfig = this.themeClass ? { panelClass: this.themeClass } : undefined;
    const total = this.rows().length;
    const approvedCount = this.approvedRowCount();
    const remainingCount = total - approvedCount;

    if (decision === 'RETURNED') {
      const message =
        approvedCount > 0
          ? `${approvedCount} of ${total} documents are already approved and will remain approved and locked. Explain what needs to be corrected in the rest — the ULB will see this note.`
          : 'Explain what needs to be corrected — the ULB will see this note.';

      note = await firstValueFrom(
        this.noteDialogService.prompt(
          {
            title: 'Return this section to the ULB?',
            message,
            placeholder: 'e.g. Balance Sheet figures do not match the Income and Expenditure Statement.',
            confirmText: 'Return section',
            required: true,
          },
          dialogConfig,
        ),
      );
      if (note === undefined) return;
    } else {
      const message =
        approvedCount === 0
          ? `This will approve all ${total} documents in this section and hand it off to MoHUA for their review. This cannot be undone.`
          : remainingCount > 0
            ? `You've already approved ${approvedCount} of ${total} documents individually. Approving the section will automatically approve the remaining ${remainingCount} as well and hand it off to MoHUA for their review. This cannot be undone.`
            : 'This hands the section off to MoHUA for their review. This cannot be undone.';

      const confirmed = await firstValueFrom(
        this.confirmDialogService.confirm(
          {
            title: 'Approve this section?',
            message,
            confirmText: 'Yes, approve',
            confirmButtonColor: 'primary',
            icon: 'bi-check-circle-fill',
          },
          dialogConfig,
        ),
      );
      if (!confirmed) return;
    }

    this.isDeciding.set(true);
    try {
      await firstValueFrom(
        this.http.post<unknown>(`${API_ANNUAL}${id}/decision`, {
          section: this.activeSection(),
          decision,
          note,
        }),
      );
      this.utilityService.triggerSnackbar(decision === 'APPROVED' ? 'Section approved.' : 'Section returned.');
      await this.loadStatus();
    } catch {
      this.utilityService.triggerSnackbar('Something went wrong. Please try again.', 'snackbar-danger');
    } finally {
      this.isDeciding.set(false);
    }
  }

  async approvePfms(): Promise<void> {
    const confirmed = await firstValueFrom(
      this.confirmDialogService.confirm(
        {
          title: 'Approve this bank account form?',
          message: 'This hands the form off to MoHUA for their review. This cannot be undone.',
          confirmText: 'Yes, approve',
          confirmButtonColor: 'primary',
          icon: 'bi-check-circle-fill',
        },
        this.themeClass ? { panelClass: this.themeClass } : undefined,
      ),
    );
    if (!confirmed) return;
    await this.submitPfmsDecision('APPROVED', undefined);
  }

  /** Inline return-reason panel state for the PFMS tab — same slide-open pattern as per-document returns. */
  readonly pfmsReturning = signal(false);
  readonly pfmsReturnNoteDraft = signal('');

  startPfmsReturn(): void {
    this.pfmsReturning.set(true);
    this.pfmsReturnNoteDraft.set('');
  }

  cancelPfmsReturn(): void {
    this.pfmsReturning.set(false);
    this.pfmsReturnNoteDraft.set('');
  }

  async confirmPfmsReturn(): Promise<void> {
    const note = this.pfmsReturnNoteDraft().trim();
    if (!this.isReturnNoteValid(note)) return;
    await this.submitPfmsDecision('RETURNED', note);
    this.pfmsReturning.set(false);
    this.pfmsReturnNoteDraft.set('');
  }

  private async submitPfmsDecision(decision: Decision, note: string | undefined): Promise<void> {
    const id = this.bankAccountData()?.id;
    if (!id) return;

    this.isDeciding.set(true);
    try {
      await firstValueFrom(this.http.post<unknown>(`${API_BANK}${id}/decision`, { decision, note }));
      this.utilityService.triggerSnackbar(decision === 'APPROVED' ? 'Bank account form approved.' : 'Bank account form returned.');
      await this.loadBankAccount();
    } catch {
      this.utilityService.triggerSnackbar('Something went wrong. Please try again.', 'snackbar-danger');
    } finally {
      this.isDeciding.set(false);
    }
  }

  goBack(): void {
    this.router.navigate(['../..'], { relativeTo: this.route });
  }

  private async submitDocumentDecision(docId: string, decision: Decision, note: string | undefined): Promise<void> {
    const id = this.statusData()?.annualAccountId;
    if (!id) return;
    this.isDeciding.set(true);
    try {
      // decideDocument's response is the same full StatusResponse shape as loadStatus()'s GET —
      // consume it directly instead of immediately re-fetching the same data over a second round trip.
      const result = await firstValueFrom(
        this.http.post<unknown>(`${API_ANNUAL}${id}/documents/${docId}/decision`, {
          section: this.activeSection(),
          decision,
          note,
        }),
      );
      this.statusData.set(unwrap<StatusResponse>(result));
    } catch {
      this.utilityService.triggerSnackbar('Something went wrong. Please try again.', 'snackbar-danger');
    } finally {
      this.isDeciding.set(false);
    }
  }

  private async loadStatus(): Promise<void> {
    this.isLoading.set(true);
    this.loadError.set(false);

    try {
      const designYearId = this.resolveDesignYearId();
      if (!designYearId) throw new Error('Missing designYearId');

      const result = await firstValueFrom(
        this.http.get<unknown>(`${API_ANNUAL}by-ulb/${this.ulbId}/${designYearId}`),
      );
      const data = unwrap<StatusResponse | null>(result);
      this.statusData.set(
        data ?? {
          annualAccountId: null,
          ulbName: this.ulbNameFallback,
          ulbCode: null,
          auditedData: NOT_STARTED_SECTION,
          unauditedData: NOT_STARTED_SECTION,
        },
      );

      const key = this.activeSection();
      if (key === 'PFMS') await this.loadBankAccount();
      else await this.loadConfigForSection(key);
    } catch {
      this.loadError.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadBankAccount(): Promise<void> {
    const designYearId = this.resolveDesignYearId();
    if (!designYearId) return;

    try {
      const result = await firstValueFrom(
        this.http.get<unknown>(`${API_BANK}?ulbId=${this.ulbId}&yearId=${designYearId}`),
      );
      const raw = unwrap<BankAccountApiResponse | null>(result);
      this.bankAccountData.set(raw ? { ...raw, id: raw._id } : null);
    } catch {
      this.utilityService.triggerSnackbar('Failed to load PFMS bank account details.', 'snackbar-danger');
    } finally {
      this.bankAccountLoaded.set(true);
    }
  }

  private async loadConfigForSection(section: SectionKey): Promise<void> {
    const sectionData = this.statusData()?.[section];
    const designYearId = this.resolveDesignYearId();
    if (!sectionData || !designYearId) return;

    const type = section === 'auditedData' ? 'audited' : 'provisional';
    try {
      const config = await firstValueFrom(this.uploadDocumentsService.getUploadConfig(type, designYearId));
      this.configBySection.update((byId) => ({ ...byId, [section]: config }));
    } catch {
      this.utilityService.triggerSnackbar('Failed to load document list for this section.', 'snackbar-danger');
    }
  }

  /** The design year the reviewer is currently in — the same value the ULB's own upload-config lookup uses. */
  private resolveDesignYearId(): string | null {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(XVIFC_LS_KEYS.selectedYearId) : null;
    if (stored) return stored;
    let current: ActivatedRoute | null = this.route;
    while (current) {
      const yearId = current.snapshot.paramMap.get('yearId');
      if (yearId) return yearId;
      current = current.parent;
    }
    return null;
  }

  private resolveInitialSection(): TabKey {
    const requested = this.route.snapshot.queryParamMap.get('section');
    if (requested === 'unauditedData' || requested === 'PFMS') return requested;
    return 'auditedData';
  }
}
