import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatDate } from '../forum-date';
import { ForumThread } from '../forum.models';
import { ReactionButtonComponent } from './reaction-button.component';

const TONES = ['mint', 'gold', 'violet', 'rose'];

@Component({
  selector: 'app-forum-thread-card',
  standalone: true,
  imports: [RouterLink, ReactionButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="thread-card">
      <div class="thread-type-icon" [class]="tone()" aria-hidden="true"></div>
      <div class="thread-main">
        <h2>
          <a [routerLink]="['/forum/threads', thread().slug]">{{ thread().title }}</a>
        </h2>
        <p class="meta">
          <strong>{{ thread().user.name }}</strong> <span>-</span> {{ date() }} in
          <a [routerLink]="['/forum/categories', thread().categorySlug]">{{
            thread().categorySlug
          }}</a>
        </p>
      </div>
      <div class="thread-stats">
        <span class="thread-count">{{ thread().replyCount }}</span>
        <span class="thread-count">{{ thread().viewCount }}</span>
        <app-forum-reaction-button
          [compact]="true"
          target="thread-like"
          [targetId]="thread().id"
          [initialCount]="thread().likeCount"
          [initialActive]="liked()"
        />
        <app-forum-reaction-button
          [compact]="true"
          target="thread-bookmark"
          [targetId]="thread().id"
          [initialCount]="thread().bookmarkCount"
          [initialActive]="bookmarked()"
        />
      </div>
    </article>
  `,
})
export class ThreadCardComponent {
  readonly thread = input.required<ForumThread>();
  /** Overrides the thread's own viewer flag (e.g. everything on /saved is bookmarked). */
  readonly bookmarkedOverride = input<boolean | null>(null);

  protected readonly tone = computed(() => TONES[this.thread().title.length % TONES.length]);
  protected readonly date = computed(() => formatDate(this.thread().createdAt));
  protected readonly liked = computed(() => !!this.thread().liked);
  protected readonly bookmarked = computed(
    () => this.bookmarkedOverride() ?? !!this.thread().bookmarked,
  );
}
