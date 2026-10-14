import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { RichTextEditorComponent } from '../components/rich-text-editor.component';
import { toFormError } from '../forum-errors';
import { toLoadable } from '../forum-loadable';
import { ForumService } from '../forum.service';

@Component({
  selector: 'app-forum-new-thread',
  standalone: true,
  imports: [RouterLink, RichTextEditorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="narrow composer-page">
      <a class="back-link" routerLink="/forum">Back to discussions</a>
      <section class="page-intro">
        <p class="eyebrow">Forum contribution</p>
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
            <option value="" disabled>Select a topic area</option>
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
        <button class="button" type="submit" [disabled]="pending()">
          {{ pending() ? 'Posting...' : 'Post discussion' }}
        </button>
      </form>
    </div>
  `,
})
export class NewThreadComponent {
  private readonly forum = inject(ForumService);
  private readonly router = inject(Router);

  protected readonly categories = toSignal(toLoadable(this.forum.getCategories()));
  protected readonly title = signal('');
  protected readonly categorySlug = signal('');
  protected readonly body = signal('');
  protected readonly pending = signal(false);
  protected readonly message = signal('');
  protected readonly errors = signal<Record<string, string>>({});

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
