import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { MaterialModule } from '../../../../material.module';
import { FiscalRankingService } from '../../services/fiscal-ranking.service';

@Component({
  selector: 'app-search-popup',
  templateUrl: './search-popup.component.html',
  styleUrls: ['./search-popup.component.scss'],
  standalone: true,
  imports: [MaterialModule, RouterModule],
})
export class SearchPopupComponent implements OnInit {

  // ulbs: any = [];
  query: string = '';

  searchField = new FormControl();
  searchResults: any = [];
  ulbs: any = [];
  datasetsFilter: any = {};
  isSearching: boolean = false;
  noDataFound: boolean = false;
  showSearches: boolean = false;
  filteredOptions: any = [];

  constructor(
    private matDialog: MatDialog,
    private fiscalRankingService: FiscalRankingService
  ) { }

  ngOnInit() {
    this.onSearchValueChange();
  }

  close() {
    this.matDialog.closeAll();
  }

  onSearchValueChange() {
    const search$ = this.searchField.valueChanges.pipe(
      map((value: any) => {
        return value;
      }),
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => (this.isSearching = true)),
      switchMap((term) => (term ? this.fiscalRankingService.searchUlb(term) : of<any>({ data: this.filteredOptions }))),
      tap(() => {
        (this.isSearching = false), (this.showSearches = true);
      }),
    );

    search$.subscribe((resp) => {
      this.isSearching = false;
      if (resp['ulbs'].length > 0) {
        this.noDataFound = false;
      } else {
        this.noDataFound = true;
      }
      // this.ulb.name
      // console.log("resp", resp["ulbs"])
      this.filteredOptions = resp['ulbs'];
    });
  }

  async addUlb(ulb: any) {
    // if (this.data?.ulb?.populationBucket != ulb?.populationBucket) {
    //   Swal.fire({
    //     title: 'Are you sure?',
    //     text: `${ulb?.name} does not fall under ${this.data?.bucketShortName} if you still want to compare, please click on apply button.`,
    //     icon: 'warning',
    //     showCancelButton: true,
    //     confirmButtonColor: '#3085d6',
    //     cancelButtonColor: '#d33',
    //     confirmButtonText: 'Apply',
    //   }).then((result) => {
    //     if (result.isConfirmed) {
    //       this.ulbs.push(ulb);
    //     }
    //   });
    // } else if (
    //   this.data?.ulb?.name === ulb?.name ||
    //   this.ulbs?.some((element: any) => element?.name === ulb?.name)
    // ) {
    //   Swal.fire({
    //     title: 'Oops!',
    //     text: `${ulb?.name ?? 'Serached ULB'} already exists.`,
    //   });
    // } else {
    //   this.ulbs.push(ulb);
    // }
    // this.searchField.setValue('');
    // this.searchResults = [];
  }

}
