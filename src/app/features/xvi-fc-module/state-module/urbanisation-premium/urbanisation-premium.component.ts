import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-urbanisation-premium',
  imports: [],
  templateUrl: './urbanisation-premium.component.html',
  styleUrl: './urbanisation-premium.component.scss',
})
export class UrbanisationPremiumComponent {
  statCards = signal([
    { title: '₹2,000 / person', description: 'Grant rate' },
    { title: 'Census 2011', description: 'Population base' },
    { title: '≥1 lakh pop', description: 'Eligible ULG threshold' },
  ]);

  summary = signal([
    {
      title: 'Purpose',
      desc: [
        'Incentive to merge peri-urban villages into adjoining ULGs (population ≥1 lakh) to support planned urbanisation and service delivery, as per the mandatory rural-urban transition policy formulated by each state',
      ],
    },
    {
      title: 'End-Use',
      desc: [
        'Existing ULGs (population ≥1 lakh) expanding with merger of peri-urban areas are the beneficiaries',
        'Grant to be used for upgradation of basic infrastructure in newly included areas or upgradation of capacity for provision of civic services',
      ],
    },
    {
      title: 'State Rural-Urban Transition Policy',
      desc: [
        'Identification of eligible transitional settlements after each Census and at intervals of no more than three years, covering at least one-third qualifying transitional settlements per round',
        'Defined procedures for identification, assessment, and notification of transitional settlements',
        'Detailed transition plan (3-year horizon) for impact assessment on finances, staffing, service delivery, and infrastructure',
        'Clearly defined roles across the state, district, RLGs, and new ULGs, with public consultations and a grievance redress mechanism',
      ],
    },
  ]);
}
