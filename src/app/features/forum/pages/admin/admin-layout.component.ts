import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-forum-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page-intro">
      <p class="eyebrow">Administration</p>
      <h1>Forum management</h1>
      <p>Manage topic categories and moderate discussions from one place.</p>
    </section>
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <p>Manage</p>
        <nav aria-label="Admin panel">
          <a routerLink="categories" routerLinkActive="active" ariaCurrentWhenActive="page">
            <span aria-hidden="true">C</span>Categories
          </a>
          <a routerLink="threads" routerLinkActive="active" ariaCurrentWhenActive="page">
            <span aria-hidden="true">T</span>Threads
          </a>
        </nav>
      </aside>
      <div class="admin-content"><router-outlet /></div>
    </div>
  `,
})
export class AdminLayoutComponent {}
