import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';
export interface GrantSection {
  id: string;
  label: string;
  componentLabel: string;
  title: string;
  amount: string;
  points: string[];
}

export interface OverviewData {
  name: string;
  subHeader1?: string;
  subHeader2?: string;
  financialYear: string;
  totalAllocation: string;
  totalAllocationNote: string;
  grantSections: GrantSection[];
}
@Component({
  selector: 'app-overview-card',
  imports: [CommonModule, MatBadgeModule],
  templateUrl: './overview-card.component.html',
  styleUrl: './overview-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewCardComponent implements OnChanges {
  @Input({ required: true }) overviewData: OverviewData | null = null;
  @Input() initialSelectedGrantId: string | null = null;
  @Input() isLoading = false;
  selectedGrantId = '';

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
