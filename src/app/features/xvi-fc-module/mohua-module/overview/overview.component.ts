import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
import { XVIFC_LS_KEYS } from '../../shared/years-selection/years-selection.component';
import { OverviewBriefingComponent } from './briefing/overview-briefing.component';
import { STATE_ROWS, StateStatus } from './overview-states.placeholder';
import { OverviewStatesGlanceComponent, StateFilter } from './states-glance/overview-states-glance.component';

/** MoHUA overview: a briefing band with allocation and claims, and every state at a glance. */
@Component({
  selector: 'app-mohua-overview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OverviewBriefingComponent, OverviewStatesGlanceComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class MohuaOverviewComponent {
  readonly rows = STATE_ROWS;
  readonly yearLabel = signal<string>(this.readSelectedYear());
  readonly stateFilter = signal<StateFilter | null>(null);

  private readonly statesSection = viewChild('states', { read: ElementRef<HTMLElement> });

  /** A status button in the briefing band filters the states section and brings it into view. */
  showStatus(status: StateStatus): void {
    this.stateFilter.set(status);
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    this.statesSection()?.nativeElement.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  private readSelectedYear(): string {
    try {
      return localStorage.getItem(XVIFC_LS_KEYS.selectedYearString) ?? '';
    } catch {
      return '';
    }
  }
}
