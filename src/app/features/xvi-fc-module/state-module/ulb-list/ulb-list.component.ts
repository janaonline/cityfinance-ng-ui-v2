import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { GlobalLoaderService } from '../../../../core/services/loaders/global-loader.service';
import { UtilityService } from '../../../../core/services/utility.service';
import { UserUtility } from '../../../../core/util/user/user';
import { MaterialModule } from '../../../../material.module';
import { IState } from '../../../../core/models/state/state';
import { IUlbMaster } from '../../../../core/models/ulb-master';
import { UlbDialogComponent } from './dialog/ulb-dialog.component';
import { UlbDialogResponse } from './ulb-list.interface';
import { UlbMasterService } from './ulb-master.service';

const errMsg = 'An unexpected error occurred. Please try again later.';

@Component({
  selector: 'app-ulb-list',
  imports: [MatTableModule, MatPaginatorModule, MaterialModule, FormsModule, RouterLink],
  templateUrl: './ulb-list.component.html',
  styleUrl: './ulb-list.component.scss',
})
export class UlbListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private readonly loggedInUserDetails = new UserUtility().getLoggedInUserDetails();
  readonly isAdmin = this.loggedInUserDetails?.role === 'ADMIN';
  readonly isState = this.loggedInUserDetails?.role === 'STATE';
  /** ADMIN accounts have no home state to default to, so the simplified Register ULB page is STATE-only. */
  readonly canCreate = this.isState;

  displayedColumns: string[] = ['code', 'name', 'district', 'ulbType', 'approvalStatus', 'isActive'];

  ulbs: IUlbMaster[] = [];
  dataSource = new MatTableDataSource<IUlbMaster>([]);
  states: IState[] = [];

  search = '';
  stateFilter = '';
  approvalStatusFilter: '' | 'PENDING' | 'APPROVED' | 'REJECTED' = '';
  pageIndex = 0;
  pageSize = 10;
  totalItems = 0;

  constructor(
    public globalLoader: GlobalLoaderService,
    private utilityService: UtilityService,
    private ulbMasterService: UlbMasterService,
    private dialog: MatDialog,
  ) {
    if (this.isAdmin) {
      this.displayedColumns = [...this.displayedColumns, 'actions'];
    }
  }

  /** For a STATE user the backend always scopes results/creates to their own state — the filter is redundant for them. */
  get showStateFilter(): boolean {
    return !this.isState;
  }

  ngOnInit(): void {
    if (this.showStateFilter) this.loadStates();
    this.getUlbs();
  }

  /** Populates the State filter dropdown. Row-level state/ULB type names now come pre-resolved from the list API. */
  private loadStates(): void {
    this.ulbMasterService.getStates().subscribe({
      next: (res) => {
        this.states = res.data ?? [];
      },
      error: () => {
        this.utilityService.swalPopup('Failed!', 'Unable to load states.', 'error');
      },
    });
  }

  getUlbs(): void {
    this.globalLoader.showLoader();
    this.ulbMasterService
      .list({
        search: this.search || undefined,
        state: this.stateFilter || undefined,
        approvalStatus: this.approvalStatusFilter || undefined,
        sortBy: 'createdAt',
        sortDir: -1,
        page: this.pageIndex + 1,
        limit: this.pageSize,
      })
      .subscribe({
        next: (res) => {
          this.ulbs = res.data.data;
          this.dataSource.data = this.ulbs;
          this.totalItems = res.data.total;
          this.globalLoader.stopLoader();
        },
        error: (error: Error) => {
          this.globalLoader.stopLoader();
          this.utilityService.swalPopup('Failed!', error.message || errMsg, 'error');
        },
      });
  }

  onSearchChange(): void {
    this.pageIndex = 0;
    this.getUlbs();
  }

  clearFilters(): void {
    this.search = '';
    this.stateFilter = '';
    this.approvalStatusFilter = '';
    this.onSearchChange();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getUlbs();
  }

  /** Editing still uses the modal dialog; creation now happens on the dedicated Register ULB page. */
  openEditDialog(ulb: IUlbMaster): void {
    const dialogRef = this.dialog.open(UlbDialogComponent, {
      data: { action: 'Edit', ulbId: ulb._id, ulb },
      width: '700px',
    });

    dialogRef.afterClosed().subscribe((result: UlbDialogResponse) => {
      if (!result?.payload || !result.ulbId) return;
      this.updateUlb(result.ulbId, result.payload);
    });
  }

  updateUlb(id: string, payload: Record<string, unknown>): void {
    this.globalLoader.showLoader();
    this.ulbMasterService.update(id, payload).subscribe({
      next: () => {
        this.globalLoader.stopLoader();
        this.utilityService.swalPopup('Success!', 'ULB has been updated successfully.');
        this.getUlbs();
      },
      error: (error: { error?: { message?: string | string[] } }) => {
        this.globalLoader.stopLoader();
        this.utilityService.swalPopup('Failed!', this.extractErrorMessage(error), 'error');
      },
    });
  }

  removeUlb(ulb: IUlbMaster): void {
    if (!window.confirm(`Are you sure you want to deactivate ${ulb.name} (${ulb.code})?`)) return;

    this.globalLoader.showLoader();
    this.ulbMasterService.remove(ulb._id).subscribe({
      next: () => {
        this.globalLoader.stopLoader();
        this.utilityService.swalPopup('Deactivated!', `${ulb.name} has been deactivated successfully.`);
        this.getUlbs();
      },
      error: (error: { error?: { message?: string | string[] } }) => {
        this.globalLoader.stopLoader();
        this.utilityService.swalPopup('Failed!', this.extractErrorMessage(error), 'error');
      },
    });
  }

  approveUlb(ulb: IUlbMaster): void {
    if (!window.confirm(`Approve ${ulb.name} (${ulb.code})?`)) return;

    this.globalLoader.showLoader();
    this.ulbMasterService.approve(ulb._id).subscribe({
      next: () => {
        this.globalLoader.stopLoader();
        this.utilityService.swalPopup('Approved!', `${ulb.name} has been approved.`);
        this.getUlbs();
      },
      error: (error: { error?: { message?: string | string[] } }) => {
        this.globalLoader.stopLoader();
        this.utilityService.swalPopup('Failed!', this.extractErrorMessage(error), 'error');
      },
    });
  }

  rejectUlb(ulb: IUlbMaster): void {
    const reason = window.prompt(`Reason for rejecting ${ulb.name} (${ulb.code}):`);
    if (!reason?.trim()) return;

    this.globalLoader.showLoader();
    this.ulbMasterService.reject(ulb._id, reason.trim()).subscribe({
      next: () => {
        this.globalLoader.stopLoader();
        this.utilityService.swalPopup('Rejected', `${ulb.name} has been rejected.`);
        this.getUlbs();
      },
      error: (error: { error?: { message?: string | string[] } }) => {
        this.globalLoader.stopLoader();
        this.utilityService.swalPopup('Failed!', this.extractErrorMessage(error), 'error');
      },
    });
  }

  private extractErrorMessage(error: { error?: { message?: string | string[] } }): string {
    const message = error?.error?.message;
    if (Array.isArray(message)) return message.join(', ');
    return message || errMsg;
  }
}
