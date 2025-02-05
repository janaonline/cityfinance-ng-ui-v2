import { Component, Renderer2, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '../../../core/services/common.service';
import { ResourcesDashboardService } from '../resources-dashboard.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss'
})
export class SearchBarComponent implements OnInit {

  globalFormControl = new FormControl();
  globalOptions = [];
  noDataFound = false;
  recentSearchArray: any = [];
  filteredOptions: any = [];
  postBody: any;
  stopNavigation: any


  constructor(
    protected _commonService: CommonService,
    private router: Router,
    public resourceDashboard: ResourcesDashboardService,
  ) {
    // this.resourceDashboard.getPdfData(this.pdfInput).subscribe((res: any) => {
    //   const response = res?.data.map((elem: any) => {
    //     elem.createdAt = elem.createdAt.split("T")[0]
    //     return elem
    //   })
    //   //  console.log("response", response)
    //   // Commented for updating the order
    //   // this.whatNewData = response
    // }, (err: any) => {
    //   // this.whatNewData = []
    // })

  }

  ngOnInit() {
    this.loadRecentSearchValue();

  }
  loadRecentSearchValue() {
    this._commonService.getRecentSearchValue().subscribe((res: any) => {
      //  console.log('recent search value', res);

      //  for(let i=0; i<3; i++){
      //    let obj = {
      //      _id: res?.data[i]?._id,
      //      name: res?.data[i]?.name,
      //      type: 'ulb'
      //    }
      //    this.recentSearchArray[i] = obj ;

      //  }
      this.recentSearchArray = res?.data;
      // console.log('ser array', this.recentSearchArray)

    },
      (error) => {
        //   console.log('recent search error', error)
      }
    )
  }
  globalSearchClick() {
    //  console.log('filterOptions', this.filteredOptions)
    //  console.log('form control', this.globalFormControl.value)
    const searchArray: any = this.filteredOptions;
    const searchValue = searchArray.find((e: any) => e?.name.toLowerCase() == this.globalFormControl?.value.toLowerCase());
    //  console.log(searchValue);


    if (!searchValue || searchValue?.type == "keyWord") {
      this._commonService.updateSearchItem(this.globalFormControl.value);
      const option = {
        type: "searchKeyword",
        _id: ""
      }
      this.dashboardNav(option);
    }

    // let postBody = {
    //   type: searchValue.type,
    //   searchKeyword: searchValue._id
    // }

    const type = searchValue?.type;
    this.checkType(type);
    this._commonService.postRecentSearchValue(this.postBody).subscribe((res) => {
      //    console.log('serach res', res)



    },
      (error) => {
        //   console.log(error)
      });
    const option = {
      type: searchValue.type,
      _id: searchValue._id
    }
    this.dashboardNav(option);
  }

  dashboardNav(option: any) {
    //console.log('option', option)
    this.checkType(option);
    if (option.type != "searchKeyword")
      this._commonService.postRecentSearchValue(this.postBody).subscribe((res) => {
        // console.log('serach res', res)
      },
        (error) => {
          // console.log(error)
        });
    //console.log('option', option)

    if (option?.type == 'state') {
      this.getYears(option);
      // this.router.navigateByUrl(`/dashboard/state?stateId=${option._id}`)
    }

    if (option?.type == 'ulb') {
      this.router.navigateByUrl(`/dashboard/city?cityId=${option._id}`)
    }

    if (option?.type == 'searchKeyword') {
      this.router.navigateByUrl(`/resources-dashboard/learning-center/toolkits`)
    }

  }


  checkType(searchValue: any) {
    const type = searchValue?.type;
    if (type == 'ulb') {
      this.postBody = {
        type: searchValue.type,
        ulb: searchValue._id
      };
    }
    if (type == 'state') {
      this.postBody = {
        type: searchValue.type,
        state: searchValue._id
      };
    }
    if (type == 'searchKeyword') {
      this.postBody = {
        type: searchValue.type,
        searchKeyword: searchValue._id
      }
    }
  }

  getYears(searchStateId: any) {
    const paramContent: any = {
      "state": searchStateId._id
    };
    // console.log('paramContent', paramContent)
    const financialYearList: any = [];
    const promise = new Promise((resolve, reject) => {
      this._commonService.getStateWiseFYs(paramContent).subscribe((res: any) => {
        if (res && res.success) {
          resolve(res["data"] && res["data"]['FYs'] ? res["data"]['FYs'] : []);
        }
      }, (err) => {
        console.log(err.message);
      });
    });
    financialYearList.push(promise);
    Promise.all(financialYearList).then(value => {
      // console.log('financialYearList', value);
      const yearList = value && value.length ? value[0] : [];
      this.stopNavigation = yearList
      sessionStorage.setItem('financialYearList', JSON.stringify(yearList));
      this.router.navigateByUrl(`/dashboard/state?stateId=${searchStateId._id}`)
      // if(searchStateId?.type == 'state'){
      //   this.router.navigateByUrl(`/dashboard/state?stateId=${searchStateId._id}`)
      // }
    })
  }
}
