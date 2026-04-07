import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { XvifcModuleService } from '../xvifc-module.service';
import { Roles, XvifcYearId, buildXvifcFeatureLink } from '../xvifc-side-menu.config';

interface LandingRoleOption {
  label: Roles;
  isActive: boolean;
  isDisabled: boolean;
  description: string;
  routerLink: string[] | null;
}

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent implements OnInit {
  private readonly xvifcService = inject(XvifcModuleService);
  protected readonly availableYearIds = this.xvifcService.availableYearIds;
  protected readonly selectedYearId = signal<XvifcYearId | null>(null);
  /**
   * View model for the workspace cards.
   * Router links remain `null` until a supported year is selected so the user
   * cannot deep link into a workspace without the required route context.
   */
  protected readonly roleOptions = computed<LandingRoleOption[]>(() => {
    const selectedYearId = this.selectedYearId();

    return [
      {
        label: 'ULB',
        isActive: true,
        isDisabled: !selectedYearId,
        description:
          'Upload compliance documents, track submission status, and monitor your eligible grant amount.',
        routerLink: selectedYearId
          ? buildXvifcFeatureLink('ULB', selectedYearId, 'overview')
          : null,
      },
      {
        label: 'STATE',
        isActive: true,
        isDisabled: !selectedYearId,
        description:
          'Review ULB submissions, validate compliance documents, and forward eligible applications to MoHUA.',
        routerLink: selectedYearId
          ? buildXvifcFeatureLink('STATE', selectedYearId, 'overview')
          : null,
      },
      {
        label: 'MOHUA',
        isActive: true,
        isDisabled: !selectedYearId,
        description:
          'Review state-validated submissions, run compliance checks, and issue sanction letters for fund release.',
        routerLink: selectedYearId ? buildXvifcFeatureLink('MOHUA', selectedYearId) : null,
      },
      {
        label: 'DOE',
        isActive: false,
        isDisabled: true,
        description:
          'Track received sanction letters and execute fund releases to eligible Urban Local Bodies.',
        routerLink: null,
      },
    ];
  });


  ngOnInit(): void {
    this.xvifcService.clearResolvedContext();
  }

  /**
   * Normalizes the raw select value to the supported year-id union.
   * Unknown values are ignored so malformed DOM input cannot generate invalid links.
   */
  protected updateSelectedYear(yearId: string): void {
    const selectedYearId =
      this.availableYearIds.find((availableYearId) => availableYearId === yearId) ?? null;
    this.selectedYearId.set(selectedYearId);
  }
}
