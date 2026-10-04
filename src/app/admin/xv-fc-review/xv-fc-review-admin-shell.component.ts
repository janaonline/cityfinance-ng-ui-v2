import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { provideMaterialThemeScope } from '../../core/theming/material-theme.providers';

/**
 * Applies the admin dashboard's own theme (CSS vars + overlay scoping, see
 * styles/_xv-fc-review-admin-theme.scss) to both child routes (Overview + Detail) — same
 * mechanism XvFcDataReviewComponent uses for the ULB-side page, just wrapping two routed
 * screens instead of doing its own in-component view switching.
 */
const XVFC_ADMIN_THEME_CLASS = 'xvfc-admin-theme';

@Component({
  selector: 'app-xv-fc-review-admin-shell',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  host: {
    class: XVFC_ADMIN_THEME_CLASS,
  },
  providers: [...provideMaterialThemeScope(XVFC_ADMIN_THEME_CLASS)],
})
export class XvFcReviewAdminShellComponent {}
