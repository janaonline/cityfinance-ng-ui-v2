import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-special-infrastructure',
  imports: [],
  templateUrl: './special-infrastructure.component.html',
  styleUrl: './special-infrastructure.component.scss',
})
export class SpecialInfrastructureComponent {
  statCards = signal([
    { title: '22 cities', description: 'National coverage' },
    { title: '60% funded', description: "Centre's contribution" },
    { title: 'AP eligible', description: 'Visakhapatnam · Vijayawada' },
  ]);

  summary = signal([
    {
      title: 'Purpose',
      desc: [
        'Promote development of a comprehensive wastewater management system in 22 cities with populations between 1-4 million, to address inadequate drainage systems and flooding events',
      ],
    },
    {
      title: 'Eligible Cities in Andhra Pradesh',
      desc: ['Visakhapatnam', 'Vijayawada'],
    },
    {
      title: 'End-Use',
      desc: [
        'Upgradation or extension of drainage network, including restoration of natural drainage pathways and development of green infrastructure',
        'Reduction of non-revenue water',
        'Development of monitoring systems and systems to ensure the free flow of wastewater',
      ],
    },
    {
      title: 'Grant Administration',
      desc: [
        'Selected ULGs to prepare project reports based on detailed diagnostic studies',
        'Tripartite MoU to be signed between MoHUA, the state government, and the ULG, covering project details, year-wise milestones, and financial outlays',
        'First instalment released after signing of MoU; subsequent releases on achieving project milestones',
      ],
    },
  ]);
}
