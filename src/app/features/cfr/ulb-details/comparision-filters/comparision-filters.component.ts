import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { debounceTime, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import Swal from 'sweetalert2';
import { MaterialModule } from '../../../../material.module';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { FiscalRankingService } from '../../services/fiscal-ranking.service';

@Component({
  selector: 'app-comparision-filters',
  templateUrl: './comparision-filters.component.html',
  styleUrls: ['./comparision-filters.component.scss'],
  standalone: true,
  imports: [MaterialModule],
})
export class ComparisionFiltersComponent implements OnInit {
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;

  searchField = new FormControl();
  searchResults: any = [];
  ulbs: any = [];
  datasetsFilter: any = {};
  isSearching: boolean = false;
  noDataFound: boolean = false;
  showSearches: boolean = false;
  filteredOptions: any = [];

  constructor(
    private fiscalRankingService: FiscalRankingService,
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  // private searchSubject = new Subject<string>();
  // private readonly debounceTimeMs = 300; // Set the debounce time (in milliseconds)

  ngOnInit() {
    this.ulbs = this.data?.ulbs;
    // console.log("filter size", this.ulbs.length);
    this.datasetsFilter = this.data?.datasetsFilter;
    // this.searchSubject.pipe(debounceTime(this.debounceTimeMs)).subscribe((searchValue) => { });
    this.onSearchValueChange();
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

    search$.subscribe((resp: any) => {
      this.isSearching = false;
      if (resp['ulbs'] && resp['ulbs'].length > 0) {
        this.noDataFound = false;
      } else {
        this.noDataFound = true;
      }
      this.filteredOptions = resp['ulbs'];
    });
  }

  filterKeys() {
    return Object.keys(this.datasetsFilter);
  }

  async addUlb(ulb: any) {
    if (this.data?.ulb?.populationBucket != ulb?.populationBucket) {
      Swal.fire({
        title: 'Are you sure?',
        text: `${ulb?.name} does not fall under ${this.data?.bucketShortName} if you still want to compare, please click on apply button.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Apply',
      }).then((result) => {
        if (result.isConfirmed) {
          this.AddToUlbsArr(ulb);
          // this.ulbs.push(ulb);
        }
      });
    } else if (
      this.data?.ulb?.name === ulb?.name ||
      this.ulbs?.some((element: any) => element?.name === ulb?.name)
    ) {
      Swal.fire({
        // title: 'Oops!',
        text: `${ulb?.name ?? 'Serached ULB'} already exists.`,
      });
    } else {
      this.AddToUlbsArr(ulb)
      // this.ulbs.push(ulb);
    }
    this.searchField.setValue('');
    this.searchResults = [];
  }

  AddToUlbsArr(ulb: any){
    if (ulb.currentFormStatus !== 11) {
      // Swal.fire('OOPS!', `${ulb.name} is not ranked.`, 'info');
      Swal.fire({
        // title: 'Oops!',
        text: `${ulb.name} is not ranked.`,
      })
    } else this.ulbs.push(ulb);
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
      datasetsFilter: this.datasetsFilter,
    });
  }

  reset() {
    this.dialogRef.close('reset');
  }

  close() {
    this.dialogRef.close();
  }
}
