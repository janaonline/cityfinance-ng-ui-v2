import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * TS-1262 — placeholder for the Municipal Data Hub. The home page's gating (role + pilot-state
 * allowlist, see municipal-data-hub.eligibility.ts) and this route's guard are real; the actual
 * data views are a separate, later ticket.
 */
@Component({
  selector: 'app-municipal-data-hub',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="stub">
      <h1>Municipal Data Hub</h1>
      <p>This module is being built. State and ULB-level municipal finance data will appear here.</p>
      <a routerLink="/">&larr; Back to home</a>
    </section>
  `,
  styles: [
    `
      .stub {
        max-width: 560px;
        margin: 64px auto;
        padding: 32px;
        text-align: center;
      }
      h1 {
        font-size: 22px;
        font-weight: 700;
        margin-bottom: 8px;
      }
      p {
        color: #6b7169;
        margin-bottom: 16px;
      }
    `,
  ],
})
export class MunicipalDataHubComponent {}
