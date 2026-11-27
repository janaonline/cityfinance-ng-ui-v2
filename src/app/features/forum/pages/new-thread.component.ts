import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { BehaviorSubject, switchMap } from 'rxjs';
import { RichTextEditorComponent } from '../components/rich-text-editor.component';
import { toFormError } from '../forum-errors';
import { Loadable, toLoadable } from '../forum-loadable';
import { ForumCategory } from '../forum.models';
import { ForumService } from '../forum.service';

@Component({
  selector: 'app-forum-new-thread',
  standalone: true,
  imports: [RichTextEditorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="narrow composer-page">
      <section class="page-intro">
        <h1>Start a discussion</h1>
        <p>
          Share a question, clarification, or field experience that can help ULBs, State DMAs, and
          MoHUA teams move work forward.
        </p>
      </section>

      <form class="forum-form discussion-form" (submit)="submit($event)">
        @if (message()) {
          <p class="form-alert" role="alert">{{ message() }}</p>
        }
        <label
          >Discussion title
          <input
            name="title"
            [value]="title()"
            (input)="title.set($any($event.target).value)"
            minlength="5"
            maxlength="140"
            required
            placeholder="Summarise the question or topic"
          />
        </label>
        @if (errors()['title']) {
          <span class="field-error">{{ errors()['title'] }}</span>
        }
        <label
          >Topic area
          <select
            name="categorySlug"
            required
            [value]="categorySlug()"
            (change)="categorySlug.set($any($event.target).value)"
          >
            @switch (categories().status) {
              @case ('loading') {
                <option value="" disabled>Loading topic areas…</option>
              }
              @case ('error') {
                <option value="" disabled>Topic areas could not load</option>
              }
              @default {
                <option value="" disabled>Select a topic area</option>
              }
            }
            @if (categories(); as c) {
              @if (c.status === 'ready') {
                @for (category of c.data; track category.id) {
                  <option [value]="category.slug" [selected]="category.slug === categorySlug()">
                    {{ category.name }}
                  </option>
                }
              }
            }
          </select>
        </label>
        @if (categories(); as c) {
          @if (c.status === 'error') {
            <!-- Retry only reloads the list; the title and details typed so far are kept. -->
            <span class="field-error" role="alert">
              {{ c.message }}
              <button class="text-action" type="button" (click)="retryCategories()">Retry</button>
            </span>
          }
        }
        @if (errors()['categorySlug']) {
          <span class="field-error">{{ errors()['categorySlug'] }}</span>
        }
        <div class="field">
          <span class="field-label">Discussion details</span>
          <app-forum-rich-text-editor
            [(value)]="body"
            [minLength]="20"
            [maxLength]="20000"
            placeholder="Add background, relevant details, and the specific input you need from the forum."
            ariaLabel="Discussion details"
          />
        </div>
        @if (errors()['body']) {
          <span class="field-error">{{ errors()['body'] }}</span>
        }
        <button class="btn btn-cfPrimary fw-bold" type="submit" [disabled]="pending()">
          {{ pending() ? 'Posting...' : 'Post discussion' }}
        </button>
      </form>
    </div>
  `,
})
export class NewThreadComponent {
  private readonly forum = inject(ForumService);
  private readonly router = inject(Router);

  /** Emits `true` to force a fresh request (Retry), `false` for the first, cached load. */
  private readonly loadCategories$ = new BehaviorSubject(false);
  protected readonly categories = toSignal(
    this.loadCategories$.pipe(switchMap((force) => toLoadable(this.forum.getCategories(force)))),
    { initialValue: { status: 'loading' } as Loadable<ForumCategory[]> },
  );
  protected readonly title = signal('');
  protected readonly categorySlug = signal('');
  protected readonly body = signal('');
  protected readonly pending = signal(false);
  protected readonly message = signal('');
  protected readonly errors = signal<Record<string, string>>({});

  protected retryCategories(): void {
    this.loadCategories$.next(true);
  }

  protected submit(event: Event): void {
    event.preventDefault();
    if (this.pending()) return;
    this.pending.set(true);
    this.message.set('');
    this.errors.set({});
    this.forum
      .createThread({
        title: this.title().trim(),
        body: this.body().trim(),
        categorySlug: this.categorySlug(),
      })
      .subscribe({
        next: (thread) => {
          this.pending.set(false);
          void this.router.navigate(['/forum/threads', thread.slug]);
        },
        error: (err: unknown) => {
          const error = toFormError(err);
          this.errors.set(error.fields);
          this.message.set(error.message);
          this.pending.set(false);
        },
      });
  }
}
