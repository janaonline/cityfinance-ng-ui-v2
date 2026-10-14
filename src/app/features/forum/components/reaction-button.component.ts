import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { Observable } from 'rxjs';
import { ForumService } from '../forum.service';

export type ReactionTarget = 'thread-like' | 'thread-bookmark' | 'comment-like';

/** Optimistic like / bookmark toggle; reverts if the request fails. */
@Component({
  selector: 'app-forum-reaction-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="reaction-button"
      [class.active]="active()"
      [class.compact]="compact()"
      [attr.aria-pressed]="active()"
      [attr.aria-label]="label() + ' (' + count() + ')'"
      [disabled]="pending()"
      (click)="toggle()"
    >
      @if (target() === 'thread-bookmark') {
        <svg class="reaction-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 4.5c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v17l-6-3.5-6 3.5v-17Z" />
        </svg>
      } @else {
        <svg class="reaction-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 20.5s-7.5-4.6-9.5-9.1C.8 7.7 3.2 4 7 4c2.1 0 3.8 1.1 5 3 1.2-1.9 2.9-3 5-3 3.8 0 6.2 3.7 4.5 7.4-2 4.5-9.5 9.1-9.5 9.1Z"
          />
        </svg>
      }
      @if (!compact()) {
        {{ label() }}
      }
      <strong>{{ count() }}</strong>
    </button>
  `,
})
export class ReactionButtonComponent {
  private readonly forum = inject(ForumService);

  readonly target = input.required<ReactionTarget>();
  readonly targetId = input.required<string>();
  readonly initialCount = input(0);
  readonly initialActive = input(false);
  readonly compact = input(false);

  protected readonly active = linkedSignal(() => this.initialActive());
  protected readonly count = linkedSignal(() => this.initialCount());
  protected readonly pending = signal(false);

  protected label(): string {
    return this.target() === 'thread-bookmark' ? 'Bookmark' : 'Like';
  }

  protected toggle(): void {
    if (this.pending()) return;
    const next = !this.active();
    this.pending.set(true);
    this.active.set(next);
    this.count.update((value) => Math.max(0, value + (next ? 1 : -1)));
    this.request(next).subscribe({
      next: (result) => {
        const server =
          this.target() === 'thread-bookmark' ? result.bookmarkCount : result.likeCount;
        if (typeof server === 'number') this.count.set(server);
        this.pending.set(false);
      },
      error: () => {
        this.active.set(!next);
        this.count.update((value) => Math.max(0, value + (next ? -1 : 1)));
        this.pending.set(false);
      },
    });
  }

  private request(
    active: boolean,
  ): Observable<{ active: boolean; likeCount?: number; bookmarkCount?: number }> {
    const id = this.targetId();
    switch (this.target()) {
      case 'thread-bookmark':
        return this.forum.reactToThread(id, 'bookmark', active);
      case 'thread-like':
        return this.forum.reactToThread(id, 'like', active);
      default:
        return this.forum.likeComment(id, active);
    }
  }
}
