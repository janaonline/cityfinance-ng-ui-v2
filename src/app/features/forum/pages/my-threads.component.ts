import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ThreadListComponent } from '../components/thread-list.component';
import { toLoadable } from '../forum-loadable';
import { ForumService } from '../forum.service';

@Component({
  selector: 'app-forum-my-threads',
  standalone: true,
  imports: [RouterLink, ThreadListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page-intro my-threads-intro">
      <div>
        <p class="eyebrow">Your contributions</p>
        <h1>My threads</h1>
        <p>Discussions you started, sorted by the latest activity.</p>
      </div>
      <a
        class="btn btn-cfPrimary fw-bold d-inline-flex align-items-center gap-2"
        routerLink="/forum/threads/new"
        ><i class="bi bi-plus-lg" aria-hidden="true"></i>Start a discussion</a
      >
    </section>
    @if (vm(); as v) {
      @switch (v.status) {
        @case ('loading') {
          <div class="loading" role="status">
            <span></span>
            <p>Loading discussions…</p>
          </div>
        }
        @case ('error') {
          <div class="empty-state error-state">
            <h2>Could not load discussions</h2>
            <p>{{ v.message }}</p>
          </div>
        }
        @case ('ready') {
          <app-forum-thread-list [threads]="v.data" />
        }
      }
    }
  `,
})
export class MyThreadsComponent {
  protected readonly vm = toSignal(toLoadable(inject(ForumService).getMyThreads()));
}
