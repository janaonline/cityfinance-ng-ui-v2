import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { toFormError } from '../forum-errors';
import { FORUM_REPORT_REASONS } from '../forum.constants';
import { ForumReportReason, ForumReportTarget } from '../forum.models';
import { ForumService } from '../forum.service';

let nextId = 0;

/** "Report" action for a thread or reply: pick a reason, send it to the forum administrators. */
@Component({
  selector: 'app-forum-report-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (reported()) {
      <span class="report-done" role="status">Reported</span>
    } @else if (!open()) {
      <button class="text-action" type="button" (click)="open.set(true)">Report</button>
    } @else {
      <form class="report-form" (submit)="send($event)">
        <fieldset>
          <legend>
            Why are you reporting this {{ target() === 'thread' ? 'thread' : 'reply' }}?
          </legend>
          @for (r of reasons; track r.value) {
            <label>
              <input
                type="radio"
                [name]="groupName"
                [value]="r.value"
                [checked]="reason() === r.value"
                (change)="reason.set(r.value)"
              />
              {{ r.label }}
            </label>
          }
        </fieldset>
        @if (error()) {
          <p class="field-error" role="alert">{{ error() }}</p>
        }
        <div class="report-form-actions">
          <button
            class="btn btn-sm btn-cfPrimary"
            type="submit"
            [disabled]="!reason() || sending()"
          >
            {{ sending() ? 'Sending…' : 'Send report' }}
          </button>
          <button class="btn btn-sm btn-outline-cfPrimary" type="button" (click)="cancel()">
            Cancel
          </button>
        </div>
      </form>
    }
  `,
})
export class ReportButtonComponent {
  private readonly forum = inject(ForumService);

  readonly target = input.required<ForumReportTarget>();
  readonly targetId = input.required<string>();

  protected readonly reasons = FORUM_REPORT_REASONS;
  protected readonly groupName = `forum-report-reason-${nextId++}`;
  protected readonly open = signal(false);
  protected readonly reason = signal<ForumReportReason | null>(null);
  protected readonly sending = signal(false);
  protected readonly reported = signal(false);
  protected readonly error = signal<string | null>(null);

  protected send(event: Event): void {
    event.preventDefault();
    const reason = this.reason();
    if (!reason || this.sending()) return;
    this.sending.set(true);
    this.error.set(null);
    this.forum.reportPost(this.target(), this.targetId(), reason).subscribe({
      next: () => {
        this.sending.set(false);
        this.reported.set(true);
      },
      error: (err: unknown) => {
        this.sending.set(false);
        // 409 = already reported (e.g. from another tab): treat it as done rather than an error.
        if (err instanceof HttpErrorResponse && err.status === 409) {
          this.reported.set(true);
          return;
        }
        this.error.set(toFormError(err, 'Could not send the report.').message);
      },
    });
  }

  protected cancel(): void {
    this.open.set(false);
    this.reason.set(null);
    this.error.set(null);
  }
}
