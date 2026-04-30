import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { environment } from '../../../../../environments/environment';

type ProfileRole = 'state' | 'ulb' | 'mohua';

interface YearItem {
  _id: string;
  year: string;
}

interface YearsApiResponse {
  success: boolean;
  data: YearItem[];
  timestamp: string;
}

interface StoredUser {
  role?: string;
  ulb?: string;
  state?: string;
  isXVIFCProfileVerified?: boolean;
}

const ROLE_MAP: Record<string, ProfileRole> = {
  STATE: 'state',
  XVIFC_STATE: 'state',
  ULB: 'ulb',
  XVIFC: 'ulb',
  MoHUA: 'mohua',
};

@Component({
  selector: 'app-years-selection',
  standalone: true,
  imports: [CommonModule, MatRadioModule, MatButtonModule, MatCardModule],
  templateUrl: './years-selection.component.html',
  styleUrl: './years-selection.component.scss',
})
export class YearsSelectionComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  private yearItems: YearItem[] = [];

  readonly isLoading = signal(true);
  readonly activeYear = signal<string>('');
  readonly upcomingYears = signal<string[]>([]);

  selectedYear = signal<string>('');

  ngOnInit(): void {
    this.http.get<YearsApiResponse>(`${environment.api.url2}xvi-fc/years`).subscribe({
      next: (response) => {
        if (response.success && response.data.length > 0) {
          this.yearItems = response.data;
          const [first, ...rest] = response.data;
          this.activeYear.set(first.year);
          this.upcomingYears.set(rest.map((y) => y.year));
          this.selectedYear.set(first.year);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  selectYear(year: string): void {
    this.selectedYear.set(year);
  }

  continue() {
    const yearString = this.selectedYear();
    if (!yearString) return;

    const yearItem = this.yearItems.find((y) => y.year === yearString);
    const yearId = yearItem?._id ?? yearString;
    const entityId = this.getEntityId();

    const standaloneKey = localStorage.getItem('isXVIFCProfileVerified');
    const userDataRaw = localStorage.getItem('userData');
    let userDataVerified = false;
    try {
      userDataVerified = userDataRaw
        ? (JSON.parse(userDataRaw) as StoredUser)?.isXVIFCProfileVerified === true
        : false;
    } catch { /* ignore */ }

    const isVerified = standaloneKey === 'true' || userDataVerified;

    localStorage.setItem('xvifc_selectedYearString', `FY-${yearString}`);

    if (isVerified) {
      this.router.navigate(['/xvifc', entityId, yearId, 'overview'], { replaceUrl: true });
      return;
    }

    this.router.navigate(['/xvifc', 'profile-verify'], {
      queryParams: { year: yearId, entityId },
      replaceUrl: true,
    });
  }

  private getEntityId(): string {
    try {
      const raw = localStorage.getItem('userData');
      if (!raw) return '';
      const user = JSON.parse(raw) as StoredUser;
      const role = ROLE_MAP[user.role ?? ''] ?? 'state';
      if (role === 'ulb') return user.ulb ?? '';
      if (role === 'state') return user.state ?? '';
      return user.state ?? user.ulb ?? '';
    } catch {
      return '';
    }
  }
}
