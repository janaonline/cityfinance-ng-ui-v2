import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, input, signal, viewChild } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';

export type TruncatedTextMode = 'ellipsis' | 'clamp';

/**
 * Renders table-cell text that may be arbitrarily long, in one of two ways depending on what kind
 * of column it is:
 * - `'ellipsis'` (default) — single-line truncation with a tooltip revealing the full value, for
 *   identification columns (e.g. a name) that must stay on one line and keep row height stable.
 * - `'clamp'` — multi-line clamp (`lines`, default 3) with a "Show more"/"Show less" toggle, for
 *   read-worthy free text (e.g. a remark or declaration) where hiding most of the content behind
 *   an ellipsis would defeat the point — a reviewer may need to read all of it.
 * Either affordance (tooltip / toggle) only ever renders when the text actually overflows — short
 * values never get a needless hint.
 */
@Component({
  selector: 'app-truncated-text',
  standalone: true,
  imports: [MatTooltipModule],
  templateUrl: './truncated-text.component.html',
  styleUrl: './truncated-text.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TruncatedTextComponent implements AfterViewInit, OnDestroy {
  readonly text = input<string | null | undefined>('');
  readonly mode = input<TruncatedTextMode>('ellipsis');
  readonly lines = input<number>(3);

  private readonly textEl = viewChild<ElementRef<HTMLElement>>('textEl');
  private resizeObserver?: ResizeObserver;

  readonly isOverflowing = signal(false);
  readonly expanded = signal(false);

  ngAfterViewInit(): void {
    this.checkOverflow();
    const el = this.textEl()?.nativeElement;
    if (el && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.checkOverflow());
      this.resizeObserver.observe(el);
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  toggleExpanded(): void {
    this.expanded.update((v) => !v);
  }

  /** Measures overflow against the element's collapsed (clamped/single-line) size only — while
   *  expanded there's no clamp to overflow against, so re-measuring then would wrongly hide the
   *  "Show less" toggle. The resize observer skips measuring in that state for the same reason. */
  private checkOverflow(): void {
    if (this.expanded()) return;
    const el = this.textEl()?.nativeElement;
    if (!el) return;
    const overflowing = this.mode() === 'clamp' ? el.scrollHeight > el.clientHeight : el.scrollWidth > el.clientWidth;
    this.isOverflowing.set(overflowing);
  }
}
