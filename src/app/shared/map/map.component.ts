import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { allUlbsData } from '../../../assets/jsonFile/ulbsListLocalStorage';
import { UserUtility } from '../../core/util/user/user';
import { GeoJsonFeature, MapConfig, StateGeoJson, ULBDataPoint } from './interfaces';
import { MapService } from './map.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  providers: [UserUtility],
  template: ` <button class="btn btn-outline-cfPrimary" (click)="resetMap()">Reset</button>
    <div id="map" [class.state-highlight]="stateCode"></div>`,
  styles: [
    `
      * {
        font-family: var(--ff-base);
      }
    `,
    `
      #map {
        width: 100%;
        height: 100vh;
      }
    `,
    `
      ::ng-deep .state-highlight path.leaflet-interactive {
        filter: drop-shadow(0px 1px 0px #1e3571) drop-shadow(0px 2px 0px #1e3571)
          drop-shadow(0px 3px 0px #1e3571) drop-shadow(0px 4px 0px #1e3571)
          drop-shadow(0px 5px 0px #1e3571) drop-shadow(0px 6px 0px #1e3571)
          drop-shadow(0px 7px 0px #1e3571);
        stroke-width: 0 !important;
      }
    `,
  ],
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() stateCode: string = '';

  private readonly DEFAULT_ZOOM_LEVEL = 4.4;
  private ulbsList: ULBDataPoint[] = [];
  private stateLayer: L.GeoJSON | null = null; // To hold current state layer.
  private mapConfig: MapConfig = {
    initialView: [19.59, 78.96],
    initialZoom: this.DEFAULT_ZOOM_LEVEL,
    minZoom: this.DEFAULT_ZOOM_LEVEL,
    maxZoom: this.DEFAULT_ZOOM_LEVEL + 2,
  };

  constructor(private mapService: MapService) {}

  ngOnInit(): void {
    if (this.stateCode) this.loadMapData();
  }

  // Initialize the map after view is ready
  ngAfterViewInit(): void {
    this.mapService.initMap('map', this.mapConfig);
    this.loadMapData();

    // If any state is clicked - initiate state map.
    this.mapService.stateCodeClicked$.subscribe((code) => {
      if (!this.stateCode) {
        this.stateCode = code;
        this.loadMapData();
      }
    });
  }

  // Get India/ state json - Structure.
  private loadMapData(): void {
    // Clear the previous state layer if it exists
    if (this.stateLayer) {
      this.mapService.map?.removeLayer(this.stateLayer);
      this.stateLayer = null;
    }

    this.mapService.loadAndAddStates().subscribe({
      next: (data: StateGeoJson) => {
        // Fetch the JSON data for the specified state if 'stateCode' is provided; otherwise, fetch the json for all of India.
        const geoJson = this.stateCode
          ? data['features'].filter(
              (stateObj: GeoJsonFeature) => this.stateCode === stateObj['properties']['ST_CODE'],
            )
          : data['features'];

        const stateGeoJsonData: StateGeoJson = {
          type: 'FeatureCollection',
          features: geoJson,
        };

        this.stateLayer = this.mapService.addGeoJsonLayer(stateGeoJsonData, this.stateCode);

        // Send geoJson of state if 'stateCode' is provided; otherwise, send the json for all of India.
        if (this.stateCode && geoJson.length) {
          this.mapService.flyToStateBounds(this.stateLayer, [20, 20], 2, 0.5);
          this.getCityCordinates();
          this.mapService.addCityMarkersToMap(this.stateCode, this.ulbsList);
        } else {
          this.mapService.map?.setView(this.mapConfig.initialView, this.mapConfig.initialZoom); // show the entire country
          this.mapService.clearCityMarkers(); // clear markers when showing the whole country
        }
      },
      error: (error) => console.error('Error loading map data in component:', error),
    });
  }

  // Return ULB details obj - with lat & lng of ULBs for blue dot.
  private getCityCordinates(): void {
    this.ulbsList = this.stateCode ? allUlbsData[`${this.stateCode}`]['ulbs'] : [];
  }

  // TODO: Reset will be done from parent component.
  public resetMap(): void {
    this.stateCode = '';
    this.loadMapData();
    this.mapService.map?.setView(this.mapConfig.initialView, this.mapConfig.initialZoom);
    this.mapService.clearCityMarkers();
  }

  ngOnDestroy(): void {
    this.mapService.destroyMap();
  }
}
