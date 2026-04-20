import { Component, Optional, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-years-selection',
  standalone: true,
  imports: [CommonModule, MatRadioModule, MatButtonModule, MatCardModule],
  templateUrl: './years-selection.component.html',
  styleUrl: './years-selection.component.scss',
})
export class YearsSelectionComponent {
  private readonly router = inject(Router);

  constructor(
    @Optional() private readonly dialogRef: MatDialogRef<YearsSelectionComponent> | null,
  ) {}

  years: string[] = ['2026-27', '2027-28', '2028-29', '2029-30', '2030-31'];

  selectedYear = signal<string | null>(null);

  selectYear(year: string): void {
    this.selectedYear.set(year);
  }

  continue() {
    const year = this.selectedYear();
    if (!year) return;

    const routeMap = {
      state: 'state',
      ulb: 'ulb',
      mohua: 'mohua',
    };

    const role = routeMap['state']; // replace dynamically later

    this.router.navigate(['/xvifc', role, year, 'overview']);
  }
}
