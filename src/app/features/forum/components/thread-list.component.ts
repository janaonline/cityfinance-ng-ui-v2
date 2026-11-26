import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { THREADS_PAGE_SIZE } from '../forum.constants';
import { ForumCategory, ForumThread } from '../forum.models';
import { ForumService } from '../forum.service';
import { ThreadCardComponent } from './thread-card.component';

/** Paginated (client-side) thread list. */
@Component({
  selector: 'app-forum-thread-list',
  standalone: true,
  imports: [ThreadCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!threads().length) {
      <div class="empty-state">
        <h2>{{ emptyTitle() }}</h2>
        @if (emptyMessage()) {
          <p>{{ emptyMessage() }}</p>
        }
      </div>
    } @else {
      <div class="thread-list">
        <div class="thread-list-head">
          <span>Discussion</span><span>Replies</span><span>Views</span><span>Likes</span
          ><span>Last post</span>
        </div>
        @for (thread of visibleThreads(); track thread.id) {
          <app-forum-thread-card
            [thread]="thread"
            [categoryName]="categoryNames().get(thread.categorySlug) ?? null"
          />
        }
        @if (pageCount() > 1) {
          <nav class="pagination" aria-label="Discussion pages">
            <button
              type="button"
              [disabled]="currentPage() === 1"
              (click)="goTo(currentPage() - 1)"
            >
              Previous
            </button>
            <div class="pagination-pages">
              @for (n of pageNumbers(); track n) {
                <button
                  type="button"
                  [class.active]="n === currentPage()"
                  [attr.aria-current]="n === currentPage() ? 'page' : null"
                  [attr.aria-label]="'Page ' + n"
                  (click)="goTo(n)"
                >
                  {{ n }}
                </button>
              }
            </div>
            <button
              type="button"
              [disabled]="currentPage() === pageCount()"
              (click)="goTo(currentPage() + 1)"
            >
              Next
            </button>
          </nav>
        }
      </div>
    }
  `,
})
export class ThreadListComponent {
  readonly threads = input.required<ForumThread[]>();
  readonly emptyTitle = input('No discussions yet');
  readonly emptyMessage = input<string | null>('Start a discussion to add one here.');

  /** Category names by slug (cached for the session), so every topic shows its name, not its slug. */
  private readonly categories = toSignal(
    inject(ForumService)
      .getCategories()
      .pipe(catchError(() => of([] as ForumCategory[]))),
    { initialValue: [] as ForumCategory[] },
  );
  protected readonly categoryNames = computed(
    () => new Map(this.categories().map((c) => [c.slug, c.name])),
  );

  private readonly page = signal(1);
  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.threads().length / THREADS_PAGE_SIZE)),
  );
  protected readonly currentPage = computed(() => Math.min(this.page(), this.pageCount()));
  protected readonly pageNumbers = computed(() =>
    Array.from({ length: this.pageCount() }, (_, i) => i + 1),
  );
  protected readonly visibleThreads = computed(() => {
    const start = (this.currentPage() - 1) * THREADS_PAGE_SIZE;
    return this.threads().slice(start, start + THREADS_PAGE_SIZE);
  });

  protected goTo(next: number): void {
    this.page.set(Math.max(1, Math.min(next, this.pageCount())));
  }
}
