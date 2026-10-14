import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Shared empty / error / not-found panel. */
@Component({
  selector: 'app-forum-status',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-state error-state">
      @if (eyebrow()) {
        <p class="eyebrow">{{ eyebrow() }}</p>
      }
      <h1>{{ heading() }}</h1>
      <p>{{ message() }}</p>
      <a class="button" routerLink="/forum">Return home</a>
    </div>
  `,
})
export class ForumStatusComponent {
  readonly eyebrow = input('');
  readonly heading = input.required<string>();
  readonly message = input('');
}
