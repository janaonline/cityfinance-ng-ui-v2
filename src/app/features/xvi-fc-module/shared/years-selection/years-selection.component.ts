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

    const standaloneKey = localStorage.getItem('isXVIFCProfileVerified');
    const userDataRaw = localStorage.getItem('userData');
    let userDataVerified = false;
    try {
      userDataVerified = userDataRaw ? JSON.parse(userDataRaw)?.isXVIFCProfileVerified === true : false;
    } catch { /* ignore */ }

    // console.log('[YearsSelection] isXVIFCProfileVerified key:', standaloneKey);
    // console.log('[YearsSelection] userData.isXVIFCProfileVerified:', userDataVerified);
    // console.log('[YearsSelection] userData raw:', userDataRaw);

    const isVerified = standaloneKey === 'true' || userDataVerified;

    if (isVerified) {
      const role = this.getRoleFromLocalStorage();
      // console.log('[YearsSelection] Verified — navigating to overview with role:', role, 'year:', year);
      this.router.navigate(['/xvifc', role, year, 'overview'], { replaceUrl: true });
      return;
    }

    // console.log('[YearsSelection] Not verified — redirecting to profile-verify');
    this.router.navigate(['/xvifc', 'profile-verify'], { queryParams: { year }, replaceUrl: true });
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
