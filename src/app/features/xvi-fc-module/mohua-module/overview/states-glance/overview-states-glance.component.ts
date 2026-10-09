import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { RevealDirective } from '../../state-detail/state-detail.directives';
import { formatCrore } from '../overview.placeholder';
import { ClaimLetterStatus, STATE_FORMS, StateRow, StateStatus } from '../overview-states.placeholder';

export type StateFilter = StateStatus;
type View = 'track' | 'list';
type SortKey = 'ulb' | 'alloc';
type Tone = 'orange' | 'teal' | 'grey' | 'red' | 'good';

interface Lane {
  label: string;
  tone: Tone;
}

interface Placed {
  x: number;
  y: number;
  r: number;
}

interface Bubble {
  row: StateRow;
  x: number;
  y: number;
  r: number;
  dx: number;
  delay: number;
  stage: number;
}

const LANES: Lane[] = [
  { label: 'Not started', tone: 'grey' },
  { label: 'In progress', tone: 'teal' },
  { label: 'Under MoHUA review', tone: 'orange' },
];

// Ineligible states have no lane (-1): they are left off the track and still appear in the list view.
const STATUS_STAGE: Record<StateStatus, number> = { ineligible: -1, notStarted: 0, progress: 1, review: 2 };
const STATUS_TONE: Record<StateStatus, Tone> = { review: 'orange', progress: 'teal', notStarted: 'grey', ineligible: 'red' };
const STATUS_LABEL: Record<StateStatus, string> = {
  review: 'Under Review by MoHUA',
  progress: 'In Progress',
  notStarted: 'Not Started',
  ineligible: 'Ineligible',
};

const TRACK_HEIGHT = 372;
const LANE_BOTTOM = 328;
const LANE_TOP = 52;
export const ROW_HEIGHT = 32;
const GROUP_HEIGHT = 34;
const CLAIM_ORDER = ['Approved', 'Waiting for review', 'Returned', 'In progress', 'Not started'];
const LETTER_LABEL: Record<ClaimLetterStatus, string> = { review: 'under review', returned: 'returned', approved: 'approved' };

/** Spiral-packs circles (largest first) inside one lane, so none overlap. */
function packCircles(
  items: { code: string; r: number }[],
  centre: { x: number; y: number },
  bounds: { x0: number; x1: number; y0: number; y1: number },
): Map<string, Placed> {
  const placed: { code: string; x: number; y: number; r: number }[] = [];
  for (const item of [...items].sort((a, b) => b.r - a.r)) {
    let spot: { x: number; y: number } | null = null;
    for (let k = 0; k < 6000 && !spot; k++) {
      const angle = k * 0.5;
      const dist = k * 0.3;
      const x = centre.x + dist * Math.cos(angle);
      const y = centre.y + dist * Math.sin(angle);
      if (x - item.r < bounds.x0 || x + item.r > bounds.x1 || y - item.r < bounds.y0 || y + item.r > bounds.y1) continue;
      const clear = placed.every((p) => (p.x - x) ** 2 + (p.y - y) ** 2 >= (p.r + item.r + 4) ** 2);
      if (clear) spot = { x, y };
    }
    placed.push({ code: item.code, r: item.r, ...(spot ?? centre) });
  }
  return new Map(placed.map((p) => [p.code, { x: p.x, y: p.y, r: p.r }]));
}

