import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { toFormError } from '../forum-errors';
import { ForumService } from '../forum.service';
import { RichTextEditorComponent } from './rich-text-editor.component';

@Component({
  selector: 'app-forum-comment-form',
  standalone: true,
  imports: [RichTextEditorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="forum-form compact" (submit)="submit($event)">
      @if (message()) {
        <p class="form-alert" role="alert">{{ message() }}</p>
      }
      <div class="field">
        <span class="field-label">{{ parentId() ? 'Your reply' : 'Reply' }}</span>
        <app-forum-rich-text-editor
          [(value)]="body"
          [minLength]="2"
          [maxLength]="10000"
          [rows]="parentId() ? 3 : 5"
          placeholder="Write a thoughtful reply…"
          ariaLabel="Reply"
        />
      </div>
      @if (bodyError()) {
        <span class="field-error">{{ bodyError() }}</span>
      }
      <div class="form-actions">
        <button class="button" type="submit" [disabled]="pending()">
          {{ pending() ? 'Posting…' : 'Post reply' }}
        </button>
        @if (cancellable()) {
          <button class="text-action" type="button" (click)="cancelled.emit()">Cancel</button>
        }
      </div>
    </form>
  `,
})
export class CommentFormComponent {
  private readonly forum = inject(ForumService);

  readonly threadId = input.required<string>();
  readonly parentId = input<string | undefined>(undefined);
  readonly cancellable = input(false);
  readonly posted = output<void>();
  readonly cancelled = output<void>();

  protected readonly body = signal('');
  protected readonly pending = signal(false);
  protected readonly message = signal('');
  protected readonly bodyError = signal('');

  protected submit(event: Event): void {
    event.preventDefault();
    if (this.pending()) return;
    this.pending.set(true);
    this.message.set('');
    this.bodyError.set('');
    this.forum
      .addComment(this.threadId(), { body: this.body().trim(), parentId: this.parentId() })
      .subscribe({
        next: () => {
          this.pending.set(false);
          this.body.set('');
          this.posted.emit();
        },
        error: (err: unknown) => {
          const error = toFormError(err);
          this.bodyError.set(error.fields['body'] ?? '');
          this.message.set(error.message);
          this.pending.set(false);
        },
      });
  }
}
