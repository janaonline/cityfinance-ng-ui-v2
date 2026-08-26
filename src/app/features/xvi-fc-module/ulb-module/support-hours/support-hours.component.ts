import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { SupportHoursCardComponent } from '../../shared/support-hours/support-hours-card.component';
import { PageErrorStateComponent } from '../../shared/page-error-state/page-error-state.component';
import { SupportHoursService } from '../../shared/support-hours/support-hours.service';
import { NextSupportHour, UpcomingSupportHour } from '../../shared/support-hours/support-hours.models';

@Component({
  selector: 'app-support-hours',
  standalone: true,
  imports: [SupportHoursCardComponent, PageErrorStateComponent],
  templateUrl: './support-hours.component.html',
  styleUrl: './support-hours.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportHoursComponent implements OnInit {
  private readonly supportHoursService = inject(SupportHoursService);

  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly nextSupportHour = signal<NextSupportHour | null>(null);
  readonly upcomingSupportHours = signal<UpcomingSupportHour[]>([]);

  ngOnInit(): void {
    this.loadSupportHours();
  }

  loadSupportHours(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.supportHoursService.getSupportHours().subscribe({
      next: (data) => {
        this.nextSupportHour.set(data.nextSupportHour);
        this.upcomingSupportHours.set(data.upcomingSupportHours);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load support hours', err);
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }
}
