import { Component } from '@angular/core';
import {
  OverviewData,
  OverviewCardComponent,
} from '../../shared/overview-card/overview-card.component';
@Component({
  selector: 'app-overview',
  imports: [OverviewCardComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent {
  ulbOverviewData: OverviewData = {
    name: 'Greater Visakhapatnam Municipal Corporation',
    financialYear: 'FY 2026-27',
    subHeader1: 'Estimated Grant',
    subHeader2: 'BASIC GRANT ONLY',
    totalAllocation: '₹12,158 crore',
    totalAllocationNote: 'Based on SFC data, population figures, and CF calculations',
    grantSections: [
      {
        id: 'basic',
        label: 'Basic Grants',
        componentLabel: 'Grant Component',
        title: 'Basic Grants',
        amount: '₹1,500 crore',
        points: [
          'Supports delivery of core municipal services across eligible Urban Local Bodies.',
          'Focused on improving service continuity, maintenance, and local civic infrastructure.',
          'Released as part of the state’s overall grant support framework.',
        ],
      },
      {
        id: 'performance',
        label: 'Performance Grants',
        componentLabel: 'Grant Component',
        title: 'Performance Grants',
        amount: '₹648 crore',
        points: [
          'Linked to achievement of reform-linked performance indicators by eligible ULBs.',
          'Encourages stronger financial management, reporting, and governance outcomes.',
          'Designed to reward measurable improvements in urban administration.',
        ],
      },
    ],
  };
}
