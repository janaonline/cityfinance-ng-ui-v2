import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { CategoryNavComponent } from '../components/category-nav.component';
import { ThreadListComponent } from '../components/thread-list.component';
import { toLoadable } from '../forum-loadable';
import { ForumCategory, ForumThread } from '../forum.models';
import { ForumService } from '../forum.service';

interface HomeData {
  query: string;
  categories: ForumCategory[];
  threads: ForumThread[];
  popular: ForumThread[];
}

const score = (t: ForumThread) => t.viewCount + t.replyCount + t.likeCount;

@Component({
  selector: 'app-forum-home',
  standalone: true,
  imports: [RouterLink, CategoryNavComponent, ThreadListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero">
      <div>
        <p class="eyebrow">16th Finance Commission</p>
        <h1>Discussion forum</h1>
        <p>
          A collaborative space for ULBs, State DMAs, and MoHUA to ask questions, share resources,
          and exchange notes on grant compliance and municipal finance.
        </p>
      </div>
      <a
        class="btn btn-cfPrimary fw-bold d-inline-flex align-items-center gap-2"
        routerLink="/forum/threads/new"
        ><i class="bi bi-plus-lg" aria-hidden="true"></i>Start a discussion</a
      >
    </section>

    <aside class="guidelines">
      <h2>Community guidelines</h2>
      <ol>
        <li>
          <i class="guide-icon bi bi-chat-square-text" aria-hidden="true"></i>
          <p>Keep posts relevant to urban finance, grant compliance, or municipal governance.</p>
        </li>
        <li>
          <i class="guide-icon bi bi-people" aria-hidden="true"></i>
          <p>Treat colleagues across roles and states with professional courtesy.</p>
        </li>
        <li>
          <i class="guide-icon bi bi-shield-lock" aria-hidden="true"></i>
          <p>
            Do not share unpublished government orders, internal references, or personal details.
          </p>
        </li>
      </ol>
    </aside>

    @if (vm(); as v) {
      @switch (v.status) {
        @case ('loading') {
          <div class="loading" role="status">
            <span></span>
            <p>Loading discussions…</p>
          </div>
        }
        @case ('error') {
          <div class="empty-state error-state">
            <h2>Could not load discussions</h2>
            <p>{{ v.message }}</p>
          </div>
        }
        @case ('ready') {
          <div class="board-layout">
            <section class="board-feed">
              <div class="feed-toolbar">
                <app-forum-category-nav [categories]="v.data.categories" />
              </div>
              @if (v.data.query) {
                <div class="search-summary">
                  <span
                    >{{ v.data.threads.length }}
                    {{ v.data.threads.length === 1 ? 'result' : 'results' }} for
                    <strong>{{ v.data.query }}</strong></span
                  >
                  <a routerLink="/forum">Clear search</a>
                </div>
              }
              <app-forum-thread-list [threads]="v.data.threads" />
            </section>

            <aside class="board-sidebar">
              <section class="sidebar-card popular-threads-card">
                <h2>Popular threads</h2>
                @if (v.data.popular.length) {
                  <div class="popular-thread-table-wrap">
                    <table class="popular-thread-table">
                      <thead>
                        <tr>
                          <th aria-label="Rank">#</th>
                          <th>Thread</th>
                          <th>Views</th>
                          <th>Replies</th>
                          <th>Likes</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (thread of v.data.popular; track thread.id; let i = $index) {
                          <tr>
                            <td>{{ i + 1 }}</td>
                            <td>
                              <a [routerLink]="['/forum/threads', thread.slug]">{{
                                thread.title
                              }}</a>
                            </td>
                            <td>{{ thread.viewCount }}</td>
                            <td>{{ thread.replyCount }}</td>
                            <td>{{ thread.likeCount }}</td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                } @else {
                  <p>No discussions yet.</p>
                }
              </section>
              <section class="sidebar-card">
                <h2>About this board</h2>
                <p>
                  Connect with peers, seek clarity, and collaborate on improving municipal finance
                  and governance.
                </p>
              </section>
            </aside>
          </div>
        }
      }
    }
  `,
})
export class ForumHomeComponent {
  private readonly forum = inject(ForumService);
  private readonly route = inject(ActivatedRoute);

  protected readonly vm = toSignal(
    this.route.queryParamMap.pipe(
      map((params) => params.get('q')?.trim() ?? ''),
      switchMap((query) =>
        toLoadable(
          forkJoin({
            categories: this.forum.getCategories(),
            threads: this.forum.getThreads(undefined, query),
            // With a search active, popularity is still computed over all threads.
            all: query ? this.forum.getThreads() : of<ForumThread[] | null>(null),
          }).pipe(
            map(({ categories, threads, all }): HomeData => {
              const popular = [...(all ?? threads)]
                .sort(
                  (a, b) =>
                    score(b) - score(a) ||
                    Date.parse(b.lastActivityAt) - Date.parse(a.lastActivityAt),
                )
                .slice(0, 3);
              return { query, categories, threads, popular };
            }),
          ),
        ),
      ),
    ),
  );
}
