import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatDate } from '../forum-date';
import { findCategoryContent } from '../forum.constants';
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
          <strong>{{ thread().user.name }}</strong> · {{ date() }} ·
          <a [routerLink]="['/forum/categories', thread().categorySlug]">{{ topic() }}</a>
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
        <div class="thread-last-post">
          @if (thread().lastReply; as reply) {
            <strong>{{ reply.name }}</strong>
            <span>{{ lastReplyDate() }}</span>
          } @else {
            <span>No replies yet</span>
          }
        </div>
      </div>
    </article>
  `,
})
export class ThreadCardComponent {
  readonly thread = input.required<ForumThread>();
  /** Category name from the API, used for categories without built-in page copy. */
  readonly categoryName = input<string | null>(null);

  protected readonly tone = computed(() => TONES[this.thread().title.length % TONES.length]);
  protected readonly date = computed(() => formatDate(this.thread().createdAt));
  protected readonly lastReplyDate = computed(() => formatDate(this.thread().lastReply?.createdAt));
  protected readonly topic = computed(
    () =>
      findCategoryContent(this.thread().categorySlug)?.name ??
      this.categoryName() ??
      this.thread().categorySlug,
  );
  protected readonly liked = computed(() => !!this.thread().liked);
}
