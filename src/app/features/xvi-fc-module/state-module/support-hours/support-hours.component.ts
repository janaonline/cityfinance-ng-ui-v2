import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { SupportHoursCardComponent } from '../../shared/support-hours/support-hours-card.component';
import { SupportHoursService } from '../../shared/support-hours/support-hours.service';
import { NextSupportHour, UpcomingSupportHour } from '../../shared/support-hours/support-hours.models';

@Component({
  selector: 'app-support-hours',
  standalone: true,
  imports: [SupportHoursCardComponent],
  templateUrl: './support-hours.component.html',
  styleUrl: './support-hours.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportHoursComponent implements OnInit {
  private readonly supportHoursService = inject(SupportHoursService);

  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly nextSupportHour = signal<NextSupportHour | null>(null);
  readonly upcomingSupportHours = signal<UpcomingSupportHour[]>([]);

  ngOnInit(): void {
    this.supportHoursService.getSupportHours().subscribe({
      next: (data) => {
        this.nextSupportHour.set(data.nextSupportHour);
        this.upcomingSupportHours.set(data.upcomingSupportHours);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load support hours', err);
        this.errorMessage.set('Failed to load support hours. Please try again later.');
        this.isLoading.set(false);
      },
    });
  }
}
