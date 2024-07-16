import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MaterialModule } from '../../material.module';
import { HttpClient } from '@angular/common/http';
import { UserUtility } from '../../core/util/user/user';
import { ReplaceUnderscorePipe } from '../../core/pipes/replace-underscore-pipe';
import { Router, RouterModule } from '@angular/router';
import { XviFcService } from '../../core/services/xvi-fc.service';
import { FORM_STATUSES } from '../../core/constants/statuses';
import { Sort, MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as FileSaver from "file-saver";
import { IUserLoggedInDetails } from '../../core/models/login/userLoggedInDetails';
import { USER_TYPE } from '../../core/models/user/userType';
import { AuthService } from '../../core/services/auth.service';
import { SelectionModel } from '@angular/cdk/collections';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ApproveRejectFormService } from './approve-reject-form.service';
import Swal from 'sweetalert2';

interface Data {
    position: string;
    stateName: string;
    ulbName: string;
    censusCode: number;
    formStatus: string;
    dataSubmitted: number;
    action: string;
    ulbId: string;
    isReviewable: boolean;
}
@Component({
    selector: 'app-xvi-fc-review',
    standalone: true,
    imports: [
        MaterialModule,
        MatTableModule,
        MatSortModule,
        RouterModule,
        MatProgressSpinnerModule,

        MatPaginatorModule,
        ReplaceUnderscorePipe,
        BsDropdownModule
    ],

    templateUrl: './xvi-fc-review.component.html',
    styleUrl: './xvi-fc-review.component.scss'
})
export class XviFcReviewComponent implements AfterViewInit, OnInit {

    stateName: string = '';
    ulbName: string = '';
    stateId!: string;
    data!: any;

    loggedInUserDetails = new UserUtility().getLoggedInUserDetails();
    isLoader: boolean = true;
    isLoader1: boolean = false;
    loggedInUserType: any;
    user!: IUserLoggedInDetails | null;
    isLoggedIn: boolean = false;
    USER_TYPE = USER_TYPE;
    currentUserRole = this.loggedInUserDetails.role;
    // const role = this.user ? this.user.role : '';
    userData = this.loggedInUserDetails;

    displayedColumns: string[] = [];
    //displayedColumns: string[] = ['position', 'stateName', 'ulbName', 'censusCode', 'formStatus', 'dataSubmitted', 'action'];
    // displayedColumns: string[] = ['position',  'ulbName', 'censusCode', 'formStatus', 'dataSubmitted', 'action'];




    dataSource = new MatTableDataSource<Data>([]);
    selection = new SelectionModel<Data>(true, []);
    totalForms: any;
    // page: number = 0;
    limit: number = 10;
    skip: number = 0;
    statuses: any;
    formStatus!: string;
    state!: string;
    // sort: Sort = { active: 'formStatus', direction: 'desc' };
    sort: Sort = { active: 'ulbName', direction: 'asc' };
    sort1: Sort = { active: 'stateName', direction: 'asc' };
    stateList: any[] = [];
    ulbCategories: any[] = [{ "id": 16, "label": 'Category 1' }, { "id": 17, "label": 'Category 2' }];
    formId!: number;


    constructor(
        public service: XviFcService,
        private authService: AuthService,
        public approveRejectService: ApproveRejectFormService,
    ) { }
    checkUserLoggedIn() {
        this.isLoggedIn = this.authService.loggedIn();
        this.user = this.isLoggedIn ? this.user : null;

        if (this.isLoggedIn) {
            UserUtility.getUserLoggedInData().subscribe((value: any) => {
                this.user = value;
            });
        }
    }

    ngOnInit() {
        this.statuses = FORM_STATUSES;
        this.onLoad();
        this.checkUserLoggedIn();

        this.displayedColumns =
            this.user?.role == 'XVIFC' ?
                ['position', 'stateName', 'ulbName', 'censusCode', 'ulbCategory', 'formStatus', 'dataSubmitted', 'action', 'select'] :
                ['position', 'ulbName', 'censusCode', 'formStatus', 'dataSubmitted', 'action', 'select'];
    }

    get formStatuses() {
        return Object.entries(FORM_STATUSES).map(([key, value]: any): any => value);
    }

