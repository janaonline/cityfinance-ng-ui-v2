import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthPermissionService } from '../../core/auth/auth-permission.service';
import { AuthService } from '../../core/services/auth.service';
import { isEligibleForMunicipalDataHub } from './municipal-data-hub.eligibility';
import { landingCards } from './cards.constant';

export type CardAccent = 'green' | 'blue' | 'orange' | 'gray' | 'indigo';
export type CardStatus = 'live' | 'readonly' | 'comingSoon';

export interface HomeCard {
  title: string;
  description: string;
  icon: string;
  accent: CardAccent;
  status: CardStatus;
  /** Allow-list of `IUserLoggedInDetails.role` values. Omitted = every role (used by "coming soon" cards). */
  roles?: string[];
  route?: string[];
  /** External href (opens a separate deployed app — see cards.constant.ts for which ones). */
  link?: string;
  /** Municipal Data Hub only: ULB/State additionally need a pilot-state match, MoHUA doesn't. */
  municipalDataHubGated?: boolean;
}

@Component({
  selector: 'app-landing',
  imports: [RouterLink, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  private readonly router = inject(Router);
  private readonly authPermissions = inject(AuthPermissionService);
  private readonly authService = inject(AuthService);

  protected readonly user = this.authPermissions.user;
  protected readonly role = this.authPermissions.role;

  protected readonly cards = computed<HomeCard[]>(() => {
    const role = this.role();
    const user = this.user();

    return landingCards.filter((card) => {
      if (card.roles && (!role || !card.roles.includes(role))) return false;
      if (card.municipalDataHubGated && !isEligibleForMunicipalDataHub(role, user)) return false;
      return true;
    });
  });

  protected statusLabel(status: CardStatus): string {
    switch (status) {
      case 'live':
        return 'Live';
      case 'readonly':
        return 'Read-only';
      case 'comingSoon':
        return 'Coming soon';
    }
  }

  protected signOut(): void {
    this.authService.logout().subscribe({
      next: () => void this.router.navigate(['/auth/login']),
    });
  }
}
