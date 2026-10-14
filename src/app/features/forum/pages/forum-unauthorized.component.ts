import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ForumStatusComponent } from './forum-status.component';

@Component({
  selector: 'app-forum-unauthorized',
  standalone: true,
  imports: [ForumStatusComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-forum-status
      eyebrow="403"
      heading="Access not granted"
      message="Your account does not have permission to view this page."
    />
  `,
})
export class ForumUnauthorizedComponent {}
