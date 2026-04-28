import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import {
  SupportHoursService,
  NextSupportHour,
  UpcomingSupportHour,
} from './support-hours.service';

@Component({
  selector: 'app-support-hours',
  standalone: true,
  imports: [CommonModule],
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
    this.loadSupportHours();
  }

  loadSupportHours(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

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

  normalizeStatus(status: string): string {
    return status.replace('UPCOMMING', 'UPCOMING');
  }

  getStatusClass(status: string): string {
    const normalized = this.normalizeStatus(status).toUpperCase();
    switch (normalized) {
      case 'UPCOMING':
        return 'status-pill status-pill--upcoming';
      case 'SCHEDULED':
        return 'status-pill status-pill--scheduled';
      case 'COMPLETED':
        return 'status-pill status-pill--completed';
      case 'CANCELLED':
        return 'status-pill status-pill--cancelled';
      default:
        return 'status-pill';
    }
  }

  trackByDate(_: number, item: UpcomingSupportHour): string {
    return item.date;
  }
}
