import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';

type CardAccent = 'green' | 'blue' | 'orange' | 'gray' | 'indigo';

interface RoleCard {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  accent: CardAccent;
  route: string[];
}

@Component({
  selector: 'app-landing',
  imports: [NgFor, RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  protected readonly primaryCards: readonly RoleCard[] = [
    {
      title: 'Urban Local Body',
      subtitle: 'ULB',
      description:
        'Upload compliance documents, track submission status, and monitor your eligible grant amount.',
      icon: 'bi-bar-chart-fill',
      accent: 'green',
      route: ['/auth/login', 'XVIFC'],
    },
    {
      title: 'State DMA',
      subtitle: 'STATE REVIEWER',
      description:
        'Review ULB submissions, validate compliance documents, and forward eligible applications to MoHUA.',
      icon: 'bi-bank',
      accent: 'blue',
      route: ['/auth/login', 'XVIFC'],
    },
  ];

  protected readonly secondaryCards: readonly RoleCard[] = [
    {
      title: 'MoHUA Reviewer',
      subtitle: 'MINISTRY REVIEWER',
      description:
        'Review state-validated submissions, run compliance checks, and issue sanction letters for fund release.',
      icon: 'bi-bullseye',
      accent: 'orange',
      route: ['/auth/login', 'XVIFC'],
    },
    {
      title: 'Dept. of Expenditure',
      subtitle: 'DOE',
      description:
        'Track received sanction letters and execute fund releases to eligible Urban Local Bodies.',
      icon: 'bi-shield-lock',
      accent: 'gray',
      route: ['/auth/login', 'XVIFC'],
    },
    {
      title: 'Admin (Tech Team)',
      subtitle: 'ADMIN',
      description:
        'Send system notifications, bulk reminders, and manage communications across all user roles.',
      icon: 'bi-bell-fill',
      accent: 'indigo',
      route: ['/auth/login'],
    },
  ];
}
