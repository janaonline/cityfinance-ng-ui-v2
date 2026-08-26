import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

// ============================================================================
// TEMP — 16th FC ULB "forms coming soon" gate.
// Added 2026-08-26. Meant to live only a few days, until ULB forms actually launch.
// To remove: delete this component's folder, delete
// ulb-module/guards/ulb-forms-coming-soon.guard.ts, remove the guard import/usage in
// xvi-fc-module.routes.ts, and remove this route from app.routes.ts.
// ============================================================================

/**
 * Landed on by `ulbFormsComingSoonGuard` for a ULB user whose account was created in 2026 —
 * forms aren't open yet for this cohort. Deliberately NOT nested under `/xvifc` — that route
 * tree is itself gated by this same guard, which would loop.
 */
@Component({
  selector: 'app-ulb-forms-coming-soon',
  standalone: true,
  imports: [],
  templateUrl: './ulb-forms-coming-soon.component.html',
  styleUrl: './ulb-forms-coming-soon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UlbFormsComingSoonComponent {
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
