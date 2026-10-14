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
  replyCount: number;
  memberCount: number;
}

const score = (t: ForumThread) => t.viewCount + t.replyCount + t.likeCount;

@Component({
  selector: 'app-forum-home',
  standalone: true,
  imports: [RouterLink, CategoryNavComponent, ThreadListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero prototype-hero">
      <div>
        <p class="eyebrow">16th Finance Commission</p>
        <h1>Discussion Forum</h1>
        <p>
          A collaborative space for ULBs, State DMAs, and MoHUA to ask questions, share resources,
          and exchange notes on grant compliance and municipal finance.
        </p>
      </div>
      <div class="hero-illustration" aria-hidden="true">
        <span class="sun"></span>
        <span class="tower one"></span>
        <span class="tower two"></span>
        <span class="tower three"></span>
        <span class="tree left"></span>
        <span class="tree right"></span>
        <a class="button hero-button" routerLink="/forum/threads/new"
          >Start a discussion <span>+</span></a
        >
      </div>
    </section>

    <aside class="guidelines">
      <h2>Community Guidelines</h2>
      <ol>
        <li>
          <span class="guide-icon guide-topic" aria-hidden="true"></span>
          <p>Keep posts relevant to urban finance, grant compliance, or municipal governance.</p>
        </li>
        <li>
          <span class="guide-icon guide-smile" aria-hidden="true">:)</span>
          <p>Treat colleagues across roles and states with professional courtesy.</p>
        </li>
        <li>
          <span class="guide-icon guide-lock" aria-hidden="true"></span>
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
            <p>Gathering discussions…</p>
          </div>
        }
        @case ('error') {
          <div class="empty-state error-state">
            <h2>We hit a snag</h2>
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
                <h2>About this Board</h2>
                <p>
                  Connect with peers, seek clarity, and collaborate on improving municipal finance
                  and governance.
                </p>
                <div class="board-stats">
                  <span
                    ><strong>{{ v.data.memberCount.toLocaleString() }}</strong
                    ><small>Members</small></span
                  >
                  <span
                    ><strong>{{ v.data.threads.length.toLocaleString() }}</strong
                    ><small>Discussions</small></span
                  >
                  <span
                    ><strong>{{ v.data.replyCount.toLocaleString() }}</strong
                    ><small>Replies</small></span
                  >
                </div>
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
              const members = new Set(threads.map((t) => t.user.userId).filter(Boolean)).size;
              return {
                query,
                categories,
                threads,
                popular,
                replyCount: threads.reduce((total, t) => total + t.replyCount, 0),
                memberCount: Math.max(members, 1),
              };
            }),
          ),
        ),
      ),
    ),
  );
}
