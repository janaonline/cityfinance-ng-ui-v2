import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import * as FileSaver from 'file-saver';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { first } from 'rxjs';
import Swal from 'sweetalert2';
import { FORM_STATUSES } from '../../core/constants/statuses';
import { IUserLoggedInDetails } from '../../core/models/login/userLoggedInDetails';
import { USER_TYPE } from '../../core/models/user/userType';
import { ReplaceUnderscorePipe } from '../../core/pipes/replace-underscore-pipe';
import { AuthService } from '../../core/services/auth.service';
import { UtilityService } from '../../core/services/utility.service';
import { XviFcService } from '../../core/services/xvi-fc.service';
import { UserUtility } from '../../core/util/user/user';
import { MaterialModule } from '../../material.module';
import { ApproveRejectFormService } from './approve-reject-form.service';
import { Title, Meta } from '@angular/platform-browser';

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
  imports: [
    MaterialModule,
    MatTableModule,
    MatSortModule,
    RouterModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    ReplaceUnderscorePipe,
    BsDropdownModule,
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
  ulbCategories: any[] = [
    { id: 16, label: 'Category 1' },
    { id: 17, label: 'Category 2' },
  ];
  formId!: number;
  readonly excelType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  constructor(
    private titleService: Title,
    private metaService: Meta,
    public service: XviFcService,
    private authService: AuthService,
    public approveRejectService: ApproveRejectFormService,
    private utilityService: UtilityService,
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
    // Set meta tags tailored for XVI FC Review page
    this.titleService.setTitle('XVIFC Forms Review | City Finance');

    this.metaService.updateTag({
      name: 'description',
      content: 'Review and manage XVI Finance Commission forms, statuses, and progress for City Finance administrators and reviewers.'
    });

    this.metaService.updateTag({
      name: 'keywords',
      content: 'City Finance, XVI FC, review, finance commission, mohua, grants'
    });

    this.metaService.updateTag({
      name: 'robots',
      content: 'index, follow'
    });

    this.metaService.updateTag({
      property: 'og:title',
      content: 'XVIFC Forms Review | City Finance'
    });

    this.metaService.updateTag({
      property: 'og:description',
      content: 'Access and review XVI Finance Commission forms and progress reports on City Finance.'
    });

    this.metaService.updateTag({
      property: 'og:url',
      content: 'https://cityfinance.in/xvi-fc-review'
    });

    this.metaService.updateTag({
      property: 'og:type',
      content: 'website'
    });

    this.statuses = FORM_STATUSES;
    this.checkUserLoggedIn();
    if (this.user?.role === USER_TYPE.XVIFC) {
      this.getStateList();
    }
    this.onLoad();

    this.displayedColumns =
      this.user?.role === USER_TYPE.XVIFC
        ? [
          'position',
          'stateName',
          'ulbName',
          'censusCode',
          'ulbCategory',
          'formStatus',
          'dataSubmitted',
          'action',
          'select',
        ]
        : ['position', 'ulbName', 'censusCode', 'formStatus', 'dataSubmitted', 'action', 'select'];
  }

  get formStatuses() {
    return Object.entries(FORM_STATUSES).map(([key, value]: any): any => value);
  }

  onLoad() {
    // this.page = 50;
    // this.limit = 10;
    // this.skip = 0;
    this.selection.clear();
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
      searchText: this.ulbName,
    };
    this.service.getFormList(queryParams, payload).subscribe({
      next: (res: any) => {
        // console.log(payload);
        this.totalForms = res.totalForms;
        // this.dataSource.paginator =  1000;
        // this.dataSource = res.data;
        const tableData = res.data;

        this.dataSource = new MatTableDataSource(tableData);

        this.isLoader = false;
      },
      error: () => {
        this.isLoader = false;
        this.dataSource = new MatTableDataSource<Data>([]);
        this.totalForms = 0;
      },
    });
  }

  getStateList() {
    this.service.getStates().subscribe({
      next: (res: any) => {
        this.stateList = res.data;
      },
      error: () => { },
    });
  }

  filter(reset = false) {
    this.skip = 0;
    if (reset) {
      this.formStatus = '';
      this.ulbName = '';
      this.state = '';
      this.formId = 0;
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
  download(event: Event) {
    this.isLoader1 = true;
    if (event) {
      this.service.progressReport(this.state, this.formId).subscribe({
        next: (res: Blob) => {
          const blob = new Blob([res], { type: this.excelType });

          // Set file name.
          const timeStamp = this.utilityService.getTimeStamp();
          const file = this.currentUserRole == 'XVIFC' ? 'XVIFC' : this.userData.name + '_XVIFC';
          const filename = `${file}_FORM_PROGRESS_${timeStamp}.xlsx`;

          FileSaver.saveAs(blob, filename);
          this.isLoader1 = false;
          return;
        },
        error: (err) => console.error(err),
      });
    }
  }

  isAllSelected() {
    const numSelected = this.selection?.selected?.length;
    const numRows = this.dataSource?.data?.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource?.data.forEach((row) => {
        if (row.action === 'Review') {
          this.selection.select(row);
        }
      });
  }

  /**
   * Approve or reject ulbs forms
   * @param statusType
   */
  onReview(statusType: string) {
    const ulbs: string[] = this.selection.selected.map((s) => s.ulbId);

    // check if ulb selected
    if (ulbs.length) {
      this.approveRejectService.openDialogue(statusType, ulbs);
      this.approveRejectService.isDataSaved.pipe(first()).subscribe((success) => {
        if (success) this.onLoad();
      });
    } else Swal.fire('Alert!', 'Please select forms.', 'info');
  }

  // Data dump.
  downloadDump(event: Event) {
    this.isLoader1 = true;
    if (event) {
      this.service.dataDump(this.state, this.formId).subscribe({
        next: (res: Blob) => {
          const blob = new Blob([res], { type: this.excelType });

          // Set file name.
          const timeStamp = this.utilityService.getTimeStamp();
          const file = ['XVIFC', 'XVIFC_STATE'].includes(this.currentUserRole)
            ? this.currentUserRole
            : `${this.userData.name}_XVIFC`;
          const filename = `${file}_DATA_DUMP_${timeStamp}.xlsx`;

          FileSaver.saveAs(blob, filename);
          this.isLoader1 = false;
          return;
        },
        error: (err) => console.error(err),
      });
    }
  }
}
