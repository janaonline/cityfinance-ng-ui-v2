import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { FeatureCollection, Geometry } from 'geojson';
import * as L from 'leaflet';

import { IState } from '../../../core/models/state/state';
import { IStateULBCovered } from '../../../core/models/stateUlbConvered';
import { USER_TYPE } from '../../../core/models/user/userType';
import { CommonService } from '../../../core/services/common.service';
import { GeographicalService } from '../../../core/services/geographical/geographical.service';
import { GlobalLoaderService } from '../../../core/services/loaders/global-loader.service';
import { MapUtil } from '../../../core/util/map/mapUtil';
import { IMapCreationConfig } from '../../../core/util/map/models/mapCreationConfig';
import { MaterialModule } from '../../../material.module';
import { PreLoaderComponent } from '../../../shared/components/pre-loader/pre-loader.component';
import { ILeafletStateClickEvent } from '../../../shared/components/re-useable-heat-map/models/leafletStateClickEvent';
import { NationalHeatMapComponent } from '../../../shared/components/re-useable-heat-map/national-heat-map/national-heat-map.component';
import { FiscalRankingService, MapData } from '../services/fiscal-ranking.service';
import { NationalMapSectionService } from '../services/national-map-section.service';

export interface ColorDetails {
  color: string,
  text: string,
  min: number,
  max: number
}

export interface Marker {
  lat: number,
  lng: number,
  name: string
}

@Component({
  selector: 'app-india-map',
  templateUrl: './india-map.component.html',
  styleUrls: ['./india-map.component.scss'],
  standalone: true,
  imports: [MaterialModule, NationalHeatMapComponent, PreLoaderComponent]
})
export class IndiaMapComponent extends NationalHeatMapComponent implements AfterViewInit {
  @Output() onStateChange = new EventEmitter();
  @Input() label: string = '';
  @Input() identifier: string = '';
  @Input() mapData!: MapData;
  @Input() markers: Marker[] = [];
  @Input() colorCoding: any = [];
  @Input() colorDetails!: ColorDetails[];
  override randomNumber: any = 0;

  override nationalLevelMap: any;
  selected_state = "India";
  stateselected!: IState;
  stateList!: IState[];
  previousStateLayer: ILeafletStateClickEvent["sourceTarget"] | L.Layer | null = null;
  tableData: any;
  myForm!: FormGroup;
  selectedStateCode: any;
  nationalInput: any = {
    financialYear: "2020-21",
    stateId: "",
    populationCat: true,
    ulbType: "",
  };
  AvailabilityTitle: string = "India";
  showLoader: boolean = true;
  dataAvailabilityvalue!: number;
  isLoading: boolean = true;
  mapConfig = {
    code: {
      state: "",
      city: "",
    },
    showStateList: false,
    showDistrictList: false,
    stateMapContainerHeight: "23rem",
    nationalZoomOnMobile: 3.9, // will fit map in container
    nationalZoomOnWeb: 4.2, // will fit map in container
    stateZoomOnMobile: 4, // will fit map in container
    stateZoomOnWeb: 4, // will fit map in container
    stateBlockHeight: "23.5rem", // will fit map in container
  };
  currentStateId: any = "";
  financialYearList: any = [];
  override StatesJSONForMapCreation: any;
  national: any = { _id: "", name: "India" };
  currentId: any;



  constructor(
    protected override _commonService: CommonService,
    protected override _snackbar: MatSnackBar,
    protected override _geoService: GeographicalService,
    protected override _activateRoute: ActivatedRoute,
    private fb: FormBuilder,
    private nationalMapService: NationalMapSectionService,
    private fiscalRankingService: FiscalRankingService,
    private _loaderService: GlobalLoaderService
  ) {
    super(_commonService, _snackbar, _geoService, _activateRoute);
    setTimeout(() => {
      this.ngOnChanges({
        yearSelected: {
          currentValue: ["2016-17"],
          previousValue: null,
          firstChange: true,
          isFirstChange: () => true,
        },
      });
    }, 1000);
    this.initializeform();
    this.fetchStateList();
  }

  // ngAfterViewInit(): void {

  // }

  ngAfterViewInit(): void {
    this.initializeNationalLevelMapLayer(this.stateLayers);
    this.createNationalLevelMap(
      this.StatesJSONForMapCreation,
      this.currentId
    );
    this.clearDistrictMapContainer();
    this.randomNumber = Math.round(Math.random());
    this.getFinancialYearList();
    this.getNationalTableData();
    this.loadData();
    this.createNationalMapJson();
  }

