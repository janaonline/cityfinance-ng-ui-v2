import { Component, Inject, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { FiscalRankingService } from '../../services/fiscal-ranking.service';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { MaterialModule } from '../../../../material.module';
import { UtilityService } from '../../../../core/services/utility.service';

import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged, map, of, Subject, switchMap, tap } from 'rxjs';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-comparision-filters',
  templateUrl: './comparision-filters.component.html',
  styleUrls: ['./comparision-filters.component.scss'],
  standalone: true,
  imports: [MaterialModule],
})
export class ComparisionFiltersComponent implements OnInit, OnDestroy {

  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;

  // query: string = '';
  // searchField: string = '';
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
    private fiscalRankingService: FiscalRankingService,
    private utilityService: UtilityService,
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  // ngOnInit(): void {
  //   this.ulbs = this.data?.ulbs;
  //   this.datasetsFilter = this.data?.datasetsFilter;
  // }

  private searchSubject = new Subject<string>();
  private readonly debounceTimeMs = 300; // Set the debounce time (in milliseconds)


  ngOnInit() {
    this.ulbs = this.data?.ulbs;
    // console.log("filter size", this.ulbs.length);
    this.datasetsFilter = this.data?.datasetsFilter;
    this.searchSubject.pipe(debounceTime(this.debounceTimeMs)).subscribe((searchValue) => {
      // this.performSearch(searchValue);
      // this.search();
    });
    this.onSearchValueChange();
  }

  onSearchValueChange() {
    const search$ = this.searchField.valueChanges.pipe(
      map((value: any) => {
        return value
      }),
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => this.isSearching = true),
      switchMap((term) => term ? this.search(term) : of<any>({ data: this.filteredOptions })),
      tap(() => {
        this.isSearching = false,
          this.showSearches = true;
      }));

    search$.subscribe(resp => {
      this.isSearching = false
      if (resp['ulbs'].length > 0) {
        this.noDataFound = false;
      } else {
        this.noDataFound = true;
      }
      // this.ulb.name
      // console.log("resp", resp["ulbs"])
      this.filteredOptions = resp["ulbs"]
    });

  }

  search(matchingWord: any) {
    const body = {
      matchingWord,
      onlyUlb: true,
    };
    // return this.commonService.searchUlb(body, "ulb", this.stateId);
    // console.log("matchingWord", matchingWord)
    return this.fiscalRankingService.searchUlb(matchingWord);
    //   .subscribe((res: any) => {
    //   this.searchResults = res.ulbs;
    //   this.menuTrigger.openMenu();
    // })
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }

  onSearch(searchValue: string) {
    // console.log("searchValue", searchValue);
    this.searchSubject.next(searchValue);
  }

  filterKeys() {
    return Object.keys(this.datasetsFilter);
  }

  // search() {
  //   this.fiscalRankingService.searchUlb(this.query).subscribe((res: any) => {
  //     this.searchResults = res.ulbs;
  //     this.menuTrigger.openMenu();
  //   })
  // }

  // debouncedSearch = this.utilityService.debounce(this.search, 500);

  async addUlb(ulb: any) {

    // const isAgree = true;

    // console.log("from add function", ulb)

    if (this.data?.ulb.populationBucket != ulb.populationBucket) {
      Swal.fire({
        title: "Are you sure?",
        text: `${ulb?.name} does not fall under ${this.data?.bucketShortName} if you still want to compare, please click on apply button.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Apply"
      }).then((result) => {
        if (result.isConfirmed) {
          this.ulbs.push(ulb);
        }
      });
    } else if (
        this.data?.ulb?.name === ulb?.name ||
        this.ulbs?.some((element: any) => element?.name === ulb?.name)
      ){
      Swal.fire({
        title: "Oops!",
        text: `${ulb?.name ?? 'Serached ULB'} already exists.`,
      });
    }  else {
      this.ulbs.push(ulb);
    }


    // console.log('isAgree', isAgree);

    // this.query = '';
    this.searchField.setValue('');
    this.searchResults = [];
    // if (isAgree) {
    //   this.ulbs.push(ulb);
    //   // this.menuTrigger.closeMenu();
    // }
  }



  closeMenu() {
    setTimeout(() => {
      this.menuTrigger.closeMenu();
    }, 500);
  }

  removeUlb(index: any) {
    this.ulbs.splice(index, 1);
  }

  apply() {
    this.dialogRef.close({
      ulbs: this.ulbs,
      datasetsFilter: this.datasetsFilter
    })
  }

  reset() {
    this.dialogRef.close('reset');
  }

  close() {
    this.dialogRef.close();
  }
}
