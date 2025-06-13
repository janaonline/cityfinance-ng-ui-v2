import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as L from 'leaflet';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { allUlbsData } from '../../../../assets/jsonFile/ulbsListLocalStorage';
import { UserUtility } from '../../../core/util/user/user';
import { MapConfig, ResettableMap, StateGeoJson, ULBDataPoint } from './interfaces';
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
export class MapComponent implements OnChanges, AfterViewInit, OnDestroy, ResettableMap {
  @Input() stateCode!: string;
  @Input() ulbId!: string;
  @Output() ulbIdChange = new EventEmitter<string>();
  @Output() stateCodeChange = new EventEmitter<string>();

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
  private mapInitialized = false;

  constructor(private mapService: MapService) {}

  // ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    // console.log(changes);
    const shouldReloadMap = ['stateCode', 'ulbId'].some((key: string) => {
      const change = changes[key];
      return change && change.currentValue && !change.isFirstChange() && this.mapInitialized;
    });

    if (shouldReloadMap) this.loadMapData();
  }

  ngAfterViewInit(): void {
    this.mapService.initMap('map-container', this.mapConfig);
    this.mapInitialized = true;
    this.loadMapData();

    this.subscribeToMapEvents();
  }

  private subscribeToMapEvents(): void {
    this.mapService.stateCodeClicked$
      .pipe(takeUntil(this.destroy$), debounceTime(300))
      .subscribe((code) => {
        if (!this.stateCode) {
          this.stateCode = code;
          this.stateCodeChange.emit(code);
          // this.loadMapData();
        }
      });

    this.mapService.ulbCodeClicked$.pipe(takeUntil(this.destroy$)).subscribe((code) => {
      if (code && this.ulbId !== code) {
        this.ulbId = code;
        this.ulbIdChange.emit(code);
      }
    });
  }

  private loadMapData(): void {
    if (!this.mapInitialized) return;

    this.isMapLoading = true;

    // Remove previous state layer if any
    if (this.stateLayer) {
      this.mapService.map?.removeLayer(this.stateLayer);
      this.stateLayer = null;
    }

    this.mapService
      .loadAndAddStates()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: StateGeoJson) => {
          const features = this.stateCode
            ? data.features.filter((f) => f.properties['ST_CODE'] === this.stateCode)
            : data.features;
          // console.log('state length = ', features.length);
          const stateGeoJson: StateGeoJson = {
            type: 'FeatureCollection',
            features,
          };

          this.stateLayer = this.mapService.addGeoJsonLayer(stateGeoJson, this.stateCode);

          if (this.stateCode && features.length) {
            this.mapService.flyToStateBounds(this.stateLayer, [0, 0], 1.5, 0.5);
            this.loadCityCoordinates();
            this.mapService.addCityMarkersToMap(this.stateCode, this.ulbId, this.ulbsList);
          } else {
            this.mapService.map?.setView(this.mapConfig.initialView, this.mapConfig.initialZoom);
            this.mapService.clearCityMarkers();
          }
        },
        error: (err) => console.error('Error loading map data:', err),
        complete: () => {
          this.isMapLoading = false;
        },
      });
  }

  private loadCityCoordinates(): void {
    this.ulbsList = this.stateCode ? allUlbsData[this.stateCode]?.ulbs || [] : [];
  }

  public resetMap(): void {
    this.stateCode = '';
    this.stateLayer?.clearLayers();
    this.stateLayer = null;
    this.mapService.clearCityMarkers();
    this.mapService.map?.setView(this.mapConfig.initialView, this.mapConfig.initialZoom);
    this.loadMapData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.mapService.destroyMap();
  }
}
