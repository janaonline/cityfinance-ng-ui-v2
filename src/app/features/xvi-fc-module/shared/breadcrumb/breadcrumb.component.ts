import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface XvifcBreadcrumbLink {
  label: string;
  /** Omitted on the trailing (current-page) crumb, which renders as plain text instead of a link. */
  routerLink?: readonly unknown[];
}

/**
 * Small "how do I get back" trail for xvi-fc-module pages reached by drilling into a list (e.g.
 * Claim Letter's create/detail pages) — top-level sidebar destinations don't need this, only pages
 * one level below them. Scoped to xvi-fc-module rather than reusing CFR's `app-breadcrumb` so this
 * change doesn't touch that unrelated feature.
 */
@Component({
  selector: 'app-xvifc-breadcrumb',
  imports: [RouterLink],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class XvifcBreadcrumbComponent {
  readonly links = input.required<readonly XvifcBreadcrumbLink[]>();
}
