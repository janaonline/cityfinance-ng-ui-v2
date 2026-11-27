import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatDate } from '../../forum-date';
import { toFormError } from '../../forum-errors';
import { ForumAdminComment, ForumThread, ModerateThreadPayload } from '../../forum.models';
import { ForumService } from '../../forum.service';
import { AdminCommentTableComponent, CommentModeration } from './admin-comment-table.component';

@Component({
  selector: 'app-forum-admin-threads',
  standalone: true,
  imports: [RouterLink, AdminCommentTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="admin-section" aria-labelledby="thread-heading">
      <div class="admin-section-heading">
        <div>
          <p class="eyebrow">Content</p>
          <h2 id="thread-heading">Threads</h2>
          <p>
            Select a thread to moderate its comments, or manage the thread’s publication status.
          </p>
        </div>
        <span>{{ threads().length }} threads</span>
      </div>

      @switch (status()) {
        @case ('loading') {
          <div class="loading" role="status">
            <span></span>
            <p>Loading threads…</p>
          </div>
        }
        @case ('error') {
          <p class="form-alert" role="alert">{{ loadError() }}</p>
        }
        @case ('ready') {
          <div class="admin-thread-moderation">
            @if (selectedThread(); as selected) {
              <section class="selected-thread-comments">
                <div class="admin-section-heading">
                  <div>
                    <p class="eyebrow">Selected thread</p>
                    <h2>Comments</h2>
                    <p>{{ selected.title }}</p>
                  </div>
                  <button class="text-action" type="button" (click)="selectedId.set(null)">
                    Close
                  </button>
                </div>
                @switch (commentsStatus()) {
                  @case ('loading') {
                    <div class="loading" role="status">
                      <span></span>
                      <p>Loading comments…</p>
                    </div>
                  }
                  @case ('error') {
                    <p class="form-alert" role="alert">
                      {{ commentsError() }}
                      <button class="text-action" type="button" (click)="loadComments()">
                        Retry
                      </button>
                    </p>
                  }
                  @case ('ready') {
                    <app-forum-admin-comment-table
                      [comments]="selectedComments()"
                      (moderated)="onCommentsModerated(selected.id, $event)"
                    />
                  }
                }
              </section>
            }
            <div class="admin-panel">
              @if (error()) {
                <p class="form-alert" role="alert">{{ error() }}</p>
              }
              <div class="admin-table-wrap">
                <table class="admin-table">
                  <thead>
                    <tr>
                      <th>Thread</th>
                      <th>Author</th>
                      <th>Replies</th>
                      <th>Status</th>
                      <th>Updated</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (thread of threads(); track thread.id) {
                      <tr [class.deleted-row]="!!thread.deletedAt">
                        <td>
                          <strong>
                            @if (thread.deletedAt) {
                              {{ thread.title }}
                            } @else {
                              <a [routerLink]="['/forum/threads', thread.slug]">{{
                                thread.title
                              }}</a>
                            }
                          </strong>
                          <small>{{ thread.categorySlug }}</small>
                        </td>
                        <td>
                          {{ thread.user.name }}<small>{{ thread.user.role }}</small>
                        </td>
                        <td>{{ thread.replyCount }}</td>
                        <td>
                          <span class="status" [class]="'status ' + statusClass(thread)">{{
                            statusLabel(thread)
                          }}</span>
                        </td>
                        <td>{{ date(thread.updatedAt) }}</td>
                        <td>
                          <div class="admin-actions">
                            <button
                              type="button"
                              class="btn btn-sm btn-outline-cfPrimary"
                              [class.active]="selectedId() === thread.id"
                              (click)="selectedId.set(thread.id)"
                            >
                              Comments
                            </button>
                            @if (thread.deletedAt) {
                              <button
                                type="button"
                                class="btn btn-sm btn-outline-cfPrimary"
                                [disabled]="isPending(thread.id)"
                                (click)="update(thread, { isDeleted: false })"
                              >
                                Restore
                              </button>
                            } @else {
                              <button
                                type="button"
                                class="btn btn-sm btn-outline-cfPrimary"
                                [disabled]="isPending(thread.id)"
                                (click)="update(thread, { isPublished: !thread.isPublished })"
                              >
                                {{ thread.isPublished ? 'Unpublish' : 'Publish' }}
                              </button>
                              <button
                                type="button"
                                class="btn btn-sm btn-outline-danger"
                                [disabled]="isPending(thread.id)"
                                (click)="update(thread, { isDeleted: true })"
                              >
                                Soft delete
                              </button>
                            }
                          </div>
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="6">No threads yet.</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }
      }
    </section>
  `,
})
export class AdminThreadsComponent {
  private readonly forum = inject(ForumService);

  protected readonly threads = signal<ForumThread[]>([]);
  /** The single source of truth for comment status; the comment table only renders from it. */
  private readonly comments = signal<ForumAdminComment[]>([]);
  protected readonly selectedId = signal<string | null>(null);
  /** Threads with a moderation request in flight (each stays disabled until its own finishes). */
  private readonly pendingIds = signal<ReadonlySet<string>>(new Set());
  protected readonly error = signal('');

  protected readonly status = signal<'loading' | 'error' | 'ready'>('loading');
  protected readonly loadError = signal('');
  // Comments load separately, so a comment failure never blocks thread moderation.
  protected readonly commentsStatus = signal<'loading' | 'error' | 'ready'>('loading');
  protected readonly commentsError = signal('');

  protected readonly selectedThread = computed(
    () => this.threads().find((t) => t.id === this.selectedId()) ?? null,
  );
  protected readonly selectedComments = computed(() => {
    const id = this.selectedId();
    return id ? this.comments().filter((c) => c.threadId === id) : [];
  });

  constructor() {
    this.forum.getAdminThreads().subscribe({
      next: (threads) => {
        this.threads.set(threads);
        this.status.set('ready');
      },
      error: (err: unknown) => {
        this.loadError.set(toFormError(err, 'Could not load threads.').message);
        this.status.set('error');
      },
    });
    this.loadComments();
  }

  protected loadComments(): void {
    this.commentsStatus.set('loading');
    this.forum.getAdminComments().subscribe({
      next: (comments) => {
        this.comments.set(comments);
        this.commentsStatus.set('ready');
      },
      error: (err: unknown) => {
        this.commentsError.set(toFormError(err, 'Could not load comments.').message);
        this.commentsStatus.set('error');
      },
    });
  }

  /** Applies a successful soft-delete / restore to the page's own comment list. */
  protected onCommentsModerated(threadId: string, change: CommentModeration): void {
    const affected = new Set(change.ids);
    const deletedAt = change.isDeleted ? new Date().toISOString() : null;
    this.comments.update((items) =>
      items.map((item) =>
        affected.has(item.id)
          ? { ...item, deletedAt, deletedBy: change.isDeleted ? 'admin' : null }
          : item,
      ),
    );
    this.adjustReplies(threadId, change.isDeleted ? -change.changedCount : change.changedCount);
  }

  protected isPending(threadId: string): boolean {
    return this.pendingIds().has(threadId);
  }

  protected date(value: string): string {
    return formatDate(value);
  }

  protected statusLabel(thread: ForumThread): string {
    return thread.deletedAt ? 'Deleted' : thread.isPublished ? 'Published' : 'Unpublished';
  }

  protected statusClass(thread: ForumThread): string {
    return thread.deletedAt ? 'deleted' : thread.isPublished ? 'published' : 'draft';
  }

  protected adjustReplies(threadId: string, delta: number): void {
    this.threads.update((items) =>
      items.map((t) =>
        t.id === threadId ? { ...t, replyCount: Math.max(0, t.replyCount + delta) } : t,
      ),
    );
  }

  protected update(thread: ForumThread, changes: ModerateThreadPayload): void {
    if (this.isPending(thread.id)) return;
    this.error.set('');
    this.setPending(thread.id, true);
    this.forum.moderateThread(thread.id, changes).subscribe({
      next: (updated) => {
        this.threads.update((items) => items.map((t) => (t.id === thread.id ? updated : t)));
        this.setPending(thread.id, false);
      },
      error: (err: unknown) => {
        this.error.set(toFormError(err, 'Moderation failed.').message);
        this.setPending(thread.id, false);
      },
    });
  }

  private setPending(threadId: string, value: boolean): void {
    this.pendingIds.update((ids) => {
      const next = new Set(ids);
      if (value) next.add(threadId);
      else next.delete(threadId);
      return next;
    });
  }
}
