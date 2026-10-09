import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { XVIFC_LS_KEYS } from '../../shared/years-selection/years-selection.component';
import { SlbReviewComponent } from '../../state-module/ulb-submissions/slb-review/slb-review.component';
import { ReviewFormId, SYSTEM_CHECKS_CONTENT } from '../../state-module/ulb-submissions/ulb-submissions.models';
import { findRouteParam } from '../route-params.util';
import { MohuaStateDetailService } from '../state-detail/mohua-state-detail.service';
import { RevealDirective } from '../state-detail/state-detail.directives';
import { MohuaUlbFormsService } from './mohua-ulb-forms.service';
import { DecisionEntry, ProcessingStatus, UlbFormsData } from './ulb-detail.models';

type Tone = 'good' | 'orange' | 'grey' | 'bad';

interface FormTab {
  key: ReviewFormId;
  label: string;
  icon: string;
  /** Whether the ULB has submitted the form to the State (same rule as the State detail counts). */
  done: boolean;
  statusText: string;
}

interface DocRow {
  key: string;
  title: string;
  subtitle: string | null;
  uploadedAt: Date | null;
  sizeKb: number | null;
  fileUrl: string | null;
  status: ProcessingStatus;
  failedChecks: string[];
}

interface Approval {
  text: string;
  tone: Tone;
}

const NOT_STARTED_TEXT = 'Not started';
const LOAD_ERROR = 'Could not load this ULB. Please try again.';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Approved wins over returned; MoHUA's decision wins over the State's. */
function approvalOf(mohua: DecisionEntry | null | undefined, state: DecisionEntry | null | undefined): Approval | null {
  const describe = (decision: DecisionEntry, by: string): Approval => ({
    text: `${decision.status === 'APPROVED' ? 'Approved' : 'Returned'} by ${by} on ${formatDate(decision.decidedAt)}${
      decision.status === 'RETURNED' && decision.note ? ` — ${decision.note}` : ''
    }`,
    tone: decision.status === 'APPROVED' ? 'good' : 'orange',
  });
  if (mohua) return describe(mohua, mohua.decidedBy?.name ?? 'MoHUA');
  if (state) return describe(state, state.decidedBy?.name ?? 'State');
  return null;
}

