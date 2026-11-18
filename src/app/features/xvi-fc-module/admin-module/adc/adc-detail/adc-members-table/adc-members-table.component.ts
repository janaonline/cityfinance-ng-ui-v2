import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { Observable } from 'rxjs';
import { PreLoaderComponent } from '../../../../../../shared/components/pre-loader/pre-loader.component';
import { AdcService, IAdcMember, IAdcMembersQuery, IPage } from '../../../../shared/adc/adc.service';
import { AdcPagedTable } from '../adc-paged-table';

type MemberSort = NonNullable<IAdcMembersQuery['sortBy']>;
type FilterControls = { search: FormControl<string>; level: FormControl<string>; status: FormControl<string> };

export const MEMBER_LEVEL_LABEL: Record<IAdcMember['subRole'], string> = {
  SUBMITTER: 'Admin',
  EDITOR: 'Reviewer',
  VIEWER: 'Viewer',
};

/** The ADC detail page's Members tab: view-only (the ADC Admin manages the team). */
@Component({
  selector: 'app-adc-members-table',
  imports: [DatePipe, ReactiveFormsModule, MatTableModule, MatSortModule, MatPaginatorModule, PreLoaderComponent],
  templateUrl: './adc-members-table.component.html',
  styleUrl: '../adc-detail-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdcMembersTableComponent extends AdcPagedTable<IAdcMember, MemberSort, FilterControls> {
  private readonly adcService = inject(AdcService);

  readonly displayedColumns = ['name', 'email', 'mobile', 'level', 'status', 'lastActive'];
  readonly levelOptions: { value: NonNullable<IAdcMembersQuery['level']>; label: string }[] = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'EDITOR', label: 'Reviewer' },
    { value: 'VIEWER', label: 'Viewer' },
  ];

  readonly filterForm = new FormGroup<FilterControls>({
    search: new FormControl('', { nonNullable: true }),
    level: new FormControl('', { nonNullable: true }),
    status: new FormControl('', { nonNullable: true }),
  });
  protected readonly sortColumns: readonly MemberSort[] = ['name', 'lastActive'];
  readonly sortBy = signal<MemberSort>('name');
  protected readonly errorMessage = 'Unable to load members. Please try again.';

  levelOf(member: IAdcMember): string {
    return MEMBER_LEVEL_LABEL[member.subRole];
  }

  protected fetch(page: number, limit: number): Observable<IPage<IAdcMember>> {
    const { level, status } = this.filterForm.getRawValue();
    return this.adcService.members(this.adcId(), {
      page,
      limit,
      search: this.searchText(),
      level: (level || undefined) as IAdcMembersQuery['level'],
      status: (status || undefined) as IAdcMembersQuery['status'],
      sortBy: this.sortBy(),
      sortDir: this.sortDir(),
    });
  }
}
