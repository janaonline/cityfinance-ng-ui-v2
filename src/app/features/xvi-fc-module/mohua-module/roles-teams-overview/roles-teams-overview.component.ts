import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { environment } from '../../../../../environments/environment';
import { ProfileVerificationService } from '../../shared/profile-verification/profile-verification.service';
import { PageErrorStateComponent } from '../../shared/page-error-state/page-error-state.component';

interface MohuaMember {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
  designation: string;
  isActive: boolean;
  lastActive: string | null;
}

interface TableColumn {
  key: string;
  header: string;
  thClass: string;
  tdClass: string;
}

@Component({
  selector: 'app-mohua-roles-teams-overview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCardModule,
    MatTableModule,
    MatTooltipModule,
    PageErrorStateComponent,
  ],
  templateUrl: './roles-teams-overview.component.html',
  styleUrl: './roles-teams-overview.component.scss',
})
export class MohuaRolesTeamsOverviewComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly profileService = inject(ProfileVerificationService);
  private readonly baseUrl = environment.api.url2;

  readonly tableColumns: TableColumn[] = [
    { key: 'member',      header: 'Name, Phone & Email', thClass: '',                        tdClass: '',                        },
    { key: 'designation', header: 'Designation',          thClass: 'd-none d-md-table-cell',  tdClass: 'd-none d-md-table-cell',  },
    { key: 'status',      header: 'Status',               thClass: 'd-none d-lg-table-cell',  tdClass: 'd-none d-lg-table-cell',  },
    { key: 'lastActive',  header: 'Last Active',          thClass: 'd-none d-xl-table-cell',  tdClass: 'd-none d-xl-table-cell',  },
  ];

  readonly displayedColumns = this.tableColumns.map(c => c.key);

  private currentUserId = '';

  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly members = signal<MohuaMember[]>([]);

  ngOnInit(): void {
    const u = this.profileService.readStoredUser();
    this.currentUserId = u._id ?? u.id ?? '';
    this.loadMembers();
  }

  loadMembers(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.http
      .get<{ success: boolean; data: MohuaMember[] } | MohuaMember[]>(
        `${this.baseUrl}users/mohua-members`,
      )
      .pipe(
        map((r): MohuaMember[] =>
          'success' in r && Array.isArray((r as { data: unknown }).data)
            ? (r as { success: boolean; data: MohuaMember[] }).data
            : (r as MohuaMember[]),
        ),
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (members) => {
          if (!members) { this.hasError.set(true); } else { this.members.set(members); }
          this.isLoading.set(false);
        },
        error: () => {
          this.hasError.set(true);
          this.isLoading.set(false);
        },
      });
  }

  isCurrentUser(member: MohuaMember): boolean {
    return member._id === this.currentUserId;
  }

  getInitials(name: string): string {
    return name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
      .map(w => w[0]?.toUpperCase() ?? '').join('');
  }

  formatLastActive(date: string | null): string {
    if (!date) return '—';
    try {
      return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        .format(new Date(date));
    } catch { return '—'; }
  }

  trackByMemberId(_: number, m: MohuaMember): string { return m._id; }
}
