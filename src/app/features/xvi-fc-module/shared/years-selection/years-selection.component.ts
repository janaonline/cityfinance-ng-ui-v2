import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Subscription, fromEvent } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { environment } from '../../../../../environments/environment';
import { buildXvifcFeatureLink, Roles } from '../../xvi-fc-side-menu.config';

type ProfileRole = 'state' | 'ulb' | 'mohua';

interface YearItem {
  _id: string;
  year: string;
}

interface DocumentYearEntry {
  _id: string;
  year: string;
}

export interface XvifcDocumentYears {
  audited: DocumentYearEntry;
  provisional: DocumentYearEntry;
}

interface StoredUser {
  role?: string;
  ulb?: string;
  state?: string;
  isXVIFCProfileVerified?: boolean;
}

/**
 * Financial year records for the document references in the 16th FC annual account.
 * These are the FY-level years (not the grant year) used as yearId in uploaded documents.
 * Hardcoded because they don't change — 2024-25 is always the audited year and
 * 2025-26 is always the provisional year for this grant cycle.
 */
const DOCUMENT_YEARS: XvifcDocumentYears = {
  audited: { _id: '606aafcf4dff55e6c075d424', year: '2024-25' },
  provisional: { _id: '606aafda4dff55e6c075d48f', year: '2025-26' },
};

export const XVIFC_LS_KEYS = {
  selectedYearId: 'xvifc_selectedYearId',
  selectedYearString: 'xvifc_selectedYearString',
  documentYears: 'xvifc_document_years',
} as const;

function resolveProfileRole(userRole: string): ProfileRole {
  const r = userRole.toUpperCase();
  if (r === 'STATE' || r === 'XVIFC_STATE' || r.startsWith('STATE-')) return 'state';
  if (r === 'ULB' || r === 'XVIFC' || r.startsWith('ULB-')) return 'ulb';
  if (r === 'MOHUA') return 'mohua';
  return 'state';
}

function resolveRouteRole(userRole: string): Roles {
  const r = userRole.toUpperCase();
  if (r === 'STATE' || r === 'XVIFC_STATE' || r.startsWith('STATE-')) return 'STATE';
  if (r === 'ULB' || r === 'XVIFC' || r.startsWith('ULB-')) return 'ULB';
  if (r === 'MOHUA') return 'MOHUA';
  return 'STATE';
}

@Component({
  selector: 'app-years-selection',
  standalone: true,
  imports: [CommonModule, MatRadioModule, MatButtonModule, MatCardModule],
  templateUrl: './years-selection.component.html',
  styleUrl: './years-selection.component.scss',
})
export class YearsSelectionComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private popstateSub?: Subscription;

  private yearItems: YearItem[] = [];

  readonly isLoading = signal(true);
  readonly activeYear = signal<string>('');
  readonly upcomingYears = signal<string[]>([]);

  selectedYear = signal<string>('');

  ngOnDestroy(): void {
    this.popstateSub?.unsubscribe();
  }

  ngOnInit(): void {
    // Block back navigation — years selection is the entry point; only logout exits
    history.pushState(null, '', window.location.href);
    this.popstateSub = fromEvent<PopStateEvent>(window, 'popstate').subscribe(() => {
      history.pushState(null, '', window.location.href);
    });

    this.http.get<any>(`${environment.api.url2}xvi-fc/years`).subscribe({
      next: (response) => {
        const items: YearItem[] = Array.isArray(response)
          ? response
          : (response?.data ?? []);
        if (items.length > 0) {
          this.yearItems = items;
          const [first, ...rest] = items;
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
    const routeRole = this.getRouteRole();

    const standaloneKey = localStorage.getItem('isXVIFCProfileVerified');
    const userDataRaw = localStorage.getItem('userData');
    let userDataVerified = false;
    try {
      userDataVerified = userDataRaw
        ? (JSON.parse(userDataRaw) as StoredUser)?.isXVIFCProfileVerified === true
        : false;
    } catch {
      /* ignore */
    }

    const isVerified = standaloneKey === 'true' || userDataVerified;

    // Persist year context so child components can read it without walking the route tree
    localStorage.setItem(XVIFC_LS_KEYS.selectedYearString, `FY-${yearString}`);
    localStorage.setItem(XVIFC_LS_KEYS.selectedYearId, yearId);
    localStorage.setItem(XVIFC_LS_KEYS.documentYears, JSON.stringify(DOCUMENT_YEARS));

    if (isVerified) {
      this.router.navigate(buildXvifcFeatureLink(routeRole, entityId, yearId, 'overview'), {
        replaceUrl: true,
      });
      return;
    }

    this.router.navigate(['/xvifc', 'profile-verify'], {
      queryParams: { year: yearId },
      replaceUrl: true,
    });
  }

  private getEntityId(): string {
    try {
      const raw = localStorage.getItem('userData');
      if (!raw) return '';
      const user = JSON.parse(raw) as StoredUser;
      const profileRole = resolveProfileRole(user.role ?? '');
      if (profileRole === 'ulb') return user.ulb ?? '';
      if (profileRole === 'state') return user.state ?? '';
      return user.state ?? user.ulb ?? '';
    } catch {
      return '';
    }
  }

  private getRouteRole(): Roles {
    try {
      const raw = localStorage.getItem('userData');
      if (!raw) return 'STATE';
      const user = JSON.parse(raw) as StoredUser;
      return resolveRouteRole(user.role ?? '');
    } catch {
      return 'STATE';
    }
  }
}
