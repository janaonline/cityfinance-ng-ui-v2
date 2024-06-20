import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { MaterialModule } from '../../material.module';
import { HttpClient } from '@angular/common/http';
import { USER_TYPE } from '../../core/models/user/userType';
import { UserUtility } from '../../core/util/user/user';
import { ReviewTableService } from '../../core/services/review-table.service';

interface Data {
  // position: number;
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
    MatPaginatorModule
  ],
  templateUrl: './xvi-fc-review.component.html',
  styleUrl: './xvi-fc-review.component.scss'
})
export class XviFcReviewComponent implements AfterViewInit, OnInit   {

  
  stateId!: string;
  data!:any;

  loggedInUserDetails = new UserUtility().getLoggedInUserDetails();
  isLoader: boolean = false;
  loggedInUserType: any;

  displayedColumns: string[] = ['position', 'ulbName', 'censusCode', 'formStatus', 'dataSubmitted', 'action'];

    dataSource = new MatTableDataSource<Data>([]);

  constructor(
    private http: HttpClient,
    public reviewTableService: ReviewTableService
  ) { }

  ngOnInit() {

    this.onLoad();

  }

  onLoad() {

    // this.isLoader = true;
    // this.stateId = this.loggedInUserDetails.state;
    this.stateId = '5dcf9d7416a06aed41c748f0';
    this.reviewTableService.getFormList(this.stateId).subscribe({
      next: (res: any) => {
        console.log(res);
        this.dataSource = res.data
        
        // this.isLoader = false;
      }, error: () => {
        // this.isLoader = false;
      }
    });
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  getStatusClass(status: string): string {
    switch (status) {
      case 'In progress':
        return 'status-in-progress';
      case 'Under review by state':
        return 'status-under-review';
      case 'Approved by XVIFC':
        return 'status-approved';
      case 'SUBMITTED':
        return 'status-submitted';
      default:
        return 'status-not-started';
    }
  }
}



// const ELEMENT_DATA: DashboardElement[] = [
//   {position: 1, ulbName: 'Kannur', censusCode: 1079, formStatus: 'In progress', actions:'View'},
//   {position: 2, ulbName: 'Bangalore', censusCode: 79, formStatus: 'Under review by state',actions:'Review'},
//   {position: 3, ulbName: 'Kannur', censusCode: 1079, formStatus: 'In progress',actions:'View'},
//   {position: 4, ulbName: 'Hydrabad', censusCode: 179, formStatus: 'Approved by XVIFC',actions:'View'},
//   {position: 5, ulbName: 'Bangalore', censusCode: 79, formStatus: 'Under review by state',actions:'Review'},
//   {position: 6, ulbName: 'Hydrabad', censusCode: 179, formStatus: 'Approved by XVIFC', actions:'View'},
// ];

