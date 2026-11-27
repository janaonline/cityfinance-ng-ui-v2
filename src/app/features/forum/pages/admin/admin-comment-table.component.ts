import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { formatDate } from '../../forum-date';
import { toFormError } from '../../forum-errors';
import { ForumAdminComment } from '../../forum.models';
import { ForumService } from '../../forum.service';

/** Soft-delete / restore table for one thread's comments (replies follow their parent). */
@Component({
  selector: 'app-forum-admin-comment-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-panel">
      @if (error()) {
        <p class="form-alert" role="alert">{{ error() }}</p>
      }
      <div class="admin-table-wrap">
        <table class="admin-table comment-admin-table">
          <thead>
            <tr>
              <th>Comment</th>
              <th>Author</th>
              <th>Status</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (comment of comments(); track comment.id) {
              <tr [class.deleted-row]="!!comment.deletedAt">
                <td>
                  <div class="comment-excerpt">{{ comment.body }}</div>
                </td>
                <td>
                  {{ comment.user.name }}<small>{{ comment.user.role }}</small>
                </td>
                <td>
                  <span
                    class="status"
                    [class.deleted]="!!comment.deletedAt"
                    [class.published]="!comment.deletedAt"
                    >{{ comment.deletedAt ? 'Deleted' : 'Visible' }}</span
                  >
                </td>
                <td>{{ date(comment.updatedAt) }}</td>
                <td>
                  <div class="admin-actions">
                    @if (comment.deletedAt) {
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-cfPrimary"
                        [disabled]="isPending(comment.id)"
                        (click)="update(comment, false)"
                      >
                        Restore
                      </button>
                    } @else {
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-danger"
                        [disabled]="isPending(comment.id)"
                        (click)="update(comment, true)"
                      >
                        Soft delete
                      </button>
                    }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5">No comments on this thread.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class AdminCommentTableComponent {
  private readonly forum = inject(ForumService);

  /**
   * One thread's comments. The parent owns this list and applies each `moderated` change to it,
   * so the status survives re-renders and closing / reopening the panel.
   */
  readonly comments = input.required<ForumAdminComment[]>();
  /** A successful soft-delete / restore: the comment plus its replies, for the parent to apply. */
  readonly moderated = output<CommentModeration>();

  private readonly pendingIds = signal<ReadonlySet<string>>(new Set());
  protected readonly error = signal('');

  protected date(value: string): string {
    return formatDate(value);
  }

  protected isPending(commentId: string): boolean {
    return this.pendingIds().has(commentId);
  }

  protected update(comment: ForumAdminComment, isDeleted: boolean): void {
    if (this.isPending(comment.id)) return;
    this.error.set('');
    this.setPending(comment.id, true);
    const all = this.comments();
    const affected = new Set([comment.id]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const item of all) {
        if (item.parentId && affected.has(item.parentId) && !affected.has(item.id)) {
          affected.add(item.id);
          grew = true;
        }
      }
    }
    const changedCount = all.filter(
      (item) => affected.has(item.id) && Boolean(item.deletedAt) !== isDeleted,
    ).length;
    this.forum.moderateComment(comment.id, isDeleted).subscribe({
      next: () => {
        this.moderated.emit({ ids: [...affected], isDeleted, changedCount });
        this.setPending(comment.id, false);
      },
      error: (err: unknown) => {
        this.error.set(toFormError(err, 'Could not update comment.').message);
        this.setPending(comment.id, false);
      },
    });
  }

  private setPending(commentId: string, value: boolean): void {
    this.pendingIds.update((ids) => {
      const next = new Set(ids);
      if (value) next.add(commentId);
      else next.delete(commentId);
      return next;
    });
  }
}

/** A comment and its replies that were soft-deleted or restored together. */
export interface CommentModeration {
  ids: string[];
  isDeleted: boolean;
  /** How many of them actually changed visibility (for the thread's reply count). */
  changedCount: number;
}
