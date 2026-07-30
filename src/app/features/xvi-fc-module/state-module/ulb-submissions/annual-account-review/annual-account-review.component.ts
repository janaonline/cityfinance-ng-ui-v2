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
import { DocumentActionRowComponent } from '../../../../../shared/components/document-action-row/document-action-row.component';
import type {
  ActionGate,
  DocumentRuntimeState,
  ResolvedDocumentAction,
} from '../../../../../shared/components/document-action-row/document-action-row.types';

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
    file: { originalName: string; sizeKb: number; fileUrl: string | null };
    userInfo: { userId: string; role: string } | null;
    uploadedAt: string;
  } | null;
  stateDecision: DecisionEntry | null;
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
  /** false → optional document; no approve/return controls, and it never blocks section approval. */
  required: boolean;
  processingStatus: StatusDoc['processingStatus'];
  fileName: string | null;
  sizeKb: number | null;
  fileUrl: string | null;
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
  proofFile: { originalName: string; mimeType: string; sizeKb: number; s3Key: string; fileUrl: string | null };
  currentFormStatus: number;
  currentFormStatusLabel: string;
  stateDecision: DecisionEntry | null;
  mohuaDecision: DecisionEntry | null;
  submittedAt: string | null;
  permissions: { canReview: boolean; canApprove: boolean };
}

/** Raw shape returned by GET /xvi-fc/bank-account — the record id comes back as `_id`, not `id`. */
type BankAccountApiResponse = Omit<BankAccountData, 'id'> & { _id: string };

interface PfmsLogEntry {
  action: 'SUBMITTED' | 'APPROVED' | 'RETURNED';
  toStatus: number;
  toStatusLabel: string;
  actorStage: 'ULB' | 'STATE' | 'MOHUA';
  actorRole: string;
  note: string | null;
  createdAt: string;
}

interface PfmsLogDisplayEntry extends PfmsLogEntry {
  title: string;
}

interface AnnualLogEntry {
  section: SectionKey;
  action: 'SUBMITTED' | 'APPROVED' | 'RETURNED';
  actorStage: 'ULB' | 'STATE' | 'MOHUA';
  actorRole: string;
  note: string | null;
  createdAt: string;
}

interface AnnualLogDisplayEntry extends AnnualLogEntry {
  title: string;
}

interface SectionLogsState {
  logs: AnnualLogEntry[];
  loaded: boolean;
  loading: boolean;
  expanded: boolean;
}

const EMPTY_SECTION_LOGS_STATE: SectionLogsState = { logs: [], loaded: false, loading: false, expanded: false };

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

