import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatDate } from '../../forum-date';
import { toFormError } from '../../forum-errors';
import { formatRole } from '../../forum-role';
import { reportReasonLabel } from '../../forum.constants';
import { ForumAdminReport } from '../../forum.models';
import { ForumService } from '../../forum.service';

/** Open reports of threads and replies (TS-1305). Hide the post or dismiss the report. */
@Component({
  selector: 'app-forum-admin-reports',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="admin-section" aria-labelledby="report-heading">
      <div class="admin-section-heading">
        <div>
          <h2 id="report-heading">Reports</h2>
          <p>
            Hide a reported post so only administrators can see it, or dismiss the report to keep
            the post. Hidden posts can be restored from Threads.
          </p>
        </div>
        <span>{{ reports().length }} open</span>
      </div>

      @switch (status()) {
        @case ('loading') {
          <div class="loading" role="status">
            <span></span>
            <p>Loading reports…</p>
          </div>
        }
        @case ('error') {
          <p class="form-alert" role="alert">{{ loadError() }}</p>
        }
        @case ('ready') {
          <div class="admin-panel">
            @if (error()) {
              <p class="form-alert" role="alert">{{ error() }}</p>
            }
            <div class="admin-table-wrap">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Post</th>
                    <th>Author</th>
                    <th>Reason</th>
                    <th>Reported by</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (report of reports(); track report.id) {
                    <tr>
                      <td>
                        <strong>
                          @if (report.threadSlug && !report.isHidden) {
                            <a [routerLink]="['/forum/threads', report.threadSlug]">{{
                              report.threadTitle
                            }}</a>
                          } @else {
                            {{ report.threadTitle }}
                          }
                        </strong>
                        <small
                          >{{ report.targetType === 'thread' ? 'Thread' : 'Reply' }}
                          @if (report.isHidden) {
                            · already hidden
                          }
                          · {{ report.excerpt }}</small
                        >
                      </td>
                      <td>
                        @if (report.author; as author) {
                          {{ author.name }}<small>{{ role(author.role) }}</small>
                        }
                      </td>
                      <td>{{ reason(report) }}</td>
                      <td>
                        {{ report.reporter.name }}<small>{{ role(report.reporter.role) }}</small>
                      </td>
                      <td>{{ date(report.createdAt) }}</td>
                      <td>
                        <div class="admin-actions">
                          @if (!report.isHidden) {
                            <button
                              type="button"
                              class="btn btn-sm btn-outline-danger"
                              [disabled]="pending() === report.id"
                              (click)="resolve(report, 'hide')"
                            >
                              Hide post
                            </button>
                          }
                          <button
                            type="button"
                            class="btn btn-sm btn-outline-cfPrimary"
                            [disabled]="pending() === report.id"
                            (click)="resolve(report, 'dismiss')"
                          >
                            Dismiss
                          </button>
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="6">No open reports.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      }
    </section>
  `,
})
export class AdminReportsComponent {
  private readonly forum = inject(ForumService);

  protected readonly reports = signal<ForumAdminReport[]>([]);
  protected readonly pending = signal<string | null>(null);
  protected readonly error = signal('');
  protected readonly status = signal<'loading' | 'error' | 'ready'>('loading');
  protected readonly loadError = signal('');

  constructor() {
    this.forum.getAdminReports().subscribe({
      next: (reports) => {
        this.reports.set(reports);
        this.status.set('ready');
      },
      error: (err: unknown) => {
        this.loadError.set(toFormError(err, 'Could not load reports.').message);
        this.status.set('error');
      },
    });
  }

  protected date(value: string): string {
    return formatDate(value);
  }

  protected role(value: string): string {
    return formatRole(value);
  }

  protected reason(report: ForumAdminReport): string {
    return reportReasonLabel(report.reason);
  }

  protected resolve(report: ForumAdminReport, action: 'hide' | 'dismiss'): void {
    if (
      action === 'hide' &&
      !window.confirm(
        `Hide this ${report.targetType === 'thread' ? 'thread' : 'reply'}? Only administrators will see it. You can restore it from Threads.`,
      )
    ) {
      return;
    }
    this.error.set('');
    this.pending.set(report.id);
    this.forum.resolveReport(report.id, action).subscribe({
      next: () => {
        // Hiding resolves every open report on that post; dismissing resolves only this one.
        this.reports.update((items) =>
          items.filter((r) =>
            action === 'hide'
              ? !(r.targetType === report.targetType && r.targetId === report.targetId)
              : r.id !== report.id,
          ),
        );
        this.pending.set(null);
      },
      error: (err: unknown) => {
        this.error.set(toFormError(err, 'Could not update the report.').message);
        this.pending.set(null);
      },
    });
  }
}