    onLoad() {
        // this.page = 50;
        // this.limit = 10;
        // this.skip = 0;
        this.isLoader = true;
        // this.stateId = this.loggedInUserDetails.state;
        // this.stateId = '5dcf9d7416a06aed41c748f0';
        // 0 1 2
        const queryParams = {
            // state: '5dcf9d7216a06aed41c748dd',
            skip: this.skip,
            limit: this.limit,
        };
        const payload = {
            sort: {
                [this.sort?.active]: this.sort?.direction === 'desc' ? -1 : 1,
                // ulbName: 1
                // stateName: 1,
                // censusCode: 1,
            },
            filter: {
                formStatus: this.formStatus != '' ? this.formStatus : undefined,
                stateName: this.state != '' ? this.state : undefined,
                formId: this.formId == 0 ? undefined : this.formId,
            },
            searchText: this.ulbName
        };
        this.service.getFormList(queryParams, payload).subscribe({
            next: (res: any) => {
                // console.log(payload);
                this.totalForms = res.totalForms;
                // this.dataSource.paginator =  1000;
                // this.dataSource = res.data;
                const tableData = res.data.map((e: any) => {
                    e.isReviewable = this.isReviewable(e.formStatus);
                    return e;
                });
                // console.log('tableData', tableData);

                this.dataSource = new MatTableDataSource(tableData);

                this.isLoader = false;
            }, error: () => {
                this.isLoader = false;
                this.dataSource = new MatTableDataSource<Data>([]);
                this.totalForms = 0;
            }
        });
        this.service.getStates().subscribe({
            next: (res: any) => {
                this.stateList = res.data;
            }, error: () => {
            }
        });
    }

    filter(reset = false) {
        this.skip = 0;
        if (reset) {
            this.formStatus = "";
            this.ulbName = "";
            this.state = "";
            this.formId = 0;
            this.selection.clear();
        }
        this.onLoad();
    }
    sortData(sort: Sort) {
        // console.log('sort', sort);
        this.sort = sort;
        this.onLoad();
    }
    pageChanged(event: any) {
        // console.log('event',event);
        this.skip = event.pageIndex;
        this.limit = event.pageSize;
        this.onLoad();
    }

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }
    getStatusClass(status: string): string {
        // const statusClases: any = {
        //   IN_PROGRESS: 'alert-warning',
        //   NOT_STARTED: 'alert-secondary',
        //   UNDER_REVIEW_BY_STATE: 'alert-info',
        //   RETURNED_BY_STATE: 'alert-danger',
        //   UNDER_REVIEW_BY_XVIFC: 'alert-info',
        //   SUO_MOTO_STATE: 'alert-success',
        //   RETURNED_BY_XVIFC: 'alert-danger',
        //   APPROVED_BY_XVIFC: 'alert-success',
        //   SUO_MOTO_XVIFC: 'alert-success',
        // }
        return FORM_STATUSES[status].class;
    }

    // Progress report.
    download(event: any) {
        this.isLoader1 = true;
        if (event) {
            this.service.progressReport().subscribe((res: any) => {
                const blob = new Blob([res], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                });

                // Set file name.
                // const userData: any = JSON.parse(localStorage.getItem('userData') || '{}');
                const now = new Date();
                const dateString = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
                const timeString = `${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;
                let file = this.currentUserRole == 'XVIFC' ? 'XVIFC' : this.userData.name + '_XVIFC';
                const filename = `${file}_FORM_PROGRESS_${dateString}_${timeString}.xlsx`;

                FileSaver.saveAs(blob, filename);
                this.isLoader1 = false;
                console.log('File Download Done');
                return;

            }, (err) => {
                console.log(err);
            });
        }
    }

    isAllSelected() {
        const numSelected = this.selection?.selected?.length;
        const numRows = this.dataSource?.data?.length;
        return numSelected === numRows;
    }

    masterToggle() {
        this.isAllSelected() ?
            this.selection.clear() :
            this.dataSource?.data.forEach(row => {
                if (row.isReviewable) {
                    this.selection.select(row);
                }
            });
    }

    /**
     * Approve or reject ulbs forms
     * @param statusType 
     */
    onReview(statusType: string) {
        // let ulbs: string[] = [];
        let ulbs: string[] = this.selection.selected.map(s => s.ulbId);
        // console.log('ulbs', ulbs);
        // check if ulb selected
        if (ulbs.length) {
            this.approveRejectService.openDialogue(statusType, ulbs);
        } else {
            Swal.fire(
                'Alert!',
                'Please select forms.',
                'info'
            );
        }

    }

    isReviewable(formStatus: string): Boolean {
        const status = FORM_STATUSES[formStatus] || '';
        if (status && status.role && status.role === this.currentUserRole) {
            return true;
        }
        return false;
    }

    // Data dump.
    downloadDump(event: any) {
        this.isLoader1 = true;
        if (event) {
            this.service.dataDump().subscribe((res: any) => {
                const blob = new Blob([res], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                });

                // Set file name.
                // const userData: any = JSON.parse(localStorage.getItem('userData') || '{}');
                const now = new Date();
                const dateString = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
                const timeString = `${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;
                let file = this.currentUserRole == 'XVIFC' ? 'XVIFC' : this.userData.name + '_XVIFC';
                const filename = `${file}_DATA_DUMP_${dateString}_${timeString}.xlsx`;

                FileSaver.saveAs(blob, filename);
                this.isLoader1 = false;
                console.log('File Download Done');
                return;

            }, (err) => {
                console.log(err);
            });
        }
    }
}



