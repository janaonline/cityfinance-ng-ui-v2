import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { formatDate } from '../forum-date';
import { canComment, canModerateComment } from '../forum-permissions';
import { MAX_COMMENT_DEPTH } from '../forum.constants';
import { ForumComment, ForumViewer } from '../forum.models';
import { ForumService } from '../forum.service';
import { toFormError } from '../forum-errors';
import { MarkdownComponent } from '../markdown/markdown.component';
import { CommentFormComponent } from './comment-form.component';
import { ReactionButtonComponent } from './reaction-button.component';

/** Threaded comment list (up to three levels) with inline reply forms. */
@Component({
  selector: 'app-forum-comment-list',
  standalone: true,
  imports: [NgTemplateOutlet, MarkdownComponent, ReactionButtonComponent, CommentFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #node let-comment let-depth="depth">
      <div [class]="depth ? 'nested-comment reply-depth-' + depth : ''">
        <article class="comment">
          <div class="avatar" aria-hidden="true">{{ initial(comment) }}</div>
          <div>
            <header>
              <strong>{{ comment.user.name }}</strong>
              <span class="role-badge">{{ comment.user.role }}</span>
              <span>#{{ numberOf(comment) }} · {{ date(comment) }}</span>
            </header>
            <app-forum-markdown [source]="comment.body" />
            <div class="comment-reactions">
              <app-forum-reaction-button
                target="comment-like"
                [targetId]="comment.id"
                [initialCount]="comment.likeCount"
                [initialActive]="!!comment.liked"
              />
              @if (mayReply() && depth < maxDepth - 1) {
                <button class="text-action" type="button" (click)="toggleReply(comment.id)">
                  Reply
                </button>
              }
              @if (mayModerate(comment)) {
                <button class="text-action" type="button" (click)="remove(comment)">Remove</button>
              }
              @if (errors()[comment.id]; as err) {
                <span class="field-error">{{ err }}</span>
              }
            </div>
            @if (replyingTo() === comment.id) {
              <div class="nested-reply-form">
                <app-forum-comment-form
                  [threadId]="threadId()"
                  [parentId]="comment.id"
                  [cancellable]="true"
                  (posted)="onPosted()"
                  (cancelled)="replyingTo.set(null)"
                />
              </div>
            }
          </div>
        </article>
        @for (child of childrenOf(comment.id); track child.id) {
          <ng-container
            *ngTemplateOutlet="node; context: { $implicit: child, depth: depth + 1 }"
          ></ng-container>
        }
      </div>
    </ng-template>

    @if (!comments().length) {
      <p class="empty-replies">No replies yet. Start the conversation.</p>
    } @else {
      <div class="comment-list">
        @for (root of roots(); track root.id) {
          <ng-container
            *ngTemplateOutlet="node; context: { $implicit: root, depth: 0 }"
          ></ng-container>
        }
      </div>
    }
  `,
})
export class CommentListComponent {
  private readonly forum = inject(ForumService);

  readonly comments = input.required<ForumComment[]>();
  readonly threadId = input.required<string>();
  readonly viewer = input<ForumViewer | null>(null);
  /** Emitted after a reply is posted or a comment is removed, so the page can reload. */
  readonly changed = output<void>();

  protected readonly maxDepth = MAX_COMMENT_DEPTH;
  protected readonly replyingTo = signal<string | null>(null);
  protected readonly errors = signal<Record<string, string>>({});

  protected readonly roots = computed(() => this.comments().filter((c) => !c.parentId));
  private readonly children = computed(() => {
    const map = new Map<string, ForumComment[]>();
    for (const comment of this.comments()) {
      if (comment.parentId)
        map.set(comment.parentId, [...(map.get(comment.parentId) ?? []), comment]);
    }
    return map;
  });
  private readonly numbers = computed(
    () => new Map(this.comments().map((c, index) => [c.id, index + 1] as const)),
  );

  protected childrenOf(id: string): ForumComment[] {
    return this.children().get(id) ?? [];
  }

  protected numberOf(comment: ForumComment): number {
    return this.numbers().get(comment.id) ?? 0;
  }

  protected initial(comment: ForumComment): string {
    return comment.user.name.charAt(0).toUpperCase();
  }

  protected date(comment: ForumComment): string {
    return formatDate(comment.createdAt);
  }

  protected mayReply(): boolean {
    return canComment(this.viewer());
  }

  protected mayModerate(comment: ForumComment): boolean {
    return canModerateComment(this.viewer(), comment);
  }

  protected toggleReply(id: string): void {
    this.replyingTo.update((current) => (current === id ? null : id));
  }

  protected onPosted(): void {
    this.replyingTo.set(null);
    this.changed.emit();
  }

  protected remove(comment: ForumComment): void {
    if (!window.confirm('Remove this comment? It will be soft deleted.')) return;
    this.forum.deleteComment(comment.id).subscribe({
      next: () => {
        this.errors.update((all) => {
          const rest = { ...all };
          delete rest[comment.id];
          return rest;
        });
        this.changed.emit();
      },
      error: (err: unknown) =>
        this.errors.update((all) => ({
          ...all,
          [comment.id]: toFormError(err, 'Could not delete comment.').message,
        })),
    });
  }
}
