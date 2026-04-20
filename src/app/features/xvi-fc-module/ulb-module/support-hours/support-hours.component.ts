import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

type SupportHourStatus = 'UPCOMING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

interface SupportHourItem {
  id: string;
  dateLabel: string;
  fullDateLabel: string;
  details: string;
  status: SupportHourStatus;
  time: string;
  host: string;
  joinUrl?: string;
}

@Component({
  selector: 'app-support-hours',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './support-hours.component.html',
  styleUrl: './support-hours.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportHoursComponent {
  readonly isLoading = signal(false);

  // Dummy API data for now
  readonly supportHours = signal<SupportHourItem[]>([
    {
      id: '1',
      dateLabel: '6 Mar 2026',
      fullDateLabel: 'Thursday, 6 Mar 2026',
      details:
        'Open Q&A session for ULB teams. Bring your questions about audited financial statements, submissions, or validation errors.',
      status: 'UPCOMING',
      time: '3:00 PM - 4:00 PM',
      host: 'CityFinance Product & PMU Team',
      joinUrl: '#',
    },
    {
      id: '2',
      dateLabel: '13 Mar 2026',
      fullDateLabel: 'Thursday, 13 Mar 2026',
      details: 'Open support hour',
      status: 'SCHEDULED',
      time: '3:00 PM - 4:00 PM',
      host: 'CityFinance Product & PMU Team',
    },
  ]);

  readonly nextSupportHour = computed(() => this.supportHours()[0] ?? null);

  trackById(_: number, item: SupportHourItem): string {
    return item.id;
  }

  getStatusClass(status: SupportHourStatus): string {
    switch (status) {
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

  simulateLoading(): void {
    this.isLoading.set(true);

    setTimeout(() => {
      this.isLoading.set(false);
    }, 2500);
  }
}