  createLegends() {
    const legend = new L.Control({ position: 'bottomleft' });
    const labels: any[] = [
      // `<span style="width: 100%; display: block; font-size: 12px" class="text-center">${this.label}</span>`,
    ];
    const colorDetails = this.colorDetails;
    legend.onAdd = map => {
      const div = L.DomUtil.create("div", "info legend");
      div.id = "legendContainer";
      div.style.width = "100%";
      colorDetails?.forEach((value) => {
        labels.push(
          `<div>
            <i class="circle" style="background: ${value.color}; padding:6px; display: inline-block; margin-right: 12%; "> </i> 
            ${value.text}
            </div>`
        );
      });

      const labelString = labels.join(``);


      div.innerHTML = `
        ${this?.label ? `<div class="heading text-start mb-3">${this?.label}</div>` : ''}
        <div class="indicator-items">${labelString}</div>
      `;
      return div;
    };
    legend.addTo(this.nationalLevelMap);
  }

  createNationalMapJson() {
    const promise = this._geoService.loadConvertedIndiaGeoData().toPromise();
    promise.then((data) => (this.StatesJSONForMapCreation = data));
    return Promise.all([promise]);
  }

  getNationalLevelMapData(year: any) {
    this.nationalMapService.getNationalMapData(year).subscribe((res: any) => {
      if (!res) return;
      this.colorCoding = res?.data;
      this.initializeNationalLevelMapLayer(this.stateLayers);
      this.createNationalLevelMap(
        this.StatesJSONForMapCreation,
        this.currentId
      );
    });
  }

  getColor(value: any) {
    return this.colorDetails?.find(item => value >= item.min && value <= item.max)?.color || "#F3FAFF";
  }

  getNationalTableData() {
    this.showLoader = true;
    this._loaderService.showLoader();
    this.nationalMapService.getNationalData(this.nationalInput).subscribe((res: any) => {
      this._loaderService.stopLoader();
      this.showLoader = false;
      this.tableData = res?.data;
      this.dataAvailabilityvalue = Math.round(res?.dataAvailability);
      sessionStorage.setItem("dataAvail", res.dataAvailability);
      this.nationalMapService.setDataAvailabilityValue({
        data: res.dataAvailability,
      });
    }, err => {
      this.showLoader = false;
    });
  }
  private initializeform() {
    this.myForm = this.fb.group({ stateId: [""] });
  }

  get isState() {
    return this.userUtil.getUserType() == USER_TYPE.STATE;
  }

  override createNationalLevelMap(
    geoData: FeatureCollection<
      Geometry,
      {
        [name: string]: any;
      }
    >,
    containerId: string
  ) {
    if (containerId && this.userUtil.getUserType() == USER_TYPE.STATE) {
      const preSelectedState = this.stateList?.find(state => state._id == this.userUtil.getLoggedInUserDetails()?.state);
      if (preSelectedState) {
        this.onSelectingStateFromDropDown(preSelectedState);
      }
    }


    this.currentId = containerId;
    this.isLoading = true;
    let zoom;
    if (window.innerWidth > 1050) zoom = this.mapConfig.nationalZoomOnWeb;
    else zoom = this.mapConfig.nationalZoomOnMobile;
    const configuration: IMapCreationConfig = {
      containerId,
      geoData,
      options: {
        zoom,
        maxZoom: zoom,
        minZoom: zoom,
        attributionControl: false,
        doubleClickZoom: false,
        dragging: false,
        // tap: false,
      },
    };
    let map: L.Map;
    ({ stateLayers: this.stateLayers, map } =
      MapUtil.createDefaultNationalMap(configuration));

    this.nationalLevelMap = map;
    this.createControls(this.nationalLevelMap);
    this.createLegends();

    let stateToAutoSelect: IStateULBCovered;
    let layerToAutoSelect;
    const stateFound = this.stateData.find(state => state._id === this.queryParams?.state);
    if (this.queryParams.state && stateFound) stateToAutoSelect = stateFound;

    this.stateLayers.eachLayer((layer) => {
      if (stateToAutoSelect) {
        if (MapUtil.getStateName(layer) === stateToAutoSelect.name) {
          layerToAutoSelect = { sourceTarget: layer };
        }
      }
      (layer as any).bringToBack();
      (layer as any).on({
        mouseover: () => this.createTooltip(layer, this.stateLayers),
        click: (args: ILeafletStateClickEvent) => {
          this.selectedStateCode = args.sourceTarget.feature.properties.ST_CODE;

          const state = this.colorCoding?.find((state: { code: any; }) => state?.code === this.selectedStateCode);

          if (this.identifier == 'top-ranking' && state) {
            layer.closePopup();
            layer.bindPopup(`<div class="text-center"><b class="fs-6">${state?.name}</b> <br/> 
              Top number of rank holder: <b class="color-orange">${state?.percentage}<b></div>`);
            layer.openPopup();
          }

          this.onStateLayerClick(args, false, false);
        },
        mouseout: () => (this.mouseHoverOnState = null),
      });
    });

    if (layerToAutoSelect && !this.isMapOnMiniMapMode) {
      this.onStateLayerClick(layerToAutoSelect);
      this.isLoading = false;
    }

    if (this.isMapOnMiniMapMode) {
      this.showStateLayerOnlyFor(
        this.nationalLevelMap,
        this.currentStateInView
      );
    }
    this.initializeNationalLevelMapLayer(this.stateLayers);
  }

