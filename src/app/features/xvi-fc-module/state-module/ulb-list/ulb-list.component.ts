import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
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
import { UlbReviewDialogComponent, UlbReviewDialogResponse } from './dialog/ulb-review-dialog.component';
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

  displayedColumns: string[] = ['serialNo', 'name', 'district', 'ulbType', 'approvalStatus', 'actions'];

  ulbs: IUlbMaster[] = [];
  dataSource = new MatTableDataSource<IUlbMaster>([]);
  states: IState[] = [];

  search = '';
  stateFilter = '';
  approvalStatusFilter: '' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXISTING' = '';
  pageIndex = 0;
  pageSize = 10;
  totalItems = 0;

  constructor(
    public globalLoader: GlobalLoaderService,
    private utilityService: UtilityService,
    private ulbMasterService: UlbMasterService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
  ) {
    if (this.showStateFilter) {
      const districtIndex = this.displayedColumns.indexOf('district');
      this.displayedColumns.splice(districtIndex + 1, 0, 'state');
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
        this.cdr.markForCheck();
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
          this.cdr.markForCheck();
        },
        error: (error: Error) => {
          this.globalLoader.stopLoader();
          this.utilityService.swalPopup('Failed!', error.message || errMsg, 'error');
          this.cdr.markForCheck();
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

  showRejectReason(ulb: IUlbMaster): void {
    if (ulb.approval?.status !== 'REJECTED') return;
    this.utilityService.swalPopup('Rejected', ulb.approval.rejectReason || 'No reason was provided.', 'error');
  }

  openReviewDialog(ulb: IUlbMaster): void {
    const dialogRef = this.dialog.open(UlbReviewDialogComponent, {
      data: { ulb },
      width: '500px',
    });

    dialogRef.afterClosed().subscribe((result: UlbReviewDialogResponse) => {
      if (!result?.decision) return;
      if (result.decision === 'APPROVED') {
        this.approveUlb(ulb);
      } else {
        this.rejectUlb(ulb, result.reason ?? '');
      }
    });
  }

  openViewDialog(ulb: IUlbMaster): void {
    this.dialog.open(UlbReviewDialogComponent, {
      data: { ulb, readOnly: true },
      width: '500px',
    });
  }

  /** STATE's fix-and-resubmit flow for a REJECTED ULB — the Register page's field set, not the ADMIN edit set. */
  openEditDialog(ulb: IUlbMaster): void {
    const dialogRef = this.dialog.open(UlbDialogComponent, {
      data: { action: 'Resubmit', ulbId: ulb._id, ulb },
      width: '700px',
    });

    dialogRef.afterClosed().subscribe((result: UlbDialogResponse) => {
      if (!result?.payload || !result.ulbId) return;
      this.updateUlb(result.ulbId, result.payload);
    });
  }

  private updateUlb(id: string, payload: Record<string, unknown>): void {
    this.globalLoader.showLoader();
    this.ulbMasterService.update(id, payload).subscribe({
      next: () => {
        this.globalLoader.stopLoader();
        this.utilityService.swalPopup('Submitted!', 'ULB has been resubmitted for approval.');
        this.getUlbs();
      },
      error: (error: { error?: { message?: string | string[] } }) => {
        this.globalLoader.stopLoader();
        this.utilityService.swalPopup('Failed!', this.extractErrorMessage(error), 'error');
      },
    });
  }

  private approveUlb(ulb: IUlbMaster): void {
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

  private rejectUlb(ulb: IUlbMaster, reason: string): void {
    this.globalLoader.showLoader();
    this.ulbMasterService.reject(ulb._id, reason).subscribe({
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

  /**
   * The dialog (Resubmit/Edit) already closes before this subscription runs, so — unlike the
   * Register ULB page — there's no form left on screen to attach inline field errors to. This at
   * least surfaces the real field-level reason (e.g. an MX-record failure) in the popup instead
   * of the opaque top-level "Validation failed" the backend sends alongside it.
   */
  private extractErrorMessage(error: {
    error?: { message?: string | string[]; errors?: Record<string, { message: string }[]> };
  }): string {
    const body = error?.error;
    const fieldMessages = body?.errors
      ? Object.values(body.errors).flatMap((fieldErrors) => fieldErrors.map((fieldError) => fieldError.message))
      : [];
    if (fieldMessages.length) return fieldMessages.join(' ');

    const message = body?.message;
    if (Array.isArray(message)) return message.join(', ');
    return message || errMsg;
  }
}
