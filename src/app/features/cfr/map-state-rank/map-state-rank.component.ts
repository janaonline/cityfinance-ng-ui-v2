import { AfterViewInit, Component, HostListener, Input, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import { forkJoin, Subscription } from 'rxjs';
import { GeographicalService } from '../../../core/services/geographical/geographical.service';
import { IStateLayerStyle } from '../../../core/util/map/models/mapCreationConfig';
import { FiscalRankingService } from '../services/fiscal-ranking.service';
import { MapUtil } from '../../../core/util/map/mapUtil';

export interface ColorDetails {
  color: string,
  text: string,
  min: number,
  max: number
}

export interface Marker {
  lat: number,
  lng: number,
  ulbName: string,
}

@Component({
  selector: 'app-map-state-rank',
  standalone: true,
  imports: [],
  templateUrl: './map-state-rank.component.html',
  styleUrl: './map-state-rank.component.scss'
})
export class MapStateRankComponent implements AfterViewInit, OnDestroy {
  @Input() markers: Marker[] = [];

  private map!: L.Map;
  private subscription!: Subscription;

  // Center coordinates of India
  private indiaCenter: L.LatLngExpression = [20.5937, 78.9629];
  StatesJSONForMapCreation: any;
  defaultStateLayerStyle: IStateLayerStyle = {
    fillColor: 'red',
    weight: 1,
    opacity: 1,
    color: "#193369",
    // fillOpacity: 0.5,
  };

  colorDetails: ColorDetails[] = [
    { color: '#06668F', text: '76%-100%', min: 75.51, max: 100 },
    { color: '#0B8CC3', text: '51%-75%', min: 50.51, max: 75.50 },
    { color: '#73BFE0', text: '26%-50%', min: 25.51, max: 50.50 },
    { color: '#BCE2F2', text: '0.1%-25%', min: 0.1, max: 25.50 },
    { color: '#E5E5E5', text: '0%', min: 0, max: 0 },
  ];
  label: any = '% of Ranked';

  constructor(protected _geoService: GeographicalService,
    private fiscalRankingService: FiscalRankingService,) { }

  // Initialize the map after view is ready
  ngAfterViewInit(): void {
    this.initMap();
    this.createNationalMapJson();
    this.createLegends();
    this.addMarkers();
    this.adjustZoom();
    // console.log('this.StatesJSONForMapCreation', this.StatesJSONForMapCreation);
  }

  private initMap(): void {
    const options = {
      "scrollWheelZoom": false,
      "fadeAnimation": true,
      "keyboard": false,
      "attributionControl": false,
      "dragging": false,
      "tap": false,
      "doubleClickZoom": false,
      "zoomControl": false,
      "zoom": 4.2, // initial zoom value
      "minZoom": 4.2, // Prevent zooming out beyond level y
      "maxZoom": 4.2, // Prevent zooming in beyond level x

    };

    this.map = L.map('map', options).setView([22, 85], 0.1);
    this.map.touchZoom.disable();
    this.map.doubleClickZoom.disable();
    this.map.scrollWheelZoom.disable();
    this.map.boxZoom.disable();
    this.map.keyboard.disable();
    this.map.dragging.enable();
  }

  createNationalMapJson() {
    const sources = [
      this._geoService.loadConvertedIndiaGeoData(),
      this.fiscalRankingService.getApiResponse(`scoring-fr/participated-state-map`, { limit: 100 }),
    ];

    // this.subscription = this._geoService.loadConvertedIndiaGeoData().subscribe((data) => {
    this.subscription = forkJoin(sources).subscribe((res: any) => {
      this.StatesJSONForMapCreation = res[0];
      const colorCoding = res[1].data.mapData;
      // console.log('this.StatesJSONForMapCreation', this.StatesJSONForMapCreation);

      // Add GeoJSON data to the map
      const layers = L.geoJSON(this.StatesJSONForMapCreation, {
        style: this.getStateStyle.bind(this, colorCoding),
        // style: this.defaultStateLayerStyle,
        onEachFeature: this.onEachFeature.bind(this),
      }).addTo(this.map);

    });
  }

  // Add popup or events;
  private onEachFeature(feature: any, layer: L.Layer): void {
    if (feature.properties && feature.properties.ST_NM) {
      /** State name on click. */
      layer.bindPopup(`<strong>${feature.properties.ST_NM}</strong>`); // On click = popup.

      // /** State name on hover */
      // // Create a popup content
      // const popupContent = `<b>${feature.properties.ST_NM}</b>`;

      // // Add a popup on hover (mouseover)
      // layer.on('mouseover', (event) => {
      //   const popup = L.popup()
      //     .setLatLng(event.latlng) // Use the latitude and longitude of the event
      //     .setContent(popupContent)
      //     .openOn(this.map); // Open the popup on the map
      // });

      // // Remove the popup on mouseout
      // layer.on('mouseout', () => {
      //   this.map.closePopup(); // Close the popup
      // });
    }
  }

  createLegends() {
    const legend = new L.Control({ position: 'bottomleft' });
    const labels: any[] = [
      // `<span style="width: 100%; display: block; font-size: 12px" class="text-center">${this.label}</span>`,
    ];
    const colorDetails = this.colorDetails;
    legend.onAdd = map => {
      const div = L.DomUtil.create("div", "map-legend");
      div.id = "legendContainer";
      // div.style.width = "100%";
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
        ${this?.label ? `<div class="heading text-start mb-2">${this?.label}</div>` : ''}
        <div class="indicator-items">${labelString}</div>
      `;
      return div;
    };
    legend.addTo(this.map);
  }

  // Generate dynamic styles to states;
  private getStateStyle(stateData: any, feature: any): L.PathOptions {

    const stateCode = feature.properties?.['ST_CODE'];

    const match = stateData.find((e: { code: any; }) => {
      return e.code === stateCode;
    })

    return {
      fillColor: match ? match.color : '#e5e5e5', // Default to gray if no match
      weight: 1,
      opacity: 1,
      color: '#193369',
      fillOpacity: 1,
    };
  }

  // Add markers.
  addMarkers() {
    // console.log("from map maper: ", this.markers)
    this.markers.forEach(marker => {

      L.marker([marker.lat, marker.lng], {
        icon: new L.Icon({
          // iconUrl: 'assets/images/maps/map-marker.png',
          iconUrl: 'assets/images/maps/location_on.svg',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        })
      })
        .addTo(this.map)
        // .bindPopup(`${marker.ulbName}`)
        .on('mouseover', (event) => {
          L.popup()
            .setLatLng(event.latlng) // Use the latitude and longitude of the event
            .setContent(`${marker.ulbName}`)
            .openOn(this.map); // Open the popup on the map
        })
        .on('mouseout', () => {
          this.map.closePopup(); // Close the popup
        });
    });
  }

  // Function to adjust zoom based on screen width
  private adjustZoom(): void {
    const screenWidth = window.innerWidth;

    if (screenWidth >= 770 && screenWidth < 996) {
      // For medium-small screens
      this.map.setZoom(3.8); // Adjust zoom to fit better
      this.map.setMinZoom(3.8);
      this.map.setMaxZoom(3.8);
    } else {
      this.map.setZoom(4.2); // Default zoom
      this.map.setMinZoom(4.2);
      this.map.setMaxZoom(4.2);
    }
  }
  @HostListener('window:resize', [])
  onResize(): void {
    // Adjust zoom whenever the window is resized
    this.adjustZoom();
  }

  ngOnDestroy(): void {
    // Clean up the subscription
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}