  override showMapLegends() {
    const element = document.getElementById("legendContainer");
    if (element) {
      element.style.visibility = "visible";
    }
  }
  override clearDistrictMapContainer() {
    const height = this.userUtil.isUserOnMobile() ? `100%` : "530px";

    document.getElementById("districtMapContainer")!.innerHTML = `
      <div
    id="districtMapId"
    class="col-sm-12"
    style="background-color: #F8F9FF;
    display: inline-block; width: 100%;height: ${height};  z-index: 100"

  >
  </div>`;
  }

  loadData() {
    this._commonService.fetchStateList().subscribe((res: any) => {
      this.stateList = [{ _id: "", name: "India" }].concat(this._commonService.sortDataSource(res, "name"));
    });
    this._commonService.state_name_data.subscribe((res) => {
      this.onSelectingStateFromDropDown(res);
      this.updateDropdownStateSelection(res);
    });
  }

  getFinancialYearList() {
    this.nationalMapService.getNationalFinancialYear().subscribe((res: any) => {
      this.financialYearList = res?.data?.FYs;
    });
  }

  onSelectingStateFromDropDown(state: any | null) {
    this.nationalMapService.setCurrentSelectedId({ data: state?._id });
    this.currentStateId = state?._id;
    this.onStateChange.emit({ state: this.currentStateId })
    this.AvailabilityTitle = state?.name;
    this.nationalInput.stateId = state?._id || '';
    this.getNationalTableData();
    this.selectedStateCode = state?.code;
    this.selected_state = state?.name || "India";
    if (this.selected_state === "India" && this.isMapOnMiniMapMode) {
      this.createLegends();
      this._commonService.fetchStateList().subscribe((res) => {
        this.stateList = [{ _id: "", name: "India" }].concat(res);
      });
      this.updateDropdownStateSelection(state);
      const element = document.getElementById(this.createdDomMinId);
      element!.style.display = "block";
      this.resetMapToNationalLevel();
      this.initializeNationalLevelMapLayer(this.stateLayers);
    }
    this.stateselected = state;
    this.selectStateOnMap(state);
  }

  override initializeNationalLevelMapLayer(map: L.GeoJSON<any>) {
    this.showMapLegends();
    this.markers.forEach(marker => {
      L.marker([marker.lat, marker.lng], {
        icon: new L.Icon({
          // iconUrl: 'assets/images/maps/simple_blue_dot.png',
          // iconSize: [10, 10],
          // iconAnchor: [6, 6],
          iconUrl: 'assets/images/maps/map-marker.png',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        }), title: marker.name
      }).addTo(this.nationalLevelMap);
    });

    map?.eachLayer((layer: any) => {
      const stateCode = MapUtil.getStateCode(layer);
      if (!stateCode) return;

      let color: string;
      const stateCodes = this.colorCoding.map((el: any) => el.code);
      const state = this.stateData?.find(state => state?.code === stateCode);

      if (state) {
        this.colorCoding?.forEach((elem: any) => {
          if (elem?.code == layer?.feature?.properties?.ST_CODE) {
            if (elem.color) {
              color = elem.color;
            } else {
              color = this.getColor(elem?.percentage);
            }
          } else if (
            !stateCodes.includes(layer?.feature?.properties?.ST_CODE)
          ) {
            color = this.getColor(0);
          }

          MapUtil.colorStateLayer(layer, color);
        });
      }
    });
  }

  private selectStateOnMap(state?: IState) {
    if (this.previousStateLayer) {
      // this.previousStateLayer = null;
    }
    if (!state) return;
    this.stateLayers?.eachLayer((layer) => {
      const layerName = MapUtil.getStateName(layer);
      if (layerName !== state.name) return;
      this.previousStateLayer = layer;
    });
  }

  private fetchStateList() {
    this._commonService.fetchStateList().subscribe((res) => {
      this.stateList = this._commonService.sortDataSource(res, "name");
      this.stateList = [{ _id: '', name: "India" }].concat(res);
    });
  }
  private updateDropdownStateSelection(state: IState) {
    this.stateselected = state;
    this.myForm.controls['stateId'].setValue(state ? [{ ...state }] : []);
  }
}