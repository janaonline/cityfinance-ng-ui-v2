import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ForumStatusComponent } from './forum-status.component';

@Component({
  selector: 'app-forum-not-found',
  standalone: true,
  imports: [ForumStatusComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-forum-status
      eyebrow="404"
      heading="That conversation wandered off"
      message="The page may have moved or never existed."
    />
  `,
})
export class ForumNotFoundComponent {}
