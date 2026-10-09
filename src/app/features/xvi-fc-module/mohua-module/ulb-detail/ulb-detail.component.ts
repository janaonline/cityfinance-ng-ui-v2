import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { SlbReviewComponent } from '../../state-module/ulb-submissions/slb-review/slb-review.component';
import { ReviewFormId, SYSTEM_CHECKS_CONTENT } from '../../state-module/ulb-submissions/ulb-submissions.models';
import { RevealDirective } from '../state-detail/state-detail.directives';
import { STATE_DETAIL, UlbRow } from '../state-detail/state-detail.placeholder';
import {
  APPROVALS,
  AUDITED_DOCS,
  BANK_DETAILS,
  CLAIM_LETTER_ID,
  DUR_DOCS,
  PROVISIONAL_DOCS,
  SLB_FORM_DATA,
  SAMPLE_PDF_PATH,
  UlbDocument,
} from './ulb-detail.placeholder';

type Tone = 'good' | 'orange';

interface FormTab {
  key: ReviewFormId;
  label: string;
  icon: string;
  /** Financial year the form's documents belong to, used in the "what the system checked" caption. */
  yearLabel: string;
  done: boolean;
}

function titleCase(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

@Component({
  selector: 'app-mohua-ulb-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatCardModule, MatChipsModule, MatExpansionModule, RouterLink, RevealDirective, SlbReviewComponent],
  templateUrl: './ulb-detail.component.html',
  styleUrl: './ulb-detail.component.scss',
})
export class UlbDetailComponent {
  private readonly route = inject(ActivatedRoute);

  /** Parent (MoHUA module) route — links are built from it, so they never depend on how many URL segments this route has. */
  readonly mohuaRoute = this.route.parent;

  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });

  readonly stateId = computed(() => this.params().get('stateId') ?? '');
  readonly stateName = computed(() => titleCase(this.stateId()));

  /** Placeholder lookup — every state shows the same ULB list today. */
  readonly ulb = computed<UlbRow | undefined>(() =>
    STATE_DETAIL.ulbs.find((u) => String(u.census) === this.params().get('ulbId')),
  );

  readonly tabs = computed<FormTab[]>(() => {
    const ulb = this.ulb();
    return [
      { key: 'AUDITED_STATEMENTS', label: 'Audited Statements', icon: 'bi-file-earmark-text', yearLabel: 'FY 2024-25', done: !!ulb?.audited },
      { key: 'PROVISIONAL_STATEMENTS', label: 'Provisional Statements', icon: 'bi-clipboard-check', yearLabel: 'FY 2025-26', done: !!ulb?.provisional },
      { key: 'PFMS_BANK_ACCOUNT', label: 'PFMS Bank Account', icon: 'bi-bank', yearLabel: 'FY 2025-26', done: !!ulb?.pfms },
      { key: 'SERVICE_LEVEL_BENCHMARKS', label: 'Service Level Benchmarks', icon: 'bi-speedometer2', yearLabel: 'FY 2025-26', done: !!ulb?.slb },
      { key: 'DUR', label: 'DUR', icon: 'bi-file-earmark-bar-graph', yearLabel: 'FY 2025-26', done: !!ulb?.dur },
    ];
  });

  readonly selectedKey = signal<ReviewFormId>('AUDITED_STATEMENTS');
  readonly checksOpen = signal(false);

  readonly selectedTab = computed(() => this.tabs().find((t) => t.key === this.selectedKey()) ?? this.tabs()[0]);

  readonly checks = computed(() => {
    const content = SYSTEM_CHECKS_CONTENT[this.selectedKey()];
    return {
      caption: content.caption(this.selectedTab().yearLabel),
      checked: content.checkedAutomatically,
      notChecked: content.notChecked,
    };
  });

  readonly documents = computed<UlbDocument[]>(() => {
    switch (this.selectedKey()) {
      case 'AUDITED_STATEMENTS':
        return AUDITED_DOCS;
      case 'PROVISIONAL_STATEMENTS':
        return PROVISIONAL_DOCS;
      case 'DUR':
        return DUR_DOCS;
      default:
        return [];
    }
  });

  readonly approval = computed<string | null>(() => {
    switch (this.selectedKey()) {
      case 'AUDITED_STATEMENTS':
        return APPROVALS.audited;
      case 'PROVISIONAL_STATEMENTS':
        return APPROVALS.provisional;
      case 'PFMS_BANK_ACCOUNT':
        return APPROVALS.pfms;
      case 'SERVICE_LEVEL_BENCHMARKS':
        return null; // <app-slb-review> renders its own "deemed approved" banner
      case 'DUR':
        return APPROVALS.dur;
    }
  });

  readonly paneSubtitle = computed(() => {
    const tab = this.selectedTab();
    switch (tab.key) {
      case 'PFMS_BANK_ACCOUNT':
        return 'Account number is masked · read-only';
      default:
        return `${tab.yearLabel.replace('-', '–')} · ${this.documents().length} documents · read-only`;
    }
  });

  readonly bank = BANK_DETAILS;
  readonly slbData = SLB_FORM_DATA;
  readonly claimLetterId = CLAIM_LETTER_ID;

  /** Only an eligible ULB is part of a claim letter, per the placeholder data. */
  readonly isIncludedInClaim = computed(() => this.ulb()?.status === 'eligible');

  tabTone(tab: FormTab): Tone {
    return tab.done ? 'good' : 'orange';
  }

  tabStatus(tab: FormTab): string {
    if (!tab.done) return 'Not submitted';
    return tab.key === 'SERVICE_LEVEL_BENCHMARKS' ? 'Deemed approved' : 'Approved';
  }

  selectTab(key: ReviewFormId): void {
    this.selectedKey.set(key);
    this.checksOpen.set(false);
  }

  /** Opens a file in a new tab, same as the State review page's "View PDF". Shows the sample PDF until real
   *  file URLs come from the API — pass the document's own `fileUrl` here then. */
  viewFile(fileUrl: string = SAMPLE_PDF_PATH): void {
    window.open(new URL(fileUrl, document.baseURI).href, '_blank', 'noopener');
  }
}
