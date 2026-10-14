import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, map, switchMap } from 'rxjs';
import { CategoryNavComponent } from '../components/category-nav.component';
import { ThreadListComponent } from '../components/thread-list.component';
import { findCategoryContent } from '../forum.constants';
import { toLoadable } from '../forum-loadable';
import { ForumService } from '../forum.service';
import { ForumStatusComponent } from './forum-status.component';

@Component({
  selector: 'app-forum-category-page',
  standalone: true,
  imports: [CategoryNavComponent, ThreadListComponent, ForumStatusComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (vm(); as v) {
      @switch (v.status) {
        @case ('loading') {
          <div class="loading" role="status">
            <span></span>
            <p>Gathering discussions…</p>
          </div>
        }
        @case ('error') {
          @if (v.notFound) {
            <app-forum-status
              eyebrow="404"
              heading="That conversation wandered off"
              message="The page may have moved or never existed."
            />
          } @else {
            <app-forum-status heading="We hit a snag" [message]="v.message" />
          }
        }
        @case ('ready') {
          <section class="page-intro">
            <p class="eyebrow">{{ v.data.content?.eyebrow ?? 'Browse a topic' }}</p>
            <h1>{{ v.data.content?.heading ?? v.data.category.name }}</h1>
            <p>{{ v.data.content?.message ?? v.data.category.description }}</p>
          </section>
          <app-forum-category-nav
            [categories]="v.data.categories"
            [active]="v.data.category.slug"
          />
          <section class="section-heading">
            <h2>{{ v.data.category.name }}</h2>
            <span>{{ v.data.threads.length }} found</span>
          </section>
          <app-forum-thread-list [threads]="v.data.threads" />
        }
      }
    }
  `,
})
export class CategoryPageComponent {
  private readonly forum = inject(ForumService);
  private readonly route = inject(ActivatedRoute);

  protected readonly vm = toSignal(
    this.route.paramMap.pipe(
      map((params) => params.get('categorySlug') ?? ''),
      switchMap((slug) =>
        toLoadable(
          forkJoin({
            categories: this.forum.getCategories(),
            threads: this.forum.getThreads(slug),
          }).pipe(
            map(({ categories, threads }) => {
              const category = categories.find((c) => c.slug === slug);
              if (!category) {
                throw new HttpErrorResponse({ status: 404, statusText: 'Category not found' });
              }
              return { categories, threads, category, content: findCategoryContent(slug) };
            }),
          ),
        ),
      ),
    ),
  );
}
