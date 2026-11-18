import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MaterialModule } from '../../../../material.module';
import { IState } from '../../../../core/models/state/state';
import { StateService } from '../../../../core/services/state/state.service';
import { UtilityService } from '../../../../core/services/utility.service';
import { PreLoaderComponent } from '../../../../shared/components/pre-loader/pre-loader.component';
import { resolveThemeClass } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AdcAdminStatus, AdcService, IAdcManageQuery, IAdcRow } from '../../shared/adc/adc.service';
import { ADC_DEFAULT_PAGE_SIZE, ADC_PAGE_SIZE_OPTIONS } from '../../shared/adc/adc-paging.constants';
import { AdcActionsMenuComponent } from './adc-actions-menu/adc-actions-menu.component';
import { AdcFormDialogComponent, AdcFormDialogData } from './dialogs/adc-form-dialog/adc-form-dialog.component';
import { readPageParams } from './adc-url-params';

type ListSortBy = NonNullable<IAdcManageQuery['sortBy']>;

const SORT_COLUMNS: readonly ListSortBy[] = ['name', 'state', 'ulbCount', 'memberCount'];
const ADMIN_STATUSES: readonly AdcAdminStatus[] = ['ACTIVE', 'INVITED', 'NOT_SET'];
const OBJECT_ID = /^[a-f\d]{24}$/i;

/** Portal Admin's ADC page: list, add, and per-row View plus the actions menu. Filters, sort and page live in the URL. */
@Component({
  selector: 'app-adc-list',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MaterialModule,
    MatTableModule,
    MatSortModule,
    PreLoaderComponent,
    AdcActionsMenuComponent,
  ],
  templateUrl: './adc-list.component.html',
  styleUrl: './adc-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdcListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly adcService = inject(AdcService);
  private readonly stateService = inject(StateService);
  private readonly utilityService = inject(UtilityService);
  private readonly dialog = inject(MatDialog);
  // Resolved here, in the injection context, so the Add dialog opens with the XVI-FC theme.
  private readonly themeClass = resolveThemeClass();

  readonly displayedColumns = ['name', 'state', 'ulbCount', 'memberCount', 'admin', 'actions'];
  readonly pageSizeOptions = ADC_PAGE_SIZE_OPTIONS;
  readonly adminStatusOptions: { value: AdcAdminStatus; label: string }[] = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INVITED', label: 'Invited' },
    { value: 'NOT_SET', label: 'Not set' },
  ];

  readonly rows = signal<IAdcRow[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly pageSize = signal(ADC_DEFAULT_PAGE_SIZE);
  readonly sortBy = signal<ListSortBy>('name');
  readonly sortDir = signal<1 | -1>(1);
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly states = signal<IState[]>([]);

  readonly filterForm = this.fb.nonNullable.group({
    stateId: [''],
    search: [''],
    adminStatus: ['' as AdcAdminStatus | ''],
  });
  private readonly filterValues = signal(this.filterForm.getRawValue());
  readonly hasFilters = computed(() => {
    const { stateId, search, adminStatus } = this.filterValues();
    return !!(stateId || search.trim() || adminStatus);
  });
  readonly matSortDirection = computed(() => (this.sortDir() === 1 ? 'asc' : 'desc'));

  ngOnInit(): void {
    this.readUrl(this.route.snapshot.queryParamMap);
    this.loadRows();

    this.stateService
      .getStates()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (response) => this.states.set(response?.data ?? []), error: () => this.states.set([]) });

    this.filterForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.filterValues.set(this.filterForm.getRawValue()));
    this.filterForm.controls.search.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.applyFilters());
    for (const control of [this.filterForm.controls.stateId, this.filterForm.controls.adminStatus]) {
      control.valueChanges
        .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.applyFilters());
    }
  }

  loadRows(): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    this.writeUrl();
    const { stateId, search, adminStatus } = this.filterForm.getRawValue();

    this.adcService
      .manage({
        page: this.page(),
        limit: this.pageSize(),
        stateId: stateId || undefined,
        search: search.trim() || undefined,
        adminStatus: adminStatus || undefined,
        sortBy: this.sortBy(),
        sortDir: this.sortDir(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          // The last row of the last page was deleted, or the URL asked for a page past the end: step back.
          if (result.data.length === 0 && this.page() > 1) {
            this.page.set(Math.max(1, Math.ceil(result.total / this.pageSize())));
            if (result.total > 0) {
              this.loadRows();
              return;
            }
            this.writeUrl();
          }
          this.rows.set(result.data);
          this.total.set(result.total);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.loadError.set('Unable to load ADCs. Please try again.');
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.page.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadRows();
  }

  onSortChange(sort: Sort): void {
    const column = SORT_COLUMNS.includes(sort.active as ListSortBy) ? (sort.active as ListSortBy) : 'name';
    this.sortBy.set(column);
    this.sortDir.set(sort.direction === 'desc' ? -1 : 1);
    this.page.set(1);
    this.loadRows();
  }

  clearFilters(): void {
    // One reload, not one per control.
    this.filterForm.setValue({ stateId: '', search: '', adminStatus: '' }, { emitEvent: false });
    this.filterValues.set(this.filterForm.getRawValue());
    this.applyFilters();
  }

  openAdd(): void {
    this.dialog
      .open<AdcFormDialogComponent, AdcFormDialogData, boolean>(AdcFormDialogComponent, {
        data: { mode: 'create' },
        width: '600px',
        maxWidth: '95vw',
        disableClose: true,
        panelClass: this.themeClass ?? undefined,
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((saved) => {
        if (!saved) return;
        this.utilityService.triggerSnackbar('ADC added. The Admin has been sent an invitation.', 'snackbar-success');
        this.loadRows();
      });
  }

  private applyFilters(): void {
    this.page.set(1);
    this.loadRows();
  }

  /** Unknown or malformed values are ignored, so a hand-edited or stale URL still opens the page. */
  private readUrl(params: ParamMap): void {
    const { page, limit } = readPageParams(params);
    this.page.set(page);
    this.pageSize.set(limit);

    const sortBy = params.get('sortBy') as ListSortBy | null;
    if (sortBy && SORT_COLUMNS.includes(sortBy)) this.sortBy.set(sortBy);
    if (params.get('sortDir') === '-1') this.sortDir.set(-1);

    const stateId = params.get('state') ?? '';
    const adminStatus = params.get('adminStatus') as AdcAdminStatus | null;
    this.filterForm.setValue(
      {
        stateId: OBJECT_ID.test(stateId) ? stateId : '',
        search: (params.get('search') ?? '').slice(0, 100),
        adminStatus: adminStatus && ADMIN_STATUSES.includes(adminStatus) ? adminStatus : '',
      },
      { emitEvent: false },
    );
    this.filterValues.set(this.filterForm.getRawValue());
  }

  private writeUrl(): void {
    const { stateId, search, adminStatus } = this.filterForm.getRawValue();
    // null drops a param, so the URL only carries what differs from the defaults.
    void this.router.navigate([], {
      relativeTo: this.route,
      replaceUrl: true,
      queryParams: {
        state: stateId || null,
        search: search.trim() || null,
        adminStatus: adminStatus || null,
        sortBy: this.sortBy() === 'name' ? null : this.sortBy(),
        sortDir: this.sortDir() === -1 ? -1 : null,
        page: this.page() > 1 ? this.page() : null,
        limit: this.pageSize() === ADC_DEFAULT_PAGE_SIZE ? null : this.pageSize(),
      },
    });
  }
}
