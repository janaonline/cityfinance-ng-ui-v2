import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NextSupportHour, UpcomingSupportHour } from './support-hours.models';

@Component({
  selector: 'app-support-hours-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './support-hours-card.component.html',
  styleUrl: './support-hours-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportHoursCardComponent {
  @Input() nextSupportHour: NextSupportHour | null = null;
  @Input() upcomingSupportHours: UpcomingSupportHour[] = [];
  @Input() isLoading = false;
  @Input() errorMessage = '';

  normalizeStatus(status: string): string {
    return status.replace('UPCOMMING', 'UPCOMING');
  }

  getStatusClass(status: string): string {
    const normalized = this.normalizeStatus(status).toUpperCase();
    switch (normalized) {
      case 'UPCOMING':  return 'status-pill status-pill--upcoming';
      case 'SCHEDULED': return 'status-pill status-pill--scheduled';
      case 'COMPLETED': return 'status-pill status-pill--completed';
      case 'CANCELLED': return 'status-pill status-pill--cancelled';
      default:          return 'status-pill';
    }
  }

  getDotClass(status: string): string {
    const normalized = this.normalizeStatus(status).toUpperCase();
    return normalized === 'UPCOMING' ? 'status-dot status-dot--blink' : 'status-dot';
  }

  trackByDate(_: number, item: UpcomingSupportHour): string {
    return item.date;
  }
}
