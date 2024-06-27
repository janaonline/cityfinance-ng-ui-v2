import { HttpClient } from '@angular/common/http';
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule, SortDirection } from '@angular/material/sort';
import { merge, Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { XviFcService } from '../../../core/services/xvi-fc.service';

/**
 * @title Table retrieving data through HTTP
 */
@Component({
  selector: 'table-http-example',
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  standalone: true,
  imports: [MatProgressSpinnerModule, MatTableModule, MatSortModule, MatPaginatorModule, DatePipe],
})
export class TableComponent implements AfterViewInit {
  displayedColumns: string[] = ['ulbName', 'censusCode', ];
  exampleDatabase!: ExampleHttpDatabase | null;
  data: GithubIssue[] = [];

  resultsLength = 0;
  isLoadingResults = false;
  isRateLimitReached = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  isLoader!: boolean;
  stateId: any;
  loggedInUserDetails: any;
  skip: any;
  limit = 10;
  formStatus: any;
  ulbName: any;
  totalForms: any;
  dataSource: any;

  constructor(private _httpClient: HttpClient, public service: XviFcService,) { }

  onLoad() {
    // this.page = 50;
    // this.limit = 10;
    // this.skip = 0;
    this.isLoader = true;
    // this.stateId = this.loggedInUserDetails.state;
    this.stateId = '5dcf9d7416a06aed41c748f0';
    // 0 1 2
    const queryParams = {
      state: '5dcf9d7216a06aed41c748dd',
      skip: this.paginator.pageIndex,
      limit: this.limit,
    }
    const payload = {
      sort: {
        [this.sort.active]: this.sort.direction === 'asc' ? 1 : -1,
        // ulbName: 1
        // stateName: 1,
        // censusCode: 1,
      },
      filter: {
        // formStatus: 'IN_PROGRESS'
        formStatus: this.formStatus
      },
      searchText: this.ulbName
    };
    this.service.getFormList(queryParams, payload).subscribe({
      next: (res: any) => {
        // console.log(res);
        this.totalForms = res.totalForms;
        // this.dataSource.paginator =  1000;
        this.dataSource = res.data

        this.isLoader = false;
      }, error: () => {
        this.isLoader = false;
      }
    });
  }
  ngAfterViewInit() {
    console.log('--in-');
    
    this.exampleDatabase = new ExampleHttpDatabase(this._httpClient);

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.onLoad();
    // merge(this.sort.sortChange, this.paginator.page)
    //   .pipe(
    //     startWith({}),
    //     switchMap(() => {
    //       this.isLoadingResults = true;
    //       // return this.exampleDatabase!.getRepoIssues(
    //       //   this.sort.active,
    //       //   this.sort.direction,
    //       //   this.paginator.pageIndex,
    //       // ).pipe(catchError(() => observableOf(null)));
    //       return this.onLoad()
    //     }),
    //     map(data => {
    //       // Flip flag to show that loading has finished.
    //       // this.isLoadingResults = false;
    //       this.isRateLimitReached = data === null;

    //       if (data === null) {
    //         return [];
    //       }

    //       // Only refresh the result length if there is new data. In case of rate
    //       // limit errors, we do not want to reset the paginator to zero, as that
    //       // would prevent users from re-triggering requests.
    //       this.resultsLength = data.total_count;
    //       return data.items;
    //     }),
    //   )
    //   .subscribe(data => (this.data = data));
  }
}

export interface GithubApi {
  items: GithubIssue[];
  total_count: number;
}

export interface GithubIssue {
  created_at: string;
  number: string;
  state: string;
  title: string;
}

/** An example database that the data source uses to retrieve data for the table. */
export class ExampleHttpDatabase {
  constructor(private _httpClient: HttpClient) { }

  getRepoIssues(sort: string, order: SortDirection, page: number): Observable<GithubApi> {
    const href = 'https://api.github.com/search/issues';
    const requestUrl = `${href}?q=repo:angular/components&sort=${sort}&order=${order}&page=${page + 1
      }`;

    return this._httpClient.get<GithubApi>(requestUrl);
  }
}


/**  Copyright 2024 Google LLC. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at https://angular.io/license */