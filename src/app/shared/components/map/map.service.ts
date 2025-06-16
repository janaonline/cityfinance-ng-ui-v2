import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import L, { Marker } from 'leaflet';
import { Observable, Subject } from 'rxjs';
import { IStateLayerStyle } from '../../../core/util/map/models/mapCreationConfig';
import { MapConfig, StateGeoJson, ULBDataPoint } from './interfaces';
interface LeafletHTMLElement extends HTMLElement {
  _leaflet_id?: number;
}
declare module 'leaflet' {
  interface Marker {
    ulbData?: ULBDataPoint;
  }
}
@Injectable({
  providedIn: 'root',
})
export class MapService {
  private readonly cfPrimary = '#e57d15';
  private readonly cfSecondary = '#3e5db1'; // '#183367'
  public map!: L.Map;
  private defaultStateLayerStyle: IStateLayerStyle = {
    fillColor: this.cfSecondary,
    weight: 1,
    opacity: 0.8,
    color: 'lightgrey',
    fillOpacity: 1,
  };
  private readonly blueIcon = L.icon({
    iconUrl: './assets/images/maps/simple_blue_dot.png',
    iconSize: [6, 6],
    iconAnchor: [3, 3],
  });
  private readonly selectedIcon = new L.Icon({
    iconUrl: 'assets/images/maps/map-marker.png',
    iconSize: [18, 18],
    iconAnchor: [8, 14],
  });
  private selectedMarker: L.Marker | null = null; // Stores selectedMarker (active location icon)
  private stateCodeClickedSubject = new Subject<string>(); // If a state is clicked - emit value.
  public stateCodeClicked$: Observable<string> = this.stateCodeClickedSubject.asObservable();
  private ulbCodeClickedSubject = new Subject<string>(); // If a ulb is clicked - emit value.
  public ulbCodeClicked$: Observable<string> = this.ulbCodeClickedSubject.asObservable();
  private cityMarkersGroup: L.LayerGroup = new L.LayerGroup();

  constructor(
    // private _geoService: GeographicalService,
    private http: HttpClient,
  ) {}

  initMap(elementId: string, config: MapConfig, options?: L.MapOptions): void {
    if (this.map) this.destroyMap();

    const container = document.getElementById('map-container') as LeafletHTMLElement;
    if (container && container._leaflet_id) {
      delete container._leaflet_id;
    }

    this.map = L.map(elementId, {
      scrollWheelZoom: false,
      fadeAnimation: true,
      zoomControl: false,
      keyboard: false,
      attributionControl: false,
      doubleClickZoom: false,
      dragging: false,
      zoomSnap: 0.01,
      ...options,
    }).setView(config.initialView, config.initialZoom, { animate: true });
  }

  // Get the States/ India json - lat & lng.
  loadAndAddStates(): Observable<StateGeoJson> {
    // return this._geoService.loadConvertedIndiaGeoData();
    return this.http.get<StateGeoJson>('/assets/jsonFile/state_boundaries_24Jan2024.json');
  }

  // If a state is clicked emit state code - to intitiate state map.
  addGeoJsonLayer(geoJsonData: StateGeoJson, stateCode: string): L.GeoJSON {
    return L.geoJSON(geoJsonData, {
      style: this.defaultStateLayerStyle,
      // Emit state code.
      onEachFeature: (feature, layer) => {
        const popup = this.createToolTip(feature.properties.ST_NM);
        layer.bindPopup(popup, { closeButton: false, offset: L.point(0, -10) });

        let hoverTimeout: ReturnType<typeof setTimeout>;

        layer.on({
          click: () => {
            if (!stateCode) this.stateCodeClickedSubject.next(feature.properties.ST_CODE);
          },

          mouseover: () => {
            if (layer instanceof L.Path && !stateCode) {
              layer.setStyle({ fillColor: this.cfPrimary });
            }

            hoverTimeout = setTimeout(() => {
              layer.openPopup();
            }, 300);
          },

          mouseout: () => {
            if (layer instanceof L.Path && !stateCode) {
              layer.setStyle({ fillColor: this.defaultStateLayerStyle.fillColor });
            }

            clearTimeout(hoverTimeout);
            layer.closePopup();
          },
        });
      },
    }).addTo(this.map);
  }

