import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { toFormError } from '../forum-errors';
import { ForumThread } from '../forum.models';
import { ForumService } from '../forum.service';
import { RichTextEditorComponent } from './rich-text-editor.component';

/** Edit / remove controls for a thread (shown to its author and ADMINs). */
@Component({
  selector: 'app-forum-thread-actions',
  standalone: true,
  imports: [RichTextEditorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="moderation-actions">
      <button type="button" (click)="toggleEdit()">
        {{ editing() ? 'Cancel edit' : 'Edit post' }}
      </button>
      @if (canDelete()) {
        <button type="button" (click)="remove()">Remove post</button>
      }
      @if (error()) {
        <p class="field-error">{{ error() }}</p>
      }
      @if (editing()) {
        <form class="forum-form compact edit-form" (submit)="save($event)">
          <label
            >Title
            <input
              name="title"
              [value]="title()"
              (input)="title.set($any($event.target).value)"
              minlength="5"
              maxlength="140"
              required
            />
          </label>
          @if (titleError()) {
            <span class="field-error">{{ titleError() }}</span>
          }
          <div class="field">
            <span class="field-label">Body</span>
            <app-forum-rich-text-editor
              [(value)]="body"
              [minLength]="20"
              [maxLength]="20000"
              [rows]="7"
              ariaLabel="Body"
            />
          </div>
          @if (bodyError()) {
            <span class="field-error">{{ bodyError() }}</span>
          }
          <button class="button" type="submit" [disabled]="pending()">
            {{ pending() ? 'Saving…' : 'Save changes' }}
          </button>
        </form>
      }
    </div>
  `,
})
export class ThreadActionsComponent {
  private readonly forum = inject(ForumService);
  private readonly router = inject(Router);

  readonly thread = input.required<ForumThread>();
  readonly canDelete = input(false);
  readonly saved = output<void>();

  protected readonly editing = signal(false);
  protected readonly pending = signal(false);
  protected readonly error = signal('');
  protected readonly titleError = signal('');
  protected readonly bodyError = signal('');
  protected readonly title = signal('');
  protected readonly body = signal('');

  protected toggleEdit(): void {
    if (!this.editing()) {
      this.title.set(this.thread().title);
      this.body.set(this.thread().body);
    }
    this.error.set('');
    this.editing.update((v) => !v);
  }

  protected save(event: Event): void {
    event.preventDefault();
    if (this.pending()) return;
    this.pending.set(true);
    this.error.set('');
    this.titleError.set('');
    this.bodyError.set('');
    this.forum
      .updateThread(this.thread().id, { title: this.title().trim(), body: this.body().trim() })
      .subscribe({
        next: (updated) => {
          this.pending.set(false);
          this.editing.set(false);
          if (updated.slug !== this.thread().slug) {
            void this.router.navigate(['/forum/threads', updated.slug]);
          } else {
            this.saved.emit();
          }
        },
        error: (err: unknown) => {
          const e = toFormError(err, 'Could not edit thread.');
          this.titleError.set(e.fields['title'] ?? '');
          this.bodyError.set(e.fields['body'] ?? '');
          this.error.set(e.message);
          this.pending.set(false);
        },
      });
  }

  protected remove(): void {
    if (
      !window.confirm('Remove this thread from the forum? An administrator can restore it later.')
    ) {
      return;
    }
    this.forum.deleteThread(this.thread().id).subscribe({
      next: () => void this.router.navigate(['/forum']),
      error: (err: unknown) => this.error.set(toFormError(err, 'Could not delete thread.').message),
    });
  }
}
