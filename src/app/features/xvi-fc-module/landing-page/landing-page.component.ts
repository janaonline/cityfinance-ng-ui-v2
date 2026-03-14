import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Roles, XVIFC_DEFAULT_YEAR_ID, buildXvifcFeatureLink } from '../xvifc-side-menu.config';

interface LandingRoleOption {
  label: Roles;
  isActive: boolean;
  description: string;
  routerLink: string[];
}

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {
  protected readonly roleOptions = signal<LandingRoleOption[]>([
    {
      label: 'ULB',
      isActive: true,
      description:
        'Upload compliance documents, track submission status, and monitor your eligible grant amount.',
      routerLink: buildXvifcFeatureLink('ULB', XVIFC_DEFAULT_YEAR_ID, 'overview'),
    },
    {
      label: 'STATE',
      isActive: true,
      description:
        'Review ULB submissions, validate compliance documents, and forward eligible applications to MoHUA.',
      routerLink: buildXvifcFeatureLink('STATE', XVIFC_DEFAULT_YEAR_ID, 'overview'),
    },
    {
      label: 'MOHUA',
      isActive: true,
      description:
        'Review state-validated submissions, run compliance checks, and issue sanction letters for fund release.',
      routerLink: buildXvifcFeatureLink('MOHUA', XVIFC_DEFAULT_YEAR_ID),
    },
    {
      label: 'DOE',
      isActive: false,
      description:
        'Track received sanction letters and execute fund releases to eligible Urban Local Bodies.',
      routerLink: buildXvifcFeatureLink('DOE', XVIFC_DEFAULT_YEAR_ID),
    },
  ]);
}
