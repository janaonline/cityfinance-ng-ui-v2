import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';
import { AmountDisplayModeService } from '../../../../core/services/amount-display-mode.service';
import { AmountDisplayToggleComponent } from '../../../../shared/components/amount-display-toggle/amount-display-toggle.component';
export interface GrantPoint {
  text: string;
  subPoints?: string[];
}

export interface GrantSection {
  id: string;
  label: string;
  componentLabel: string;
  title: string;
  /** A raw number (this state's actual grant total — formatted live at render time) for Basic/
   *  Performance grants; a plain pre-formatted string for the two fixed national policy figures
   *  (Special Infrastructure/Urbanization Premium) that aren't this state's own data and so never
   *  respond to the amount-display override. */
  amount?: number | string;
  amountSuffix?: string;
  description?: string;
  points: Array<string | GrantPoint>;
  note?: string;
}

export interface OverviewData {
  name: string;
  subHeader1?: string;
  subHeader2?: string;
  financialYear: string;
  /** A raw number (formatted live at render time) once real data exists; a plain pre-formatted
   *  string for roles/pages with no allocation figure to show yet (e.g. ULB overview's "Allocation
   *  will be displayed once the State submits..." placeholder). */
  totalAllocation: number | string;
  totalAllocationNote: string;
  grantSections: GrantSection[];
}
@Component({
  selector: 'app-overview-card',
  imports: [CommonModule, MatBadgeModule, AmountDisplayToggleComponent],
  templateUrl: './overview-card.component.html',
  styleUrl: './overview-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewCardComponent implements OnChanges {
  private readonly amountDisplay = inject(AmountDisplayModeService);

  @Input({ required: true }) overviewData: OverviewData | null = null;
  @Input() initialSelectedGrantId: string | null = null;
  @Input() isLoading = false;
  @Input() selectedYear: string | null = null;
  selectedGrantId = '';

  /** State-wide aggregate, so this follows the same `'auto'` page default used everywhere else on
   *  this dashboard-style page. */
  readonly formatAmount = (value: number) => this.amountDisplay.format(value, 'auto');

  /** Narrows `GrantSection.amount` — real grant totals are numbers formatted live; the two fixed
   *  national policy figures are already-formatted strings shown as-is. */
  isAmountNumber(amount: number | string | undefined): amount is number {
    return typeof amount === 'number';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['overviewData'] || changes['initialSelectedGrantId']) {
      this.syncSelectedGrant();
    }
  }

  get selectedGrant(): GrantSection | null {
    const grantSections = this.overviewData?.grantSections ?? [];
    return (
      grantSections.find((item) => item.id === this.selectedGrantId) ?? grantSections[0] ?? null
    );
  }

  selectGrant(id: string): void {
    this.selectedGrantId = id;
  }

  isSelected(id: string): boolean {
    return this.selectedGrantId === id;
  }

  isGrantPoint(p: string | GrantPoint): p is GrantPoint {
    return typeof p === 'object';
  }

  private syncSelectedGrant(): void {
    const grantSections = this.overviewData?.grantSections ?? [];

    if (!grantSections.length) {
      this.selectedGrantId = '';
      return;
    }

    const preferredId = this.initialSelectedGrantId || this.selectedGrantId;
    const hasPreferred = preferredId
      ? grantSections.some((item) => item.id === preferredId)
      : false;

    this.selectedGrantId = hasPreferred ? preferredId! : grantSections[0].id;
  }
}
