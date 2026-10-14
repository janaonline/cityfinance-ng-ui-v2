import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { isForumAdmin } from './forum-permissions';
import { injectForumViewer } from './forum-viewer';

/** Layout for every /forum page: sub-navigation with search, then the routed page. */
@Component({
  selector: 'app-forum-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Styles are scoped under `.forum-root` inside forum.scss, so they are safe to apply globally.
  encapsulation: ViewEncapsulation.None,
  styleUrl: './forum.scss',
  template: `
    <div class="forum-root">
      <div class="shell">
        <nav class="header-nav" aria-label="Forum navigation">
          <div class="nav-links">
            <a
              class="nav-link"
              routerLink="/forum"
              [class.active]="section() === 'discussions'"
              [attr.aria-current]="section() === 'discussions' ? 'page' : null"
              >Discussions</a
            >
            <a
              class="nav-link"
              routerLink="/forum/saved"
              [class.active]="section() === 'saved'"
              [attr.aria-current]="section() === 'saved' ? 'page' : null"
              >Saved</a
            >
            <a
              class="nav-link"
              routerLink="/forum/my-threads"
              [class.active]="section() === 'mine'"
              [attr.aria-current]="section() === 'mine' ? 'page' : null"
              >My Threads</a
            >
            @if (isAdmin()) {
              <a
                class="nav-link"
                routerLink="/forum/admin"
                [class.active]="section() === 'admin'"
                [attr.aria-current]="section() === 'admin' ? 'page' : null"
                >Admin</a
              >
            }
          </div>
          <form class="header-search" role="search" (submit)="search($event, q)">
            <input
              #q
              name="q"
              type="search"
              placeholder="Search discussions..."
              aria-label="Search discussions"
              [value]="query()"
            />
            <button type="submit" aria-label="Search">
              <span class="search-icon" aria-hidden="true"></span>
            </button>
          </form>
        </nav>
        <main class="site-main"><router-outlet /></main>
      </div>
    </div>
  `,
})
export class ForumShellComponent {
  private readonly router = inject(Router);
  private readonly viewer = injectForumViewer();

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly isAdmin = computed(() => isForumAdmin(this.viewer()));
  protected readonly query = computed(
    () => (this.router.parseUrl(this.url()).queryParams['q'] as string | undefined) ?? '',
  );
  protected readonly section = computed(() => {
    const path = this.url()
      .split('?')[0]
      .replace(/^\/forum\/?/, '');
    if (path.startsWith('saved')) return 'saved';
    if (path.startsWith('my-threads')) return 'mine';
    if (path.startsWith('admin')) return 'admin';
    if (path.startsWith('threads/new')) return 'new';
    if (path.startsWith('unauthorized')) return 'none';
    return 'discussions';
  });

  protected search(event: Event, input: HTMLInputElement): void {
    event.preventDefault();
    const q = input.value.trim();
    void this.router.navigate(['/forum'], { queryParams: { q: q || null } });
  }
}
