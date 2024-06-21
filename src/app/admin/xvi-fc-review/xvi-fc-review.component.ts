import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MaterialModule } from '../../material.module';
import { HttpClient } from '@angular/common/http';
import { USER_TYPE } from '../../core/models/user/userType';
import { UserUtility } from '../../core/util/user/user';
import { ReviewTableService } from '../../core/services/review-table.service';
import { ReplaceUnderscorePipe } from '../../core/pipes/replace-underscore-pipe';
import { Router } from '@angular/router';

interface Data {
  ulbName: string;
  censusCode: number;
  formStatus: string;
  dataSubmitted: number;
  action: string;
}

@Component({
  selector: 'app-xvi-fc-review',
  standalone: true,
  imports: [
    MaterialModule,
    MatTableModule,
    MatPaginatorModule,
    ReplaceUnderscorePipe
  ],

  templateUrl: './xvi-fc-review.component.html',
  styleUrl: './xvi-fc-review.component.scss'
})
export class XviFcReviewComponent implements AfterViewInit, OnInit {

  ulbName: string = '';
  stateId!: string;
  data!: any;

  loggedInUserDetails = new UserUtility().getLoggedInUserDetails();
  isLoader: boolean = false;
  loggedInUserType: any;

  displayedColumns: string[] = ['position', 'ulbName', 'censusCode', 'formStatus', 'dataSubmitted', 'action'];

  dataSource = new MatTableDataSource<Data>([]);
  totalForms: any;
  // page: number = 0;
  limit: number = 10;
  skip: number = 0;

  constructor(
    private http: HttpClient,
    public reviewTableService: ReviewTableService,
    private router: Router
  ) { }



  ngOnInit() {

    this.onLoad();

  }

  onLoad() {
    // this.page = 50;
    // this.limit = 10;
    // this.skip = 0;
    // this.isLoader = true;
    this.stateId = this.loggedInUserDetails.state;
    // this.stateId = '5dcf9d7416a06aed41c748f0';
    // 0 1 2
    const paginationParams = {
      skip: this.skip,
      limit: this.limit
    }
    this.reviewTableService.getFormList(paginationParams).subscribe({
      next: (res: any) => {
        // console.log(res);
        this.totalForms = res.totalForms;
        // this.dataSource.paginator =  1000;
        this.dataSource = res.data

        // this.isLoader = false;
      }, error: () => {
        // this.isLoader = false;
      }
    });
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
    const statusClases: any = {
      IN_PROGRESS: 'alert-warning',
      NOT_STARTED: 'alert-secondary',
      UNDER_REVIEW_BY_STATE: 'alert-info',
      SUBMITTED: 'alert-primary',
      RETURNED_BY_STATE: 'alert-danger',
      UNDER_REVIEW_BY_XVIFC: 'alert-info',
      SUO_MOTO_STATE: 'alert-success',
      RETURNED_BY_XVIFC: 'alert-danger',
      APPROVED_BY_XVIFC: 'alert-success',
      SUO_MOTO_XVIFC: 'alert-success',
    }
    return statusClases[status];
  }
}

