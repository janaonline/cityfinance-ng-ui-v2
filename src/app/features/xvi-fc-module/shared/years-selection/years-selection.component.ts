import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

type ProfileRole = 'state' | 'ulb' | 'mohua';

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
export class YearsSelectionComponent {
  private readonly router = inject(Router);

  years: string[] = ['2026-27', '2027-28', '2028-29', '2029-30', '2030-31'];

  selectedYear = signal<string | null>(null);

  selectYear(year: string): void {
    this.selectedYear.set(year);
  }

  continue() {
    const year = this.selectedYear();
    if (!year) return;

    const isVerified = localStorage.getItem('isXVIFCProfileVerified') === 'true';

    if (isVerified) {
      const role = this.getRoleFromLocalStorage();
      this.router.navigate(['/xvifc', role, year, 'overview']);
      return;
    }

    this.router.navigate(['/xvifc', 'profile-verify'], { queryParams: { year } });
  }

  private getRoleFromLocalStorage(): ProfileRole {
    try {
      const raw = localStorage.getItem('userData');
      if (!raw) return 'state';
      const user = JSON.parse(raw) as { role: string };
      return ROLE_MAP[user.role] ?? 'state';
    } catch {
      return 'state';
    }
  }
}
