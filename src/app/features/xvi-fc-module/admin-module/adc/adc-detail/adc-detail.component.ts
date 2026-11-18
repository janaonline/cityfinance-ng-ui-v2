import { DatePipe, Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PreLoaderComponent } from '../../../../../shared/components/pre-loader/pre-loader.component';
import { XvifcBreadcrumbComponent, XvifcBreadcrumbLink } from '../../../shared/breadcrumb/breadcrumb.component';
import { PageErrorStateComponent } from '../../../shared/page-error-state/page-error-state.component';
import { AdcService, IAdcDetail } from '../../../shared/adc/adc.service';
import { AdcActionsMenuComponent } from '../adc-actions-menu/adc-actions-menu.component';
import { AdcMembersTableComponent } from './adc-members-table/adc-members-table.component';
import { AdcUlbsTableComponent } from './adc-ulbs-table/adc-ulbs-table.component';

export type AdcDetailTab = 'members' | 'ulbs';
const TABS: readonly AdcDetailTab[] = ['members', 'ulbs'];

/** Navigation state the ADC list sets on its links, so "Back to ADCs" can return to the exact list view. */
export interface AdcListNavigationState {
  fromAdcList?: boolean;
}

/** Portal Admin's read-only view of one ADC: header, Members and ULBs tabs. Changes go through the actions menu. */
@Component({
  selector: 'app-adc-detail',
  imports: [
    DatePipe,
    RouterLink,
    MatTabsModule,
    PreLoaderComponent,
    XvifcBreadcrumbComponent,
    PageErrorStateComponent,
    AdcActionsMenuComponent,
    AdcMembersTableComponent,
    AdcUlbsTableComponent,
  ],
  templateUrl: './adc-detail.component.html',
  styleUrl: './adc-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdcDetailComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly adcService = inject(AdcService);

  readonly adcId = this.route.snapshot.paramMap.get('id') ?? '';
  /** Read once: switching tabs replaces the history entry and drops the navigation state. */
  private readonly cameFromList = !!(this.location.getState() as AdcListNavigationState | null)?.fromAdcList;

  readonly detail = signal<IAdcDetail | null>(null);
  readonly status = signal<'loading' | 'ready' | 'error' | 'not-found'>('loading');
  readonly tabIndex = signal(0);
  /** Bumped after an Admin change so the Members tab reloads its rows. */
  readonly membersVersion = signal(0);

  readonly breadcrumbLinks = computed<XvifcBreadcrumbLink[]>(() => [
    { label: 'ADC', routerLink: ['..'] },
    { label: this.detail()?.name ?? 'ADC' },
  ]);

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const index = TABS.indexOf(params.get('tab') as AdcDetailTab);
      this.tabIndex.set(index < 0 ? 0 : index);
    });
    this.loadDetail();
  }

  loadDetail(): void {
    if (!this.detail()) this.status.set('loading');
    this.adcService
      .detail(this.adcId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (detail) => {
          this.detail.set(detail);
          this.status.set('ready');
        },
        error: (err: HttpErrorResponse) => this.status.set(err?.status === 404 || err?.status === 400 ? 'not-found' : 'error'),
      });
  }

  selectTab(tab: AdcDetailTab): void {
    this.onTabChange(TABS.indexOf(tab));
  }

  onTabChange(index: number): void {
    this.tabIndex.set(index);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: TABS[index] },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  onChanged(): void {
    this.loadDetail();
    this.membersVersion.update((v) => v + 1);
  }

  onDeleted(): void {
    void this.router.navigate(['..'], { relativeTo: this.route, replaceUrl: true });
  }

  /** Returns to the list exactly as it was (its filters, sort and page are in its URL), or opens it fresh. */
  backToList(): void {
    if (this.cameFromList) this.location.back();
    else void this.router.navigate(['..'], { relativeTo: this.route });
  }
}
