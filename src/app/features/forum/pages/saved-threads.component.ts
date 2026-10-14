import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ThreadListComponent } from '../components/thread-list.component';
import { toLoadable } from '../forum-loadable';
import { ForumService } from '../forum.service';

@Component({
  selector: 'app-forum-saved-threads',
  standalone: true,
  imports: [ThreadListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page-intro">
      <p class="eyebrow">Your reading list</p>
      <h1>Saved discussions</h1>
      <p>Threads you bookmarked are kept here across devices.</p>
    </section>
    @if (vm(); as v) {
      @switch (v.status) {
        @case ('loading') {
          <div class="loading" role="status">
            <span></span>
            <p>Gathering discussions…</p>
          </div>
        }
        @case ('error') {
          <div class="empty-state error-state">
            <h2>We hit a snag</h2>
            <p>{{ v.message }}</p>
          </div>
        }
        @case ('ready') {
          <section class="section-heading">
            <h2>Saved</h2>
            <span>{{ v.data.length }} {{ v.data.length === 1 ? 'thread' : 'threads' }}</span>
          </section>
          <app-forum-thread-list [threads]="v.data" [bookmarkedOverride]="true" />
        }
      }
    }
  `,
})
export class SavedThreadsComponent {
  protected readonly vm = toSignal(toLoadable(inject(ForumService).getSavedThreads()));
}
