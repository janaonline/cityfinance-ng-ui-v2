import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../../core/services/auth.service';

/**
 * Landed on when an already-authenticated ULB session is found ineligible for XVI FC (e.g. a
 * Cantonment Board) by `xvifcEligibilityGuard` — the guard for *fresh* logins is
 * `LoginService.login()`/`OtpService.verifyOtp()` on the backend, which blocks token issuance
 * before this page would ever be reached. This page only covers the "already holds a valid
 * token" case (deep link, pre-existing session). Deliberately NOT nested under `/xvifc` — that
 * route tree is itself gated by this same eligibility guard, which would loop.
 */
@Component({
  selector: 'app-not-eligible',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './not-eligible.component.html',
  styleUrl: './not-eligible.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotEligibleComponent {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  logout(): void {
    this.authService.logout().subscribe(() => {
      void this.router.navigate(['/auth', 'login', '16thFC'], { replaceUrl: true });
    });
  }
}