/** Placeholder rows shown in the history panel while its API call is in flight. */
const HISTORY_SKELETON_ROWS = [0, 1, 2];

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
  imports: [DatePipe, MatButtonModule, MatTooltipModule, DocumentActionRowComponent],
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

  readonly pfmsLogs = signal<PfmsLogEntry[]>([]);
  readonly pfmsLogsLoaded = signal(false);
  readonly pfmsLogsLoading = signal(false);
  readonly pfmsLogsExpanded = signal(false);

  // pfmsLogs is newest-first, so the earliest SUBMITTED entry (the original submission) is the
  // last one at that action in the array — every other SUBMITTED entry is a resubmission.
  readonly pfmsLogsDisplay = computed<PfmsLogDisplayEntry[]>(() => {
    const logs = this.pfmsLogs();
    const firstSubmissionIndex = logs.map((log) => log.action).lastIndexOf('SUBMITTED');
    return logs.map((log, index) => ({
      ...log,
      title:
        log.action === 'SUBMITTED'
          ? index === firstSubmissionIndex
            ? 'ULB SUBMITTED'
            : 'ULB RESUBMITTED'
          : `${log.actorStage} ${log.action}`,
    }));
  });

  readonly annualLogsBySection = signal<Partial<Record<SectionKey, SectionLogsState>>>({});

  readonly currentAnnualLogsState = computed<SectionLogsState>(() => {
    const key = this.activeSection();
    if (key === 'PFMS') return EMPTY_SECTION_LOGS_STATE;
    return this.annualLogsBySection()[key] ?? EMPTY_SECTION_LOGS_STATE;
  });

  // Same "earliest SUBMITTED = original, rest = resubmission" rule as the PFMS history.
  readonly annualLogsDisplay = computed<AnnualLogDisplayEntry[]>(() => {
    const logs = this.currentAnnualLogsState().logs;
    const firstSubmissionIndex = logs.map((log) => log.action).lastIndexOf('SUBMITTED');
    return logs.map((log, index) => ({
      ...log,
      title:
        log.action === 'SUBMITTED'
          ? index === firstSubmissionIndex
            ? 'ULB SUBMITTED'
            : 'ULB RESUBMITTED'
          : `${log.actorStage} ${log.action}`,
    }));
  });

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
      const rawLatestDecision = doc?.stateDecision ?? null;
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
        required: def.required !== false,
        processingStatus: doc?.processingStatus ?? 'NOT_STARTED',
        fileName: doc?.currentUpload?.file.originalName ?? null,
        sizeKb: doc?.currentUpload?.file.sizeKb ?? null,
        fileUrl: doc?.currentUpload?.file.fileUrl ?? null,
        versionLabel: doc?.currentUpload?.versionLabel ?? null,
        uploadedAt,
        uploaderRole: doc?.currentUpload?.userInfo?.role ?? null,
        uploadId: doc?.currentUpload?.uploadId ?? null,
        latestDecision,
        wasReuploaded: isStale,
      };
    });
  });

  /** Optional documents never gate this cosmetic indicator — mirrors the ULB upload page's gating. */
  readonly allPassed = computed(() => {
    const requiredRows = this.rows().filter((r) => r.required !== false);
    return requiredRows.length > 0 && requiredRows.every((r) => r.processingStatus === 'PASSED');
  });

  readonly approvedRowCount = computed(() => this.rows().filter((r) => r.latestDecision?.status === 'APPROVED').length);

  /** Approve Section is blocked only by a currently-returned document — undecided documents get auto-approved. */
  readonly canApproveSection = computed(
    () => this.rows().length > 0 && this.rows().every((r) => r.latestDecision?.status !== 'RETURNED'),
  );

  /** True once every document has its own individual decision — nothing left for Return Section to auto-sweep. */
  readonly allRowsDecided = computed(
    () => this.rows().length > 0 && this.rows().every((r) => r.latestDecision !== null),
  );

  readonly canReview = computed(() => this.currentSection()?.permissions.canReview ?? false);
  readonly canApprove = computed(() => this.currentSection()?.permissions.canApprove ?? false);

  // Inputs for the shared document-action-row component — the gate is a UI-visibility hint
  // only; canReview() (real backend permission) is what actually gates the click.
  readonly sectionStatusId = computed(() => this.currentSection()?.form_status_id ?? 0);
  readonly actionGates = computed<readonly ActionGate[]>(() => {
    const key = this.activeSection();
    if (key === 'PFMS') return [];
    return this.configBySection()[key]?.actionGates ?? [];
  });

  readonly canReviewPfms = computed(() => this.bankAccountData()?.permissions.canReview ?? false);
  readonly canApprovePfms = computed(() => this.bankAccountData()?.permissions.canApprove ?? false);

  // A stateDecision only counts against the file it was made on — same staleness rule as the
  // per-document decisions above. The bank account record's stateDecision isn't cleared when
  // the ULB re-submits, so without this the old "Returned" note would show forever.
  readonly pfmsEffectiveStateDecision = computed(() => {
    const data = this.bankAccountData();
    const decision = data?.stateDecision;
    if (!decision) return null;
    if (!data?.submittedAt) return decision;
    const isStale = new Date(data.submittedAt).getTime() > new Date(decision.decidedAt).getTime();
    return isStale ? null : decision;
  });

  readonly pfmsWasReuploaded = computed(
    () => !!this.bankAccountData()?.stateDecision && this.pfmsEffectiveStateDecision() === null,
  );

  readonly returnNoteMinLength = RETURN_NOTE_MIN_LENGTH;
  readonly returnNoteMaxLength = RETURN_NOTE_MAX_LENGTH;
  readonly historySkeletonRows = HISTORY_SKELETON_ROWS;

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

  /** Runtime facts the shared action-row component needs to resolve which button(s) to show. */
  toRuntimeState(row: ReviewDocRow): DocumentRuntimeState {
    return {
      docKey: row.docId,
      required: row.required,
      hasFile: row.fileName !== null,
      processingStatus: row.processingStatus,
      latestDecision: row.latestDecision ? { status: row.latestDecision.status } : null,
    };
  }

  /** Routes the shared action-row component's click event to the existing handlers — Return
   *  only opens the inline reason panel here (submitDocumentDecision fires from confirmReturn). */
  onDocAction(event: { action: ResolvedDocumentAction['action']; docKey: string }): void {
    switch (event.action) {
      case 'approve':
        void this.approveDocument(event.docKey);
        return;
      case 'return':
        this.startReturn(event.docKey);
        return;
      case 'undo':
        void this.undoDocument(event.docKey);
        return;
      default:
        return; // upload/reupload/retry/delete/*Section aren't emitted on this page's document rows
    }
  }

  previewFile(row: ReviewDocRow): void {
    if (!row.fileUrl) {
      this.utilityService.triggerSnackbar('Failed to open document preview.', 'snackbar-danger');
      return;
    }
    window.open(row.fileUrl, '_blank', 'noopener');
  }

  formatFileSize(sizeKb: number): string {
    return `${sizeKb.toFixed(2)} KB`;
  }

  viewPfmsProof(): void {
    const fileUrl = this.bankAccountData()?.proofFile.fileUrl;
    if (!fileUrl) {
      this.utilityService.triggerSnackbar('Unable to open proof document. Please try again.', 'snackbar-danger');
      return;
    }
    window.open(fileUrl, '_blank', 'noopener');
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
      if (this.allRowsDecided()) {
        // Every document already carries its own individual decision (and its own reason, for
        // any returned ones) — there's nothing left to auto-sweep, so a second general note
        // would just be redundant. Just confirm the section-level transition.
        const confirmed = await firstValueFrom(
          this.confirmDialogService.confirm(
            {
              title: 'Return this section to the ULB?',
              message:
                'Every document in this section has already been reviewed individually. This will return the section to the ULB for re-upload.',
              confirmText: 'Yes, return',
              confirmButtonColor: 'warn',
              icon: 'bi-arrow-counterclockwise',
            },
            dialogConfig,
          ),
        );
        if (!confirmed) return;
        note = 'Every document in this section was already reviewed individually before the section was returned.';
      } else {
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
      }
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

  async togglePfmsHistory(): Promise<void> {
    this.pfmsLogsExpanded.update((v) => !v);
    if (this.pfmsLogsExpanded() && !this.pfmsLogsLoaded()) {
      await this.loadPfmsLogs();
    }
  }

  private async loadPfmsLogs(): Promise<void> {
    const id = this.bankAccountData()?.id;
    if (!id) return;

    this.pfmsLogsLoading.set(true);
    try {
      const result = await firstValueFrom(this.http.get<unknown>(`${API_BANK}${id}/logs`));
      this.pfmsLogs.set(unwrap<PfmsLogEntry[]>(result));
      this.pfmsLogsLoaded.set(true);
    } catch {
      this.utilityService.triggerSnackbar('Failed to load PFMS decision history.', 'snackbar-danger');
    } finally {
      this.pfmsLogsLoading.set(false);
    }
  }

  async toggleAnnualHistory(): Promise<void> {
    const key = this.activeSection();
    if (key === 'PFMS') return;

    const current = this.annualLogsBySection()[key] ?? EMPTY_SECTION_LOGS_STATE;
    const expanded = !current.expanded;
    this.annualLogsBySection.update((byId) => ({ ...byId, [key]: { ...current, expanded } }));

    if (expanded && !current.loaded) {
      await this.loadAnnualLogs(key);
    }
  }

  private async loadAnnualLogs(section: SectionKey): Promise<void> {
    const id = this.statusData()?.annualAccountId;
    if (!id) return;

    this.annualLogsBySection.update((byId) => ({
      ...byId,
      [section]: { ...(byId[section] ?? EMPTY_SECTION_LOGS_STATE), loading: true },
    }));

    try {
      const result = await firstValueFrom(this.http.get<unknown>(`${API_ANNUAL}${id}/logs?section=${section}`));
      const logs = unwrap<AnnualLogEntry[]>(result);
      this.annualLogsBySection.update((byId) => ({
        ...byId,
        [section]: { logs, loaded: true, loading: false, expanded: true },
      }));
    } catch {
      this.utilityService.triggerSnackbar('Failed to load decision history.', 'snackbar-danger');
      this.annualLogsBySection.update((byId) => ({
        ...byId,
        [section]: { ...(byId[section] ?? EMPTY_SECTION_LOGS_STATE), loading: false },
      }));
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

  /** Reverts a document's own APPROVED/RETURNED decision back to undecided — only possible
   *  while the section itself hasn't been finalized (canReview() mirrors the backend gate). */
  async undoDocument(docId: string): Promise<void> {
    const id = this.statusData()?.annualAccountId;
    if (!id) return;
    this.isDeciding.set(true);
    try {
      const result = await firstValueFrom(
        this.http.delete<unknown>(`${API_ANNUAL}${id}/documents/${docId}/decision?section=${this.activeSection()}`),
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