/** "States at a glance": stage lanes with bubbles sized by allocation, a ULB-completion ranking, and a report card. */
@Component({
  selector: 'app-ov-states-glance',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RevealDirective,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  templateUrl: './overview-states-glance.component.html',
  styleUrl: './overview-states-glance.component.scss',
})
export class OverviewStatesGlanceComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly rows = input.required<StateRow[]>();
  /** Stage filter, shared with the briefing band's status buttons. */
  readonly filter = model<StateFilter | null>(null);

  readonly view = signal<View>('track');
  readonly selectedCode = signal<string | null>(null);
  readonly sortKey = signal<SortKey>('ulb');
  readonly search = signal('');
  readonly trackWidth = signal(0);

  private readonly viewBox = viewChild<ElementRef<HTMLElement>>('viewBox');

  readonly lanes = LANES;
  readonly forms = STATE_FORMS;
  readonly formatCrore = formatCrore;
  readonly trackHeight = TRACK_HEIGHT;
  readonly views: { key: View; label: string }[] = [
    { key: 'track', label: 'State progress' },
    { key: 'list', label: 'Claims & ULB progress' },
  ];

  private layoutCache = new Map<string, Map<string, Placed>>();

  constructor() {
    // A stage picked from the briefing band is a track-view filter, so bring that view up.
    effect(() => {
      if (this.filter()) this.view.set('track');
    });

    // Track the width of the view area; bubble positions are packed against it.
    effect((onCleanup) => {
      const el = this.viewBox()?.nativeElement;
      if (!el || typeof ResizeObserver === 'undefined') return;
      let frame = 0;
      const observer = new ResizeObserver(() => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => this.trackWidth.set(Math.round(el.clientWidth)));
      });
      observer.observe(el);
      this.trackWidth.set(Math.round(el.clientWidth));
      onCleanup(() => {
        cancelAnimationFrame(frame);
        observer.disconnect();
      });
    });
    this.destroyRef.onDestroy(() => this.layoutCache.clear());
  }

  // ── Selection ──────────────────────────────────────────────────────────────
  readonly selected = computed<StateRow | null>(() => {
    const rows = this.rows();
    return rows.find((r) => r.code === this.selectedCode()) ?? rows.find((r) => r.released) ?? rows[0] ?? null;
  });

  // ── Filter chips ───────────────────────────────────────────────────────────
  readonly chips = computed(() => {
    const rows = this.rows();
    const count = (status: StateStatus) => rows.filter((r) => r.status === status).length;
    return [
      { key: 'review' as StateFilter, label: STATUS_LABEL.review, count: count('review'), tone: 'orange' as Tone, round: false },
      { key: 'progress' as StateFilter, label: STATUS_LABEL.progress, count: count('progress'), tone: 'teal' as Tone, round: false },
      { key: 'notStarted' as StateFilter, label: STATUS_LABEL.notStarted, count: count('notStarted'), tone: 'grey' as Tone, round: false },
    ];
  });

  inFilter(row: StateRow): boolean {
    const filter = this.filter();
    return !filter || row.status === filter;
  }

  matches(row: StateRow): boolean {
    return this.inFilter(row) && row.name.toLowerCase().includes(this.search().trim().toLowerCase());
  }

  // ── Track view ─────────────────────────────────────────────────────────────
  stageOf(row: StateRow): number {
    return STATUS_STAGE[row.status];
  }

  /** Where a state's claim letter stands, derived from the row: received, ready to submit, or nothing yet. */
  claim(row: StateRow): { label: string; tone: Tone } {
    const letters = row.claimLetters;
    if (letters.includes('review')) return { label: 'Waiting for review', tone: 'orange' };
    if (letters.includes('returned')) return { label: 'Returned', tone: 'red' };
    if (letters.length) return { label: 'Approved', tone: 'good' };
    if (row.ulbsDone > 0) return { label: 'In progress', tone: 'teal' };
    return { label: 'Not started', tone: 'grey' };
  }

  /** Letters per status, most urgent first (under review, returned, approved); statuses with none are left out. */
  claimCounts(row: StateRow): { status: ClaimLetterStatus; n: number }[] {
    return (Object.keys(LETTER_LABEL) as ClaimLetterStatus[])
      .map((status) => ({ status, n: row.claimLetters.filter((l) => l === status).length }))
      .filter((p) => p.n);
  }

  /** All three statuses with their counts (zeros included), for the list's claim letters column. */
  claimAll(row: StateRow): { status: ClaimLetterStatus; n: number; label: string }[] {
    return (Object.keys(LETTER_LABEL) as ClaimLetterStatus[]).map((status) => ({
      status,
      n: row.claimLetters.filter((l) => l === status).length,
      label: status === 'review' ? 'review' : LETTER_LABEL[status],
    }));
  }

  /** "2 letters · 1 under review, 1 approved"; empty when the state has none. */
  claimSummary(row: StateRow): string {
    const count = row.claimLetters.length;
    if (!count) return '';
    const parts = this.claimCounts(row).map((p) => `${p.n} ${LETTER_LABEL[p.status]}`);
    return `${count} ${count === 1 ? 'letter' : 'letters'} · ${parts.join(', ')}`;
  }

  toneOf(row: StateRow): Tone {
    return STATUS_TONE[row.status];
  }

  stageLabel(row: StateRow): string {
    return LANES[this.stageOf(row)]?.label ?? STATUS_LABEL[row.status];
  }

  private radius(row: StateRow): number {
    const max = Math.max(...this.rows().map((r) => r.allocation), 1);
    // Never smaller than a bubble that can hold its two-letter code.
    return 10 + 14 * Math.sqrt(row.allocation / max);
  }

  readonly laneCounts = computed(() => {
    const counts = LANES.map(() => 0);
    for (const row of this.rows()) if (this.stageOf(row) >= 0) counts[this.stageOf(row)]++;
    return counts;
  });

  readonly laneStages = LANES.map((_, stage) => stage);

  readonly laneWidth = computed(() => this.trackWidth() / Math.max(this.laneStages.length, 1));

  /** Left-to-right position of a stage's lane among the visible lanes. */
  lanePosition(stage: number): number {
    return this.laneStages.indexOf(stage);
  }

  readonly bubbles = computed<Bubble[]>(() => {
    const width = this.trackWidth();
    if (!width) return [];
    const stages = this.laneStages;
    const laneW = width / Math.max(stages.length, 1);
    const rows = this.rows().filter((r) => this.stageOf(r) >= 0);

    const cacheKey = `${width}-${rows.length}-${stages.join('')}`;
    let layout = this.layoutCache.get(cacheKey);
    if (!layout) {
      layout = new Map<string, Placed>();
      stages.forEach((stage, pos) => {
        const items = rows.filter((r) => this.stageOf(r) === stage).map((r) => ({ code: r.code, r: this.radius(r) }));
        const packed = packCircles(
          items,
          { x: laneW * pos + laneW / 2, y: 190 },
          { x0: laneW * pos + 8, x1: laneW * (pos + 1) - 8, y0: LANE_TOP, y1: LANE_BOTTOM },
        );
        packed.forEach((p, code) => layout!.set(code, p));
      });
      this.layoutCache.set(cacheKey, layout);
    }

    return rows.map((row, i) => {
      const p = layout!.get(row.code)!;
      const stage = this.stageOf(row);
      const pos = this.lanePosition(stage);
      return { row, x: p.x, y: p.y, r: p.r, stage, dx: laneW * pos + laneW / 2 - p.x, delay: pos * 70 + (i % 6) * 18 };
    });
  });

  /** Text of a bubble's tooltip (shown with matTooltip). */
  tooltipText(row: StateRow): string {
    return `${row.name} · ${this.stageLabel(row)} · ${formatCrore(row.allocation)}`;
  }

  // ── Ranked list ────────────────────────────────────────────────────────────
  readonly ranking = computed(() => {
    const key = this.sortKey();
    const progress = (r: StateRow) => (r.ulbsTotal ? r.ulbsDone / r.ulbsTotal : 0);
    const sorted = [...this.rows()].sort((a, b) =>
      key === 'ulb' ? progress(b) - progress(a) || b.allocation - a.allocation : b.allocation - a.allocation,
    );
    return new Map(sorted.map((r, i) => [r.code, i]));
  });

  /** List view: rows grouped under a band per claim-letter category, ranked within each group. */
  readonly listLayout = computed(() => {
    const ranking = this.ranking();
    const rows = this.rows();
    const tops = new Map<string, number>();
    const numbers = new Map<string, number>();
    const heads: { label: string; count: number; top: number }[] = [];
    let y = 0;
    for (const label of CLAIM_ORDER) {
      const group = rows.filter((r) => this.claim(r).label === label).sort((a, b) => (ranking.get(a.code) ?? 0) - (ranking.get(b.code) ?? 0));
      if (!group.length) continue;
      heads.push({ label, count: group.length, top: y });
      y += GROUP_HEIGHT;
      for (const row of group) {
        tops.set(row.code, y);
        numbers.set(row.code, numbers.size + 1);
        y += ROW_HEIGHT;
      }
    }
    return { tops, numbers, heads, height: y };
  });

  progressPercent(row: StateRow): number {
    return row.ulbsTotal ? Math.round((row.ulbsDone / row.ulbsTotal) * 100) : 0;
  }

  sortLabel(key: SortKey, label: string): string {
    return this.sortKey() === key ? `${label} ↓` : label;
  }

  // ── Handlers ───────────────────────────────────────────────────────────────
  select(code: string): void {
    this.selectedCode.set(code);
  }

  /** mat-chip-listbox emits the chosen chip's key, or nothing when the chosen chip is clicked again. */
  onChip(key: StateFilter | undefined): void {
    this.filter.set(key ?? null);
  }

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  onView(view: View): void {
    this.view.set(view);
  }

  subtitle(): string {
    return this.view() === 'track'
      ? "Where each state stands on its own conditions. Bubble size shows the annual allocation. Click a state to preview it, then open View State to explore more."
      : 'Claim letters and ULB progress for each state, grouped by where the claim stands. Pick a column heading to re-rank, or click a state to explore its data.';
  }
}