  // Center the map on the selected state and increase the zoom level.
  flyToStateBounds(
    layer: L.GeoJSON,
    padding: L.PointExpression,
    maxZoomOffset: number,
    duration: number,
  ): void {
    // Handle the case where the map is not initialized
    if (!this.map) {
      console.warn('Map not initialized in flyToStateBounds');
      return;
    }

    setTimeout(() => {
      this.map.flyToBounds(layer.getBounds(), {
        padding: padding,
        maxZoom: this.map.getZoom() + maxZoomOffset,
        duration: duration,
      });
    }, 400);
  }

  // Add blue dot - City representation on sate map.
  addCityMarkersToMap(stateCode: string, ulbId: string, ulbsList: ULBDataPoint[]): void {
    if (!this.map) {
      console.error('Map instance not initialised');
      return;
    }

    this.clearCityMarkers();
    let newlySelectedMarker: L.Marker | null = null;

    // Iterate over ulbsList to add marker/ icon.
    ulbsList.forEach((ulbDataPoints: ULBDataPoint) => {
      const lat = ulbDataPoints.location.lat;
      const lng = ulbDataPoints.location.lng;

      if (lat && lng) {
        const popup = L.popup({ closeButton: false, autoClose: true }).setContent(
          this.createToolTip(ulbDataPoints.name || ''),
        );
        const marker = this.addMarker(+lat, +lng, ulbDataPoints).bindPopup(popup);

        this.cityMarkersGroup.addLayer(marker);

        marker.on({
          mouseover: () => marker.openPopup(),
          mouseout: () => marker.closePopup(),
          click: () => this.handleMarkerClick(marker),
        });

        // If this ulb is the selected one (sent from parent), store its marker
        if (ulbId && ulbDataPoints._id == ulbId) {
          newlySelectedMarker = marker;
        }
      } else console.warn(`Invalid coordinates: ${ulbDataPoints.name} (Lat: ${lat}, Lng: ${lng})`);
    });

    // If ULB is selected mark the ulb with Location icon.
    if (ulbId) {
      this.handleMarkerClick(newlySelectedMarker);
    }

    this.cityMarkersGroup.addTo(this.map);
  }

  addMarker(lat: number, lng: number, ulb: ULBDataPoint): Marker {
    const marker = L.marker([lat, lng], {
      icon: this.blueIcon,
      interactive: true,
      bubblingMouseEvents: true,
    });

    // Add ulb data to each layer.
    marker.ulbData = ulb;

    return marker;
  }

  // Remove markers - blue dot.
  clearCityMarkers(): void {
    if (this.map) this.cityMarkersGroup.clearLayers();
  }

  // Display a location icon upon clicking the blue dot corresponding to a ULB or city.
  handleMarkerClick(marker: L.Marker | null): void {
    if (this.selectedMarker) {
      this.selectedMarker.setIcon(this.blueIcon);
    }

    // Only set if marker is not null
    if (marker) {
      marker.setIcon(this.selectedIcon);
      this.selectedMarker = marker;
      this.ulbCodeClickedSubject.next(this.selectedMarker.ulbData?._id || '');
    } else this.selectedMarker = null;
  }

  // Create tooltip - Hover on city (blue dot)
  createToolTip(ulbName: string): string {
    const tooltipStyle = {
      color: '#000000',
      fontWeight: 600,
      fontSize: '0.7rem',
    };

    return `<p style="color: ${tooltipStyle?.color}; font-weight: ${tooltipStyle?.fontWeight}; font-size: ${tooltipStyle?.fontSize};">${ulbName}</p>`;
  }

  destroyMap(): void {
    if (this.map) {
      this.map?.off();
      // this.map?.remove();
    }
  }
}
