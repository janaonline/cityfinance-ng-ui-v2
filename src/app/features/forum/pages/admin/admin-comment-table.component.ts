import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
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
                        [disabled]="pending() === comment.id"
                        (click)="update(comment, false)"
                      >
                        Restore
                      </button>
                    } @else {
                      <button
                        type="button"
                        class="danger"
                        [disabled]="pending() === comment.id"
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

  readonly initialComments = input.required<ForumAdminComment[]>();
  /** Net change in visible replies (negative when comments were hidden). */
  readonly visibilityChange = output<number>();

  protected readonly comments = linkedSignal(() => this.initialComments());
  protected readonly pending = signal<string | null>(null);
  protected readonly error = signal('');

  protected date(value: string): string {
    return formatDate(value);
  }

  protected update(comment: ForumAdminComment, isDeleted: boolean): void {
    this.error.set('');
    this.pending.set(comment.id);
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
        this.comments.update((items) =>
          items.map((item) =>
            affected.has(item.id)
              ? {
                  ...item,
                  deletedAt: isDeleted ? new Date().toISOString() : null,
                  deletedBy: isDeleted ? 'admin' : null,
                }
              : item,
          ),
        );
        this.visibilityChange.emit(isDeleted ? -changedCount : changedCount);
        this.pending.set(null);
      },
      error: (err: unknown) => {
        this.error.set(toFormError(err, 'Could not update comment.').message);
        this.pending.set(null);
      },
    });
  }
}
