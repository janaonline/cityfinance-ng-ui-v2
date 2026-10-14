import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, catchError, map, of, switchMap } from 'rxjs';
import { CommentFormComponent } from '../components/comment-form.component';
import { CommentListComponent } from '../components/comment-list.component';
import { ReactionButtonComponent } from '../components/reaction-button.component';
import { ThreadActionsComponent } from '../components/thread-actions.component';
import { formatDate } from '../forum-date';
import { toFormError } from '../forum-errors';
import { Loadable } from '../forum-loadable';
import { canComment, canDeleteThread, canEditThread } from '../forum-permissions';
import { injectForumViewer } from '../forum-viewer';
import { ForumThreadDetail } from '../forum.models';
import { ForumService } from '../forum.service';
import { MarkdownComponent } from '../markdown/markdown.component';
import { ForumStatusComponent } from './forum-status.component';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-forum-thread-detail',
  standalone: true,
  imports: [
    RouterLink,
    MarkdownComponent,
    ReactionButtonComponent,
    ThreadActionsComponent,
    CommentListComponent,
    CommentFormComponent,
    ForumStatusComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (state(); as s) {
      @switch (s.status) {
        @case ('loading') {
          <div class="loading" role="status">
            <span></span>
            <p>Gathering discussions…</p>
          </div>
        }
        @case ('error') {
          @if (s.notFound) {
            <app-forum-status
              eyebrow="404"
              heading="That conversation wandered off"
              message="The page may have moved or never existed."
            />
          } @else {
            <app-forum-status heading="We hit a snag" [message]="s.message" />
          }
        }
        @case ('ready') {
          @let thread = s.data.thread;
          <div class="thread-page">
            <a class="back-link" routerLink="/forum">Back to discussions</a>
            <h1 class="thread-page-title">{{ thread.title }}</h1>
            <article class="thread-detail">
              <div class="author-line">
                <div class="avatar">{{ thread.user.name.charAt(0).toUpperCase() }}</div>
                <div>
                  <strong>{{ thread.user.name }}</strong>
                  <p class="meta">
                    <span class="role-badge">{{ thread.user.role }}</span> · Posted
                    {{ date(thread.createdAt) }} · {{ thread.viewCount }} views
                  </p>
                </div>
              </div>
              <div class="prose"><app-forum-markdown [source]="thread.body" /></div>
              <div class="thread-reactions">
                <app-forum-reaction-button
                  target="thread-like"
                  [targetId]="thread.id"
                  [initialCount]="thread.likeCount"
                  [initialActive]="!!thread.liked"
                />
                <app-forum-reaction-button
                  target="thread-bookmark"
                  [targetId]="thread.id"
                  [initialCount]="thread.bookmarkCount"
                  [initialActive]="!!thread.bookmarked"
                />
              </div>
              @if (mayEdit(thread)) {
                <app-forum-thread-actions
                  [thread]="thread"
                  [canDelete]="mayDelete(thread)"
                  (saved)="reload()"
                />
              }
            </article>
            <section class="replies">
              <div class="section-heading">
                <h2>{{ thread.replyCount }} {{ thread.replyCount === 1 ? 'Reply' : 'Replies' }}</h2>
              </div>
              <app-forum-comment-list
                [comments]="s.data.comments"
                [threadId]="thread.id"
                [viewer]="viewer()"
                (changed)="reload()"
              />
            </section>
            <section class="reply-form">
              <p class="eyebrow">Join the conversation</p>
              <h2>Add your reply</h2>
              @if (mayComment()) {
                <app-forum-comment-form [threadId]="thread.id" (posted)="reload()" />
              } @else {
                <p class="auth-prompt">Sign in with an eligible account to reply.</p>
              }
            </section>
          </div>
        }
      }
    }
  `,
})
export class ThreadDetailComponent {
  private readonly forum = inject(ForumService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly viewer = injectForumViewer();
  protected readonly state = signal<Loadable<ForumThreadDetail>>({ status: 'loading' });

  private slug = '';
  /** Emits `true` for a silent reload (keeps the page visible) and `false` for a fresh load. */
  private readonly load$ = new Subject<boolean>();

  constructor() {
    this.load$
      .pipe(
        switchMap((silent) => {
          if (!silent) this.state.set({ status: 'loading' });
          return this.forum.getThread(this.slug).pipe(
            map((data): Loadable<ForumThreadDetail> => ({ status: 'ready', data })),
            catchError((err: unknown) =>
              of<Loadable<ForumThreadDetail>>({
                status: 'error',
                message: toFormError(err, 'The thread could not load. Please try again.').message,
                notFound: err instanceof HttpErrorResponse && err.status === 404,
              }),
            ),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((next) => this.state.set(next));

    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.slug = params.get('slug') ?? '';
      this.load$.next(false);
    });
  }

  protected reload(): void {
    this.load$.next(true);
  }

  protected date(value: string): string {
    return formatDate(value);
  }

  protected mayEdit(thread: { user: { userId: string } }): boolean {
    return canEditThread(this.viewer(), thread);
  }

  protected mayDelete(thread: { user: { userId: string } }): boolean {
    return canDeleteThread(this.viewer(), thread);
  }

  protected mayComment(): boolean {
    return canComment(this.viewer());
  }
}
