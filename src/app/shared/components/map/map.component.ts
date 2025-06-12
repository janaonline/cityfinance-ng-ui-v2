import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as L from 'leaflet';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { allUlbsData } from '../../../../assets/jsonFile/ulbsListLocalStorage';
import { UserUtility } from '../../../core/util/user/user';
import { GeoJsonFeature, MapConfig, ResettableMap, StateGeoJson, ULBDataPoint } from './interfaces';
import { MapService } from './map.service';

@Component({
  selector: 'app-map',
  imports: [MatProgressSpinnerModule],
  providers: [UserUtility],
  template: `
    <!--
  <div class="d-flex">
  <div class="flex-grow-1 position-relative" style="min-height: 500px;">
  <div id="map-container" [class.state-highlight]="stateCode"></div>
  </div>
  </div>
  -->
    <div id="map-container" [class.state-highlight]="stateCode"></div>

    <!-- Loader Overlay -->
    @if (isMapLoading) {
      <div class="custom-spinner-overlay position-absolute">
        <mat-spinner></mat-spinner>
      </div>
    }
  `,
  styles: [
    `
      * {
        font-family: var(--ff-base);
      }
    `,
    `
      #map-container {
        width: 100%;
        height: 100%;
        background-image: url('/assets/images/maps/layer1.png') !important;
        background-size: cover;
        background-repeat: no-repeat;
        background-color: transparent !important;
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
export class MapComponent implements OnInit, AfterViewInit, OnDestroy, ResettableMap {
  @Input() stateCode!: string;
  @Input() ulbId!: string;
  @Output() ulbIdChange = new EventEmitter<string>();

  private readonly DEFAULT_ZOOM_LEVEL = 4.3;
  private ulbsList: ULBDataPoint[] = [];
  private stateLayer: L.GeoJSON | null = null; // To hold current state layer.
  private mapConfig: MapConfig = {
    initialView: [23, 78.96],
    initialZoom: this.DEFAULT_ZOOM_LEVEL,
    minZoom: this.DEFAULT_ZOOM_LEVEL,
    maxZoom: this.DEFAULT_ZOOM_LEVEL + 2,
  };
  private destroy$ = new Subject<void>();
  public isMapLoading = true;

  constructor(private mapService: MapService) { }

  ngOnInit(): void {
    if (this.stateCode) this.loadMapData();
  }

  // Initialize the map after view is ready
  ngAfterViewInit(): void {
    this.mapService.initMap('map-container', this.mapConfig);
    this.loadMapData();

    // If any state is clicked - initiate state map.
    this.mapService.stateCodeClicked$
      .pipe(takeUntil(this.destroy$), debounceTime(300))
      .subscribe((code) => {
        if (!this.stateCode) {
          this.stateCode = code;
          this.loadMapData();
        }
      });

    // If any ulb is clicked (Emit only if other ulb is clicked).
    this.mapService.ulbCodeClicked$.pipe(takeUntil(this.destroy$)).subscribe((code) => {
      if (code && this.ulbId !== code) {
        this.ulbId = code;
        this.ulbIdChange.emit(this.ulbId);
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
          this.mapService.flyToStateBounds(this.stateLayer, [0, 0], 1.5, 0.5);
          this.getCityCordinates();
          this.mapService.addCityMarkersToMap(this.stateCode, this.ulbId, this.ulbsList);
        } else {
          this.mapService.map?.setView(this.mapConfig.initialView, this.mapConfig.initialZoom); // show the entire country
          this.mapService.clearCityMarkers(); // clear markers when showing the whole country
        }
      },
      error: (error) => console.error('Error loading map data in component:', error),
      complete: () => {
        this.isMapLoading = false;
      },
    });
  }

  // Return ULB details obj - with lat & lng of ULBs for blue dot.
  private getCityCordinates(): void {
    this.ulbsList = this.stateCode ? allUlbsData[`${this.stateCode}`]['ulbs'] : [];
  }

  public resetMap(): void {
    this.stateCode = '';
    this.loadMapData();
    this.mapService.map?.setView(this.mapConfig.initialView, this.mapConfig.initialZoom);
    this.mapService.clearCityMarkers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.mapService.destroyMap();
  }
}