@Component({
  selector: 'app-mohua-ulb-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatExpansionModule,
    RouterLink,
    RevealDirective,
    SlbReviewComponent,
  ],
  templateUrl: './ulb-detail.component.html',
  styleUrl: './ulb-detail.component.scss',
})
export class UlbDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly formsService = inject(MohuaUlbFormsService);
  private readonly stateDetailService = inject(MohuaStateDetailService);
  private readonly destroyRef = inject(DestroyRef);

  /** Parent (MoHUA module) route — links are built from it, so they never depend on how many URL segments this route has. */
  readonly mohuaRoute = this.route.parent;

  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });

  readonly stateId = computed(() => this.params().get('stateId') ?? '');
  /** The ULB's database id — what every per-ULB form GET takes. */
  readonly ulbId = computed(() => this.params().get('ulbId') ?? '');

  /** Loaded from the State detail API; the breadcrumb falls back to a generic label until it arrives. */
  readonly stateName = signal('');
  readonly forms = signal<UlbFormsData | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly ulbName = computed(() => this.forms()?.audited.data?.ulbName ?? this.forms()?.slb.data?.ulbName ?? '');
  readonly ulbCode = computed(() => this.forms()?.audited.data?.ulbCode ?? null);

  readonly tabs = computed<FormTab[]>(() => {
    const forms = this.forms();
    if (!forms) return [];
    // Status text and "submitted" come from the API, which owns that rule; if that one call failed the tabs still show.
    const statuses = forms.statuses.data?.forms;
    const tab = (
      key: ReviewFormId,
      label: string,
      icon: string,
      status: 'audited' | 'unaudited' | 'pfms' | 'slb' | 'dur',
    ): FormTab => ({
      key,
      label,
      icon,
      done: statuses?.[status].submitted ?? false,
      statusText: statuses?.[status].statusLabel ?? NOT_STARTED_TEXT,
    });
    return [
      tab('AUDITED_STATEMENTS', 'Audited Statements', 'bi-file-earmark-text', 'audited'),
      tab('PROVISIONAL_STATEMENTS', 'Provisional Statements', 'bi-clipboard-check', 'unaudited'),
      tab('PFMS_BANK_ACCOUNT', 'PFMS Bank Account', 'bi-bank', 'pfms'),
      tab('SERVICE_LEVEL_BENCHMARKS', 'Service Level Benchmarks', 'bi-speedometer2', 'slb'),
      tab('DUR', 'DUR', 'bi-file-earmark-bar-graph', 'dur'),
    ];
  });

  readonly selectedKey = signal<ReviewFormId>('AUDITED_STATEMENTS');
  readonly checksOpen = signal(false);

  readonly selectedTab = computed(() => this.tabs().find((t) => t.key === this.selectedKey()) ?? this.tabs()[0]);

  /** True when the selected form's own call failed (as opposed to the ULB simply having no record). */
  readonly selectedFailed = computed(() => {
    const forms = this.forms();
    if (!forms) return false;
    switch (this.selectedKey()) {
      case 'AUDITED_STATEMENTS':
        return forms.audited.failed || forms.auditedConfig.failed;
      case 'PROVISIONAL_STATEMENTS':
        return forms.unaudited.failed || forms.provisionalConfig.failed;
      case 'PFMS_BANK_ACCOUNT':
        return forms.bank.failed;
      case 'SERVICE_LEVEL_BENCHMARKS':
        return forms.slb.failed;
      case 'DUR':
        return forms.dur.failed;
    }
  });

  /** Whether the selected form has a record at all (a ULB that never started it has none). */
  readonly hasRecord = computed(() => {
    const forms = this.forms();
    if (!forms) return false;
    switch (this.selectedKey()) {
      case 'AUDITED_STATEMENTS':
        return !!forms.audited.data?.data;
      case 'PROVISIONAL_STATEMENTS':
        return !!forms.unaudited.data?.data;
      case 'PFMS_BANK_ACCOUNT':
        return !!forms.bank.data;
      case 'SERVICE_LEVEL_BENCHMARKS':
        return !!forms.slb.data && forms.slb.data.currentFormStatus > 1;
      case 'DUR':
        return !!forms.dur.data;
    }
  });

  /** The FY the selected form's documents belong to, for the "what the system checked" caption. */
  private readonly yearLabel = computed(() => {
    const forms = this.forms();
    if (!forms) return '';
    switch (this.selectedKey()) {
      case 'AUDITED_STATEMENTS':
        return forms.auditedConfig.data?.documentYear ? `FY ${forms.auditedConfig.data.documentYear}` : '';
      case 'PROVISIONAL_STATEMENTS':
        return forms.provisionalConfig.data?.documentYear ? `FY ${forms.provisionalConfig.data.documentYear}` : '';
      case 'PFMS_BANK_ACCOUNT':
        return forms.bank.data?.designYearLabel ? `FY ${forms.bank.data.designYearLabel}` : '';
      default:
        return forms.slb.data?.actualYearLabel ? `FY ${forms.slb.data.actualYearLabel}` : '';
    }
  });

  readonly checks = computed(() => {
    const content = SYSTEM_CHECKS_CONTENT[this.selectedKey()];
    return {
      caption: content.caption(this.yearLabel()),
      checked: content.checkedAutomatically,
      notChecked: content.notChecked,
    };
  });

  /** Document rows for the selected form (audited, provisional and DUR). */
  readonly documents = computed<DocRow[]>(() => {
    const forms = this.forms();
    if (!forms) return [];

    const row = (
      key: string,
      title: string,
      subtitle: string | null,
      status: ProcessingStatus,
      upload: {
        file: { originalName: string; sizeKb: number; fileUrl?: string | null };
        uploadedAt: string;
        ocrInfo?: { failedChecks?: string[] } | null;
      } | null,
    ): DocRow => ({
      key,
      title,
      subtitle,
      status,
      uploadedAt: upload?.uploadedAt ? new Date(upload.uploadedAt) : null,
      sizeKb: upload?.file.sizeKb ?? null,
      fileUrl: upload?.file.fileUrl ?? null,
      failedChecks: upload?.ocrInfo?.failedChecks ?? [],
    });

    switch (this.selectedKey()) {
      case 'AUDITED_STATEMENTS':
      case 'PROVISIONAL_STATEMENTS': {
        const audited = this.selectedKey() === 'AUDITED_STATEMENTS';
        const config = (audited ? forms.auditedConfig : forms.provisionalConfig).data;
        const section = (audited ? forms.audited : forms.unaudited).data?.data;
        return (config?.documents ?? []).map((def) => {
          const doc = section?.documents.find((d) => d.docId === def.id);
          return row(
            def.id,
            def.title,
            def.subtitle || null,
            doc?.processingStatus ?? 'NOT_STARTED',
            doc?.currentUpload ?? null,
          );
        });
      }
      case 'DUR':
        return (forms.dur.data?.documents ?? []).map((doc) =>
          row(doc.docId, doc.label, null, doc.processingStatus, doc.currentUpload),
        );
      default:
        return [];
    }
  });

  /** The "Approved by … on …" line under the selected form. SLB has no approval step; its own view shows its status. */
  readonly approval = computed<Approval | null>(() => {
    const forms = this.forms();
    if (!forms) return null;
    switch (this.selectedKey()) {
      case 'AUDITED_STATEMENTS':
        return approvalOf(forms.audited.data?.data?.mohuaDecision, forms.audited.data?.data?.stateDecision);
      case 'PROVISIONAL_STATEMENTS':
        return approvalOf(forms.unaudited.data?.data?.mohuaDecision, forms.unaudited.data?.data?.stateDecision);
      case 'PFMS_BANK_ACCOUNT':
        return approvalOf(forms.bank.data?.mohuaDecision, forms.bank.data?.stateDecision);
      case 'DUR':
        return approvalOf(forms.dur.data?.mohuaDecision, forms.dur.data?.stateDecision);
      default:
        return null;
    }
  });

  readonly paneTitle = computed(() =>
    this.selectedKey() === 'PFMS_BANK_ACCOUNT' ? 'Bank account' : 'Document review',
  );

  readonly paneSubtitle = computed(() => {
    if (this.selectedKey() === 'PFMS_BANK_ACCOUNT') return 'Account number is masked · read-only';
    const count = this.documents().length;
    return `${this.yearLabel()} · ${count} ${count === 1 ? 'document' : 'documents'} · read-only`.replace(/^ · /, '');
  });

  readonly bank = computed(() => this.forms()?.bank.data ?? null);
  readonly slb = computed(() => this.forms()?.slb.data ?? null);

  constructor() {
    this.load();
    this.loadStateName();
  }

  load(): void {
    const yearId = this.yearId();
    if (!this.ulbId() || !yearId) {
      this.loading.set(false);
      this.error.set('Select a financial year to view this ULB.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.formsService
      .load(this.ulbId(), yearId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (forms) => {
          this.forms.set(forms);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(LOAD_ERROR);
          this.loading.set(false);
        },
      });
  }

  tabTone(tab: FormTab): Tone {
    return tab.done ? 'good' : 'orange';
  }

  processingTone(status: ProcessingStatus): Tone {
    return status === 'PASSED' ? 'good' : status === 'FAILED' ? 'bad' : 'grey';
  }

  processingLabel(status: ProcessingStatus): string {
    return status === 'PASSED'
      ? 'Passed'
      : status === 'FAILED'
        ? 'Failed'
        : status === 'PROCESSING'
          ? 'Processing'
          : 'Not uploaded';
  }

  selectTab(key: ReviewFormId): void {
    this.selectedKey.set(key);
    this.checksOpen.set(false);
  }

  /** Opens a file in a new tab through its signed link. */
  viewFile(fileUrl: string | null): void {
    if (fileUrl) window.open(fileUrl, '_blank', 'noopener');
  }

  private yearId(): string {
    return findRouteParam(this.route.snapshot, 'yearId') || this.readStoredYearId();
  }

  private loadStateName(): void {
    const yearId = this.yearId();
    if (!this.stateId() || !yearId) return;

    this.stateDetailService
      .getDetail(this.stateId(), yearId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (detail) => this.stateName.set(detail.state.name), error: () => undefined });
  }

  private readStoredYearId(): string {
    try {
      return localStorage.getItem(XVIFC_LS_KEYS.selectedYearId) ?? '';
    } catch {
      return '';
    }
  }
}
