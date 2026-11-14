import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Placeholder landing page for PMU users — the real overview is defined in a later ticket. */
@Component({
  selector: 'app-pmu-overview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pmu-overview.component.html',
  styleUrl: './pmu-overview.component.scss',
})
export class PmuOverviewComponent {}
