import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
// import { Subject } from 'rxjs';
// import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
// import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
// import { UtilityService } from 'src/app/shared/services/utility.service';
import { FiscalRankingService } from '../../services/fiscal-ranking.service';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { MaterialModule } from '../../../../material.module';
import { UtilityService } from '../../../../core/services/utility.service';

import Swal from 'sweetalert2';

// import { FiscalRankingService } from '../../fiscal-ranking.service';

// const swal: SweetAlert = require("sweetalert");

@Component({
  selector: 'app-comparision-filters',
  templateUrl: './comparision-filters.component.html',
  styleUrls: ['./comparision-filters.component.scss'],
  standalone: true,
  imports: [MaterialModule],
})
export class ComparisionFiltersComponent implements OnInit {

  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;

  query: string = '';
  searchResults: any = [];

  ulbs: any = [];

  datasetsFilter: any = {};

  constructor(
    private matDialog: MatDialog,
    private fiscalRankingService: FiscalRankingService,
    private utilityService: UtilityService,
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.ulbs = this.data?.ulbs;
    this.datasetsFilter = this.data?.datasetsFilter;
  }

  filterKeys() {
    return Object.keys(this.datasetsFilter);
  }

  search() {
    this.fiscalRankingService.searchUlb(this.query).subscribe((res: any) => {
      this.searchResults = res.ulbs;
      this.menuTrigger.openMenu();
    })
  }

  debouncedSearch = this.utilityService.debounce(this.search, 500);

  async addUlb(ulb: any) {

    const isAgree = true;

    if (this.data?.ulb.populationBucket != ulb.populationBucket) {
      // isAgree = await Swal.fire(
      //   "Are you sure?",
      //   `${ulb?.name} does not fall under ${this.data?.bucketShortName} if you still want to compare, please click on apply button.`,
      //   "warning"
      //   , {
      //     buttons: {
      //       Leave: {
      //         text: "Cancel",
      //         className: 'btn-danger',
      //         value: false,
      //       },
      //       Stay: {
      //         text: "Apply",
      //         className: 'btn-success',
      //         value: true,
      //       },
      //     },
      //   }
      // );
    }


    console.log('isAgree', isAgree);

    this.query = '';
    this.searchResults = [];
    if (isAgree) {
      this.ulbs.push(ulb);
      this.menuTrigger.closeMenu();
    }
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
