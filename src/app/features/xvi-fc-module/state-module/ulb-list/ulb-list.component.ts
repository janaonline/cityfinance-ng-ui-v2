import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { forkJoin } from 'rxjs';
import { GlobalLoaderService } from '../../../../core/services/loaders/global-loader.service';
import { UtilityService } from '../../../../core/services/utility.service';
import { UserUtility } from '../../../../core/util/user/user';
import { MaterialModule } from '../../../../material.module';
import { FieldConfig } from '../../../../shared/dynamic-form/field.interface';
import { IState } from '../../../../core/models/state/state';
import { IUlbMaster, IUlbType } from '../../../../core/models/ulb-master';
import { UlbDialogComponent } from './dialog/ulb-dialog.component';
import { UlbDialogResponse } from './ulb-list.interface';
import { UlbMasterService } from './ulb-master.service';
import { ULB_TEMPLATE } from './ulb-template.constant';

const errMsg = 'An unexpected error occurred. Please try again later.';

@Component({
  selector: 'app-ulb-list',
  imports: [MatTableModule, MatPaginatorModule, MaterialModule, FormsModule],
  templateUrl: './ulb-list.component.html',
  styleUrl: './ulb-list.component.scss',
})
export class UlbListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private readonly loggedInUserDetails = new UserUtility().getLoggedInUserDetails();
  readonly isAdmin = this.loggedInUserDetails?.role === 'ADMIN';
  readonly isState = this.loggedInUserDetails?.role === 'STATE';
  readonly canCreate = this.isAdmin || this.isState;
  private readonly ownStateId: string | null = this.loggedInUserDetails?.state ?? null;

  displayedColumns: string[] = ['code', 'name', 'district', 'ulbType', 'approvalStatus', 'isActive'];

  ulbs: IUlbMaster[] = [];
  dataSource = new MatTableDataSource<IUlbMaster>([]);
  states: IState[] = [];
  ulbTypes: IUlbType[] = [];
  stateNameById = new Map<string, string>();
  ulbTypeNameById = new Map<string, string>();

  search = '';
  stateFilter = '';
  pageIndex = 0;
  pageSize = 10;
  totalItems = 0;

  ulbTemplate: FieldConfig[] = ULB_TEMPLATE;

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
    // this.loadLookups();
    this.getUlbs();
  }

  private loadLookups(): void {
    forkJoin({
      states: this.ulbMasterService.getStates(),
      types: this.ulbMasterService.getTypes(),
    }).subscribe({
      next: ({ states, types }) => {
        this.states = states.data ?? [];
        this.ulbTypes = types.data ?? [];
        this.stateNameById = new Map(this.states.map((s) => [s._id, s.name]));
        this.ulbTypeNameById = new Map(this.ulbTypes.map((t) => [t._id, t.name]));
      },
      error: () => {
        this.utilityService.swalPopup('Failed!', 'Unable to load states/ULB types.', 'error');
      },
    });
  }

  getUlbs(): void {
    this.globalLoader.showLoader();
    this.ulbMasterService
      .list({
        search: this.search || undefined,
        state: this.stateFilter || undefined,
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

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getUlbs();
  }

  stateName(id: string): string {
    return this.stateNameById.get(id) ?? '—';
  }

  ulbTypeName(id: string): string {
    return this.ulbTypeNameById.get(id) ?? '—';
  }

  openDialog(action: 'Create' | 'Edit', ulb?: IUlbMaster): void {
    // A STATE user's submissions are always pinned to their own state on the backend;
    // lock the field client-side too so the form reflects what will actually be saved.
    const lockState = action === 'Create' && this.isState;
    const initialUlb = ulb ?? (lockState && this.ownStateId ? ({ state: this.ownStateId } as Partial<IUlbMaster>) : undefined);

    const dialogRef = this.dialog.open(UlbDialogComponent, {
      data: {
        action,
        ulbTemplate: structuredClone(this.ulbTemplate).map((field) => ({
          ...field,
          value: ulb ? (ulb as unknown as Record<string, unknown>)[field.key] : field.value,
        })),
        ulbId: ulb?._id ?? null,
        states: this.states,
        ulbTypes: this.ulbTypes,
        ulb: initialUlb,
        lockState,
      },
      width: '700px',
    });

    dialogRef.afterClosed().subscribe((result: UlbDialogResponse) => {
      if (!result?.payload) return;
      if (result.action === 'Create') {
        this.createUlb(result.payload);
      } else if (result.ulbId) {
        this.updateUlb(result.ulbId, result.payload);
      }
    });
  }

  createUlb(payload: Record<string, unknown>): void {
    this.globalLoader.showLoader();
    this.ulbMasterService.create(payload).subscribe({
      next: () => {
        this.globalLoader.stopLoader();
        this.utilityService.swalPopup('Success!', 'ULB has been created successfully.');
        this.getUlbs();
      },
      error: (error: { error?: { message?: string | string[] } }) => {
        this.globalLoader.stopLoader();
        this.utilityService.swalPopup('Failed!', this.extractErrorMessage(error), 'error');
      },
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
