import { Component, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { FeatureCollection, GeoJsonObject, Geometry } from 'geojson';
import L, { PathOptions, StyleFunction } from 'leaflet';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  of,
  startWith,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import { InrCurrencyPipe } from '../../../core/directives/inr-currency.pipe';
import { ICreditRatingData } from '../../../core/models/creditRating/creditRatingResponse';
import { IState } from '../../../core/models/state/state';
import { ULBWithMapData } from '../../../core/models/ulbsForMapResponse';
import { AssetsService } from '../../../core/services/assets/assets.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommonService } from '../../../core/services/common.service';
import { GeographicalService } from '../../../core/services/geographical/geographical.service';
import { MapUtil } from '../../../core/util/map/mapUtil';
import { IMapCreationConfig } from '../../../core/util/map/models/mapCreationConfig';
import { UserUtility } from '../../../core/util/user/user';
import { MaterialModule } from '../../../material.module';
import { PreLoaderComponent } from '../../../shared/components/pre-loader/pre-loader.component';
import { ILeafletStateClickEvent } from '../../../shared/components/re-useable-heat-map/models/leafletStateClickEvent';
import { MapComponent } from '../../../shared/components/map/map.component';
// import { ReUseableHeatMapComponent } from '../../../shared/components/re-useable-heat-map/re-useable-heat-map.component';

@Component({
  selector: 'app-dashboard-map-section',
  imports: [MaterialModule, InrCurrencyPipe, PreLoaderComponent, MapComponent],
  templateUrl: './dashboard-map-section.component.html',
  styleUrl: './dashboard-map-section.component.scss',
})
export class DashboardMapSectionComponent implements OnDestroy, OnInit {
  @ViewChild('map') mapComponent!: MapComponent;
  resetMap(): void {
    this.mapComponent?.resetMap();
    this.onSelectingStateFromDropDown({ _id: '', name: '' });
    this.updateDropdownStateSelection({ _id: '', name: '' });
    this.myForm.get('ulb')?.setValue('');

    // this.selectedStateCode = '';
    // this.stateIdControl.setValue('');
    // this.selected_state = '';
  }
  myForm!: FormGroup;
  stateUlbData = JSON.parse(localStorage.getItem('ulbList') || 'null');
  // selectedDistrictCode: any;
  selectedStateCode!: string;
  // @Input()
  // mapConfig = {
  //   code: {
  //     state: "",
  //     city: "",
  //   },
  //   showStateList: false,
  //   showDistrictList: false,
  //   stateMapContainerHeight: "23rem",
  //   nationalZoomOnMobile: 4, // will fit map in container
  //   nationalZoomOnWeb: 4.4, // will fit map in container
  //   stateZoomOnMobile: 4, // will fit map in container
  //   stateZoomOnWeb: 4, // will fit map in container
  //   stateBlockHeight: "23.5rem", // will fit map in container
  // };
  yearSelected = [];
  selected_state = '';
  stateselected!: IState;
  creditRating: any = {};
  stateList!: IState[];
  filteredStates: Observable<any[]> = of([]);
  // statesLayer!: L.GeoJSON<any>;
  cityData: any = [];
  cityName = '';
  dropdownSettings = {
    singleSelection: true,
    text: 'India',
    enableSearchFilter: true,
    labelKey: 'name',
    primaryKey: '_id',
    showCheckbox: false,
    classes: 'homepage-stateList custom-class',
  };
  // districtMarkerMap: any = {};

  national: any = { _id: null, name: 'India' };
  actStateVl: boolean = true;

  filteredUlbs!: Observable<any[]>;
  isProcessingCompleted: any;
  // stateLayers: any;
  // nationalLevelMap!: L.Map;
  queryParams: any;
  stateData: any;
  // mouseHoverOnState!: null;
  // isMapOnMiniMapMode: any;
  userUtil = new UserUtility();
  // newDashboardstateColorStyle: PathOptions | StyleFunction<any> | undefined;
  // blueIcon: any;
  // mouseHoveredOnULB: any;
  // isNationalMapToDistroctMapInProcess: any;
  constructor(
    protected _commonService: CommonService,
    protected _snackbar: MatSnackBar,
    protected _geoService: GeographicalService,
    protected _activateRoute: ActivatedRoute,
    private fb: FormBuilder,
    private _ngZone: NgZone,
    private assetService: AssetsService,
    private router: Router,
    private authService: AuthService,
  ) {
    // super(_commonService, _snackbar, _geoService, _activateRoute);
    setTimeout(() => {
      // this.ngOnChanges({
      //   yearSelected: {
      //     currentValue: ["2016-17"],
      //     previousValue: null,
      //     firstChange: true,
      //     isFirstChange: () => true,
      //   },
      // });
    }, 1000);
    this.initializeform();
    // this.fetchStateList();
    this.fetchDataForVisualization();
    // this.fetchDataForVisualization();
    this.fetchCreditRatingTotalCount();
    this.fetchBondIssueAmout();
    this.fetchMinMaxFinancialYears();
  }

  dataForVisualization: {
    financialStatements?: number;
    totalMunicipalBonds?: number;
    totalULB?: number;
    coveredUlbCount?: number;
    ulbDataCount?: any;
    loading: boolean;
  } = { loading: true };
  // previousStateLayer!: ILeafletStateClickEvent["sourceTarget"] | L.Layer;
  totalUsersVisit: number = 0;

  absCreditInfo: any = {};
  isLoading: boolean = true;
  cid: string = '';
  creditRatingList!: any[];
  globalFormControl = new FormControl();

  // Including A
  creditRatingAboveA: any;

  // Including BBB-
  creditRatingAboveBBB_Minus: any;

  bondIssueAmount!: number;
  isBondIssueAmountInProgress = false;

  financialYearTexts!: {
    min: string;
    max: string;
  };
  // StyleForSelectedState = {
  //   weight: 2,
  //   color: "black",
  //   fillOpacity: 1,
  // };
  // defaultStateLayerColorOption = {
  //   fillColor: "#efefef",
  //   weight: 1,
  //   opacity: 1,
  //   color: "#403f3f",
  //   fillOpacity: 1,
  // };
  date: any;
  districtMap!: L.Map;
  highestYear: any;
  highestDataAvailability: any;
  dataAvailTooltip = '';
  private homePageSubscription!: Subscription;
  ngOnDestroy(): void {
    this.homePageSubscription?.unsubscribe();
    // let mapReferenceList = ['districtMap'];
    // for (const item of mapReferenceList) {
    //   MapUtil.destroy(this[item]);
    // };
  }
  ngOnInit(): void {
    // this.clearDistrictMapContainer();
    this.fetchStateList();

    this._commonService.state_name_data.subscribe((res: any) => {
      //console.log('sub....', res, res.name);
      this.onSelectingStateFromDropDown(res);
      this.updateDropdownStateSelection(res);
    });

    this.authService.getLastUpdated().subscribe((res: { [x: string]: any }) => {
      this.date = res['data'];
    });
    this.searchUlb();
  }

  get stateIdControl(): FormControl {
    return this.myForm.get('stateId') as FormControl;
  }

  private _filterStates(value: string): any[] {
    // console.log("value = ", value)
    const filterValue = value?.toLowerCase();
    return !filterValue
      ? this.stateList
      : this.stateList?.filter((option) => option.name?.toLowerCase().includes(filterValue));
  }

  noDataFound = true;

  searchUlb() {
    this.myForm
      .get('ulb')
      ?.valueChanges?.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((value) => {
          if (!value) {
            this.noDataFound = false;
            return of([]);
          }

          const stateId = this.stateList.find(
            (e) => e?.name.toLowerCase() == this.selected_state.toLowerCase(),
          )?._id;
          return this._commonService.postGlobalSearchData(value, 'ulb', stateId);
        }),
      )
      .subscribe({
        next: (res: any) => {
          this.filteredUlbs = of(res?.['data']);
          this.noDataFound = res?.['data']?.length === 0;
        },
        error: (error) => {
          console.error('Error in fetching ulbs: ', error);
        },
      });
  }

  // callAPI(event: { target: { value: any; }; }) {
  // callAPI(event: KeyboardEvent) {
  //   const input = event.target as HTMLInputElement;
  //   const value = input.value;

  //   console.log("value = ", value);

  //   if (!event) return;
  // if (!event.target) return;
  // this._commonService
  //   .postGlobalSearchData(event?.target?.value, "ulb", this.selectedStateCode)
  //   .subscribe((res: any) => {
  //     const emptyArr: any = [];
  //     this.filteredUlbs = emptyArr;
  //     if (res?.data.length > 0) {
  //       this.filteredUlbs = res?.data;
  //       this.noDataFound = false;
  //     } else {
  //       const emptyArr: any = [];
  //       this.filteredUlbs = emptyArr;
  //       this.noDataFound = true;
  //       const noDataFoundObj = {
  //         name: "",
  //         id: "",
  //         type: "",
  //       };
  //     }
  //   }
  // );
  // }

  private initializeform() {
    this.myForm = this.fb.group({
      stateId: [''],
      ulb: [''],
    });
  }
  private fetchMinMaxFinancialYears() {
    this._commonService.getFinancialYearBasedOnData().subscribe((res: { data: string | any[] }) => {
      this.financialYearTexts = {
        min: res.data[0],
        max: res.data[res.data.length - 1].slice(2),
      };
    });
  }
  stateDim = false;
  stateLevelData() {
    this.stateDim = false;
  }
  cityInfo: any;
  cityLevelData() {
    this.stateDim = true;
  }

  dashboardNav(option: any) {
    this.selectCity(option);
  }
  // createNationalLevelMap(
  //   geoData: FeatureCollection<
  //     Geometry,
  //     {
  //       [name: string]: any;
  //     }
  //   >,
  //   containerId: string
  // ) {
  //   this.isLoading = true;
  //   this.isProcessingCompleted.emit(false);
  //   let zoom;
  //   if (window.innerWidth > 1050) zoom = this.mapConfig.nationalZoomOnWeb;
  //   else zoom = this.mapConfig.nationalZoomOnMobile;
  //   // let vw = Math.max(document.documentElement.clientWidth);
  //   // vw = (vw - 1366) / 1366;
  //   // let zoom = 4 + vw;
  //   // if (this.userUtil.isUserOnMobile()) {
  //   //   zoom = 3.5 + (window.devicePixelRatio - 2) / 10;
  //   //   if (window.innerHeight < 600) zoom = 3.6;
  //   //   const valueOf1vh = this.calculateVH(1);
  //   //   if (valueOf1vh < 5) zoom = 3;
  //   //   else if (valueOf1vh < 7) zoom = zoom - 0.2;
  //   //   // return zoom;
  //   // }

  //   const configuration: IMapCreationConfig = {
  //     containerId,
  //     geoData,
  //     options: {
  //       zoom,
  //       maxZoom: zoom,
  //       minZoom: zoom,
  //       attributionControl: false,
  //       doubleClickZoom: false,
  //       dragging: false,
  //       // tap: false,
  //     },
  //   };
  //   let map: L.Map;

  //   ({ stateLayers: this.stateLayers, map } =
  //     MapUtil.createDefaultNationalMap(configuration));

  //   this.nationalLevelMap = map;

  //   // this.createLegendsForNationalLevelMap();
  //   // this.createControls(this.nationalLevelMap);

  //   // this.initializeNationalLevelMapLayer(this.stateLayers);

  //   // // Prepare to auto select state from query Params.
  //   // let stateToAutoSelect: IStateULBCovered;
  //   // let layerToAutoSelect;
  //   // if (this.queryParams.state) {
  //   //   const stateFound = this.stateData.find(
  //   //     (state: { _id: any; }) => state._id === this.queryParams.state
  //   //   );
  //   //   // if (stateFound) stateToAutoSelect = stateFound;
  //   // }

  //   // this.stateLayers.eachLayer((layer: any) => {
  //   //   if (stateToAutoSelect) {
  //   //     if (MapUtil.getStateName(layer) === stateToAutoSelect.name) {
  //   //       layerToAutoSelect = { sourceTarget: layer };
  //   //     }
  //   //   }
  //   //   (layer as any).bringToBack();
  //   //   (layer as any).on({
  //   //     mouseover: () => this.createTooltip(layer, this.stateLayers),
  //   //     click: (args: ILeafletStateClickEvent) => {
  //   //       this.selectedStateCode = args.sourceTarget.feature.properties.ST_CODE;
  //   //       this.onStateLayerClick(args, true, false);
  //   //     },
  //   //     mouseout: () => (this.mouseHoverOnState = null),
  //   //   });
  //   // });

  //   /**
  //    * @description If the map is already on mini mode, then it means the state is already selected, and its state map
  //    * is in the view.
  //    */

  //   // if (layerToAutoSelect && !this.isMapOnMiniMapMode) {
  //   //   this.onStateLayerClick(layerToAutoSelect);
  //   //   this.isLoading = false;
  //   // }
  //   // this.hideMapLegends();

  //   // if (this.isMapOnMiniMapMode) {
  //   //   this.hideMapLegends();
  //   //   this.showStateLayerOnlyFor(
  //   //     this.nationalLevelMap,
  //   //     this.currentStateInView
  //   //   );
  //   // }

  //   this.isProcessingCompleted.emit(true);
  // }

  // showMapLegends() {
  //   console.warn("show legends hidden");
  // }

  // clearDistrictMapContainer() {
  //   if (this.districtMap) {
  //     this.districtMap.off();
  //     this.districtMap.remove();
  //   }
  //   // const height = this.userUtil.isUserOnMobile() ? `100%` : "80vh";
  //   const height = this.userUtil.isUserOnMobile() ? `100%` : "inherit";
  //   // const height = `100%`;
  //   const element = document.getElementById("districtMapContainer");
  //   //   (document.getElementById("districtMapContainer") as HTMLElement).innerHTML = `
  //   //     <div
  //   //   id="districtMapId"
  //   //   class="col-sm-12"
  //   //   style="background-color: #F8F9FF; background-image: url('../../../../assets/Layer\ 1.png');
  //   //   display: inline-block; width: 100%;height: ${height};"
  //   // >
  //   // </div>`;
  // }

  // createDistrictMap(
  //   districtGeoJSON: GeoJsonObject | GeoJsonObject[] | null | undefined,
  //   options: {
  //     center: ILeafletStateClickEvent["latlng"];
  //     dataPoints: {
  //       lat: string;
  //       lng: string;
  //       name: string;
  //       area: number;
  //       population: number;
  //       auditStatus: ULBWithMapData["auditStatus"];
  //     }[];
  //   }
  // ) {
  //   console.log("json", districtGeoJSON);
  //   if (this.districtMap) {
  //     return;
  //   }
  //   // this.clearDistrictMapContainer();

  //   setTimeout(() => {
  //     let vw = Math.max(document.documentElement.clientWidth);
  //     vw = (vw - 1366) / 1366;
  //     let zoom = 5.5 + vw;
  //     if (this.userUtil.isUserOnMobile()) {
  //       zoom = 5.5;
  //     }

  //     zoom = 5.5;

  //     const districtMap = L.map("districtMapId", {
  //       scrollWheelZoom: false,
  //       fadeAnimation: true,
  //       minZoom: zoom,
  //       maxZoom: zoom + 2,
  //       // maxZoom: zoom,
  //       zoomControl: false,
  //       keyboard: true,
  //       attributionControl: true,
  //       doubleClickZoom: false,
  //       dragging: false,
  //       // tap: true,
  //     }).setView([options.center.lat, options.center.lng], 4);
  //     // districtMap.touchZoom.disable();
  //     // districtMap.doubleClickZoom.disable();
  //     districtMap.scrollWheelZoom.disable();
  //     // districtMap.boxZoom.disable();
  //     // districtMap.keyboard.disable();
  //     // districtMap.dragging.disable();

  //     const districtLayer = L.geoJSON(districtGeoJSON, {
  //       style: this.newDashboardstateColorStyle,
  //     }).addTo(districtMap);

  //     if (districtLayer) {
  //       districtMap.fitBounds(districtLayer.getBounds());
  //     }
  //     this.districtMap = districtMap;

  //     // options.dataPoints.forEach((dataPoint: any) => {
  //     //   /* Creating a popup without a close button.
  //     //   * available option are {closeOnClick: false, closeButton: true, autoClose: true }
  //     //   * if you know other option too please add into this object for future reference
  //     //   */
  //     //   const popup = L.popup({ closeButton: false, autoClose: true }).setContent(`${this._commonService.createCityTooltip(dataPoint)}`);
  //     //   const marker = this.createDistrictMarker({
  //     //     ...dataPoint,
  //     //     icon: this.blueIcon,
  //     //   }).addTo(districtMap)
  //     //     .bindPopup(popup);

  //     //   /* Adding a mouseover and mouseout event to the marker. */
  //     //   marker.on({
  //     //     mouseover: () => {
  //     //       this.mouseHoveredOnULB = dataPoint;
  //     //       marker.openPopup();
  //     //     }
  //     //   });
  //     //   marker.on({
  //     //     mouseout: () => {
  //     //       this.mouseHoveredOnULB = null;
  //     //       marker.closePopup();
  //     //     }
  //     //   });

  //     //   /* Setting the mouseHoveredOnULB property of the component to the dataPoint object. */
  //     //   // marker.on("mouseover", () => (this.mouseHoveredOnULB = dataPoint));
  //     //   // marker.on("mouseout", () => (this.mouseHoveredOnULB = null));
  //     //   marker.on("click", (values: LeafletMouseEvent) => {
  //     //     let city;
  //     //     if (values["latlng"])
  //     //       city = this.stateUlbData.data[this.selectedStateCode].ulbs.find(
  //     //         (value: { location: { lat: string | number; lng: string | number; }; }) =>
  //     //           +value.location.lat === values["latlng"].lat &&
  //     //           +value.location.lng === values["latlng"].lng
  //     //       );
  //     //     if (city) {
  //     //       this.selectedDistrictCode = city.code;
  //     //       this.selectCity(city.code, false);
  //     //     }
  //     //     this.onDistrictMarkerClick(<L.LeafletMouseEvent>values, marker);
  //     //   });
  //     //   this.districtMarkerMap[dataPoint.code] = marker;
  //     // });
  //   }, 0.5);

  // }
  // // createDistrictMarker(arg0: any) {
  // //   throw new Error('Method not implemented.');
  // // }
  // onDistrictMarkerClick(arg0: L.LeafletMouseEvent, marker: any) {
  //   throw new Error('Method not implemented.');
  // }

  cidChange(ulbId: string): void {
    // console.log('ulb id from change: ', ulbId);
    const ulbData = this.cityData?.find((e: { _id: string }) => e?._id === ulbId);
    this.myForm.get('ulb')?.setValue(ulbData?.name);
    this.selectCity(ulbData?.code || '');
  }

  selectCity(city: any, fireEvent = true) {
    // console.log('city from select city: ', city);
    const filterCity: any = this.cityData.find((e: any) => {
      return e.code == city;
    });
    this.cityName = filterCity.name;
    this.stateDim = true;
    this.cid = filterCity._id;
    // console.log("cityId", this.cid, filterCity, this.districtMarkerMap); //CityId after selecting a city from dropdown
    // if (fireEvent) this.districtMarkerMap[filterCity.code].fireEvent("click");
    // console.log("city name", city, filterCity);
    this.authService.getCityData(this.cid).subscribe((res: { [x: string]: any }) => {
      this.cityInfo = res['data'];
    });
    // this.onSelectingULBFromDropdown(city);
  }
  viewDashboard() {
    const searchValue = this.stateList.find(
      (e) => e?.name.toLowerCase() == this.selected_state.toLowerCase(),
    );
    this.router.navigateByUrl(`/dashboard/state?stateId=${searchValue?._id}`);
  }
  viewCityDashboard() {
    this.router.navigateByUrl(`/dashboard/city?cityId=${this.cid}`);
  }
  private fetchBondIssueAmout(stateId?: string) {
    this.isBondIssueAmountInProgress = true;
    this._commonService.getBondIssuerItemAmount(stateId).subscribe((res: any) => {
      try {
        this.bondIssueAmount = Math.round(res['data'][0]['totalAmount']);
      } catch (error) {
        this.bondIssueAmount = 0;
      }
      this.isBondIssueAmountInProgress = false;
    });
  }
  selectedStateCodeChange(stateCode: string) {
    const stateData = this.stateList.find((ele) => ele.code === stateCode);
    if (stateData) {
      this.updateDropdownStateSelection(stateData);
      this.onSelectingStateFromDropDown(stateData);
    }
  }
  onSelectingStateFromDropDown(state: any | null) {
    // console.log('on state click = ', state, this.filteredStates);
    // if (this.districtMap) {
    //   MapUtil.destroy(this.districtMap);
    // }
    this.selectedStateCode = state.code;
    this.cityName = '';
    this.cid = '';
    this.stateDim = false;
    this._commonService.getUlbByState(state ? state?.code : null).subscribe((res: any) => {
      const ulbsData: any = res;
      this.cityData = ulbsData?.data?.ulbs;
      // console.log("AllCity", this.cityData);
    });
    this.selected_state = state ? state?.name : 'India';
    /* Updating the dropdown state selection. */
    this.showCreditInfoByState(this.selected_state);
    if (state._id == null) this.updateDropdownStateSelection(state);
    // if (this.selected_state === "India" && this.isMapOnMiniMapMode) {
    //   const element = document.getElementById(this.createdDomMinId) as HTMLElement;
    //   element.style.display = "block";

    //   // this.resetMapToNationalLevel();
    //   // this.initializeNationalLevelMapLayer(this.stateLayers);
    // }
    // this.stateselected = state;
    this.fetchDataForVisualization(state ? state._id : null);
    this
      .fetchBondIssueAmout
      // this.stateselected ? this.stateselected._id : null
      ();
    // this.selectStateOnMap(state);
  }
  // createdDomMinId: any;
  // resetMapToNationalLevel: any;

  // private selectStateOnMap(state?: IState) {
  //   if (this.previousStateLayer) {
  //     // this.resetStateLayer(this.previousStateLayer);
  //     // this.previousStateLayer = null;
  //   }
  //   if (!state) {
  //     return;
  //   }
  //   this.stateLayers?.eachLayer((layer: any) => {
  //     const layerName = MapUtil.getStateName(layer);
  //     if (layerName !== state.name) {
  //       return;
  //     }
  //     this.previousStateLayer = layer;
  //     this.higlightClickedState(layer);
  //   });
  // }

  // onStateLayerClick(
  //   args: ILeafletStateClickEvent,
  //   showMiniMap = true,
  //   skipOndropDownSelect = true
  // ) {
  //   console.log("aggs.", args);
  //   this.isProcessingCompleted.emit(false);
  //   if (this.isNationalMapToDistroctMapInProcess) {
  //     return;
  //   }
  //   this.isNationalMapToDistroctMapInProcess = setTimeout(() => {
  //     try {
  //       this.onClickingState(args, showMiniMap, skipOndropDownSelect);
  //     } catch (error) {
  //       this.mouseHoverOnState = null;
  //       /**
  //        * This error will generally occur when you change the year (dont close the year dropdown) and then click on the state.
  //        */
  //       console.error(error);
  //     }
  //     setTimeout(() => {
  //       this.isNationalMapToDistroctMapInProcess = null;
  //       this.isProcessingCompleted.emit(true);
  //     }, 0);
  //   }, 1);
  // }
  // onClickingState(args: ILeafletStateClickEvent, showMiniMap: boolean, skipOndropDownSelect: boolean) {
  //   throw new Error('Method not implemented.');
  // }

  // private higlightClickedState(stateLayer: { setStyle: (arg0: { fillColor: string; fillOpacity: number; }) => void; }) {
  //   const currentUrl = window.location.pathname;
  //   const obj: any = {
  //     containerPoint: {},
  //     latlng: {
  //       // lat: 23.48789594497792,
  //       // lng: 78.2647891998273
  //     },
  //     layerPoint: {},
  //     originalEvent: {},
  //     sourceTarget: stateLayer,
  //     target: stateLayer,
  //     type: "click",
  //   };
  //   if (currentUrl == "/home") {
  //     this.onStateLayerClick(obj);

  //     stateLayer.setStyle({
  //       fillColor: "#3E5DB1",
  //       fillOpacity: 1,
  //     });
  //   }
  //   // stateLayer.setStyle(this.StyleForSelectedState);
  //   // if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
  //   //   stateLayer.bringToFront();
  //   // }
  // }
  // private resetStateLayer(layer: { setStyle: (arg0: { color: string; weight: number; }) => void; closeTooltip: () => void; }) {
  //   layer.setStyle({
  //     color: this.defaultStateLayerColorOption.color,
  //     weight: this.defaultStateLayerColorOption.weight,
  //   });
  //   layer.closeTooltip();
  // }

  private fetchStateList() {
    this._commonService.fetchStateList().subscribe((res: any) => {
      this.stateList = this._commonService.sortDataSource(res, 'name');

      this.filteredStates = this.stateIdControl.valueChanges.pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        map((value) => this._filterStates(value || '')),
      );
    });
  }

  private fetchDataForVisualization(stateId?: string) {
    this.dataForVisualization.loading = true;
    this.homePageSubscription?.unsubscribe();
    this.homePageSubscription = this._commonService
      .fetchDataForHomepageMap(stateId)
      .subscribe(
        (res: {
          financialStatements?: number;
          totalMunicipalBonds?: number;
          totalULB?: number;
          coveredUlbCount?: number;
          ulbDataCount?: any;
          loading: boolean;
        }) => {
          this.setDefaultAbsCreditInfo();

          this.showCreditInfoByState(this.stateselected ? this.stateselected.name : '');
          this.dataForVisualization = { ...res, loading: false };
          if (!stateId) {
            this._commonService.setDataForVisualizationCount(this.dataForVisualization);
          }
          this.highestYear = null;
          this.highestDataAvailability = null;
          if (this.dataForVisualization?.ulbDataCount?.length > 0) {
            // +yearA.split("-")[0] - +yearB.split("-")[0]
            // this.dataForVisualization.ulbDataCount = this.dataForVisualization?.ulbDataCount?.sort((a, b) => parseFloat(b.ulbs) - parseFloat(a.ulbs));
            this.dataForVisualization.ulbDataCount = this.dataForVisualization?.ulbDataCount?.sort(
              (a: { year: string }, b: { year: string }) =>
                +a?.year.split('-')[0] - +b?.year.split('-')[0],
            );
            const ublsArray = this.dataForVisualization?.ulbDataCount;
            let highestData = -1;
            for (const item of ublsArray) {
              if (item.ulbs > highestData) {
                highestData = item?.ulbs;
                this.highestYear = item?.year;
              }
            }
            this.highestDataAvailability = (
              (+highestData / +Number(this.dataForVisualization?.totalULB)) *
              100
            ).toFixed(0);
            // this.highestYear = this.dataForVisualization?.ulbDataCount[0]?.year;
            // this.highestDataAvailability = ((this.dataForVisualization?.ulbDataCount[0]?.ulbs / this.dataForVisualization?.totalULB) * 100).toFixed(0);
          }
          this.dataAvailTooltip = '';
          this.dataForVisualization?.ulbDataCount?.forEach((element: { year: any; ulbs: any }) => {
            this.dataAvailTooltip = this.dataAvailTooltip + `${element.year} : ${element.ulbs} \n `;
          });
          // this._ngZone.runOutsideAngular(() => {
          //   setTimeout(() => {
          //     this.animateValues(1);
          //   });
          // });
        },
      );
  }
  setDefaultAbsCreditInfo() {
    this.absCreditInfo = {
      title: '',
      ulbs: 0,
      creditRatingUlbs: 0,
      ratings: {
        'AAA+': 0,
        AAA: 0,
        'AAA-': 0,
        'AA+': 0,
        AA: 0,
        'AA-': 0,
        'A+': 0,
        A: 0,
        'A-': 0,
        'BBB+': 0,
        BBB: 0,
        'BBB-': 0,
        BB: 0,
        'BB+': 0,
        'BB-': 0,
        'B+': 0,
        B: 0,
        'B-': 0,
        'C+': 0,
        C: 0,
        'C-': 0,
        'D+': 0,
        D: 0,
        'D-': 0,
      },
    };
  }
  // public animateValues = (startiongValue?: number) => {
  //   const speed = 1000;
  //   const interval = this.isMapAtNationalLevel() ? 5 : 1;

  //   const animateValues = document.querySelectorAll(
  //     "[data-animate-value]"
  //   ) as any as Array<HTMLElement>;

  //   animateValues.forEach((element: HTMLElement) => {
  //     const target = Number(element.getAttribute("data-animate-value"));

  //     const currentValue = +element.innerText;
  //     if (startiongValue !== null && startiongValue !== undefined) {
  //       element.innerText = `0`;
  //       this._ngZone.runOutsideAngular(() => {
  //         setTimeout(() => {
  //           setTimeout(this.animateValues, interval);
  //         });
  //       });
  //       return;
  //     }

  //     if (currentValue >= target) {
  //       return;
  //     }

  //     let incrementor = +Number(target / speed);
  //     incrementor = incrementor === 0 ? target : incrementor;

  //     // NOTE Need to re do it.
  //     incrementor = 2;
  //     if (currentValue < target) {
  //       const newValue = +Number(currentValue + incrementor).toFixed(1);
  //       element.innerText = `${newValue > target ? target : newValue}`;
  //       this._ngZone.runOutsideAngular(() => {
  //         setTimeout(() => {
  //           setTimeout(this.animateValues, interval);
  //         });
  //       });
  //     } else {
  //       element.innerText = `${target}`;
  //     }
  //   });
  // };
  showCreditInfoByState(stateName = '') {
    // console.log({ stateName });
    const ulbList = [];
    if (stateName && stateName != 'India') {
      for (let i = 0; i < this.creditRatingList?.length; i++) {
        const ulb = this.creditRatingList[i];

        if (ulb.state.toLowerCase() == stateName.toLowerCase()) {
          ulbList.push(ulb['ulb']);
          const rating = ulb.creditrating.trim();
          this.calculateRatings(this.absCreditInfo, rating);
        }
      }
    } else {
      for (let i = 0; i < this.creditRatingList?.length; i++) {
        const ulb = this.creditRatingList[i];
        ulbList.push(ulb['ulb']);
        const rating = ulb.creditrating.trim();
        this.calculateRatings(this.absCreditInfo, rating);
      }
    }
    this.creditRatingAboveA =
      this.absCreditInfo['ratings']['A'] +
      this.absCreditInfo['ratings']['A+'] +
      this.absCreditInfo['ratings']['AA'] +
      this.absCreditInfo['ratings']['AA+'] +
      this.absCreditInfo['ratings']['AA-'] +
      this.absCreditInfo['ratings']['AAA'] +
      this.absCreditInfo['ratings']['AAA+'] +
      this.absCreditInfo['ratings']['AAA-'];

    this.creditRatingAboveBBB_Minus =
      this.creditRatingAboveA +
      this.absCreditInfo['ratings']['A-'] +
      this.absCreditInfo['ratings']['BBB'] +
      this.absCreditInfo['ratings']['BBB+'] +
      this.absCreditInfo['ratings']['BBB-'];

    this.absCreditInfo['title'] = stateName || 'India';
    this.absCreditInfo['ulbs'] = ulbList;

    // console.log(
    //   "this.creditRatingAboveA",
    //   this.creditRatingAboveA,
    //   this.creditRatingAboveBBB_Minus
    // );
  }

  calculateRatings(dataObject: { [x: string]: number }, ratingValue: string | number) {
    // if (!dataObject["ratings"][ratingValue]) {
    //   dataObject["ratings"][ratingValue] = 0;
    // }
    // dataObject["ratings"][ratingValue] = dataObject["ratings"][ratingValue] + 1;
    // dataObject["creditRatingUlbs"] = dataObject["creditRatingUlbs"] + 1;
    return dataObject;
  }
  // private isMapAtNationalLevel() {
  //   return this.stateselected ? false : true;
  // }
  private updateDropdownStateSelection(state: IState) {
    this.stateselected = state;
    this.myForm.controls['stateId'].setValue(state ? state.name : '');
  }
  private fetchCreditRatingTotalCount() {
    this.assetService
      .fetchCreditRatingReport()
      .subscribe((res: ICreditRatingData[]) => this.computeStatesTotalRatings(res));
  }
  private computeStatesTotalRatings(res: ICreditRatingData[]) {
    this.creditRatingList = res;

    const computedData: any = { total: 0, India: 0 };
    res.forEach((data) => {
      if (computedData[data.state] || computedData[data.state] === 0) {
        computedData[data.state] += 1;
      } else {
        computedData[data.state] = 1;
      }
      computedData.total += 1;
      computedData['India'] += 1;
    });

    this.creditRating = computedData;
  }
  openStateDashboard(event: any) {
    this.router.navigateByUrl(`/dashboard/state?stateCode=${this.selectedStateCode}`);
  }
}
