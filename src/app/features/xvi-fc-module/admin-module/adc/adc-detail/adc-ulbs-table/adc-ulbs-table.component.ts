import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { Observable } from 'rxjs';
import { IUlbType } from '../../../../../../core/models/ulb-master';
import { PreLoaderComponent } from '../../../../../../shared/components/pre-loader/pre-loader.component';
import { AdcService, AdcUlbApprovalStatus, IAdcUlb, IAdcUlbsQuery, IPage } from '../../../../shared/adc/adc.service';
import { UlbMasterService } from '../../../../state-module/ulb-list/ulb-master.service';
import { AdcPagedTable } from '../adc-paged-table';

type UlbSort = NonNullable<IAdcUlbsQuery['sortBy']>;
type FilterControls = {
  search: FormControl<string>;
  ulbType: FormControl<string>;
  approvalStatus: FormControl<string>;
  isActive: FormControl<string>;
};

export const ULB_REGISTRATION_LABEL: Record<AdcUlbApprovalStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  EXISTING: 'Existing',
};

/** The ADC detail page's ULBs tab: view-only (ULBs are moved between ADCs on ULB Registration). */
@Component({
  selector: 'app-adc-ulbs-table',
  imports: [ReactiveFormsModule, MatTableModule, MatSortModule, MatPaginatorModule, PreLoaderComponent],
  templateUrl: './adc-ulbs-table.component.html',
  styleUrl: '../adc-detail-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdcUlbsTableComponent extends AdcPagedTable<IAdcUlb, UlbSort, FilterControls> implements OnInit {
  private readonly adcService = inject(AdcService);
  private readonly ulbMasterService = inject(UlbMasterService);

  readonly displayedColumns = ['name', 'code', 'ulbType', 'district', 'registration', 'active'];
  readonly registrationOptions = Object.entries(ULB_REGISTRATION_LABEL) as [AdcUlbApprovalStatus, string][];
  readonly ulbTypes = signal<IUlbType[]>([]);

  readonly filterForm = new FormGroup<FilterControls>({
    search: new FormControl('', { nonNullable: true }),
    ulbType: new FormControl('', { nonNullable: true }),
    approvalStatus: new FormControl('', { nonNullable: true }),
    isActive: new FormControl('', { nonNullable: true }),
  });
  protected readonly sortColumns: readonly UlbSort[] = ['name', 'code'];
  readonly sortBy = signal<UlbSort>('name');
  protected readonly errorMessage = 'Unable to load ULBs. Please try again.';

  override ngOnInit(): void {
    super.ngOnInit();
    this.ulbMasterService
      .getTypes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (res) => this.ulbTypes.set(res?.data ?? []), error: () => this.ulbTypes.set([]) });
  }

  registrationOf(ulb: IAdcUlb): string {
    return ULB_REGISTRATION_LABEL[ulb.approvalStatus];
  }

  protected fetch(page: number, limit: number): Observable<IPage<IAdcUlb>> {
    const { ulbType, approvalStatus, isActive } = this.filterForm.getRawValue();
    return this.adcService.ulbs(this.adcId(), {
      page,
      limit,
      search: this.searchText(),
      ulbType: ulbType || undefined,
      approvalStatus: (approvalStatus || undefined) as AdcUlbApprovalStatus | undefined,
      isActive: isActive ? isActive === 'true' : undefined,
      sortBy: this.sortBy(),
      sortDir: this.sortDir(),
    });
  }
}
