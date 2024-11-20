import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';
import { GeographicalService } from '../../../core/services/geographical/geographical.service';
import { IStateLayerStyle } from '../../../core/util/map/models/mapCreationConfig';

@Component({
  selector: 'app-map-state-rank',
  standalone: true,
  imports: [],
  templateUrl: './map-state-rank.component.html',
  styleUrl: './map-state-rank.component.scss'
})
export class MapStateRankComponent implements AfterViewInit, OnDestroy {
  private map!: L.Map;
  private subscription!: Subscription;

  // Center coordinates of India
  private indiaCenter: L.LatLngExpression = [20.5937, 78.9629];
  StatesJSONForMapCreation: any;
  defaultStateLayerStyle: IStateLayerStyle = {
    fillColor: 'red',
    weight: 1,
    opacity: 1,
    color: 'blue',
    fillOpacity: 0.5,
  };

  constructor(protected _geoService: GeographicalService,) { }

  // Initialize the map after view is ready
  ngAfterViewInit(): void {
    this.initMap();
    this.createNationalMapJson();
    this.addMarkers();
    // console.log('this.StatesJSONForMapCreation', this.StatesJSONForMapCreation);
  }

  createNationalMapJson() {
    this.subscription = this._geoService.loadConvertedIndiaGeoData().subscribe((data) => {
      this.StatesJSONForMapCreation = data;
      console.log('this.StatesJSONForMapCreation', this.StatesJSONForMapCreation);

      // Add GeoJSON data to the map
      L.geoJSON(this.StatesJSONForMapCreation, {
        // style: this.defaultStateLayerStyle,
        style: this.getStateStyle.bind(this),
        onEachFeature: this.onEachFeature.bind(this),
      }).addTo(this.map)

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

  // Generate dynamic styles to states;
  private getStateStyle(feature: any): L.PathOptions {
    const stateCode = feature.properties?.['ST_CODE'];

    //  Assign colors based on state codes.
    const colorMapping: { [key: string]: string } = {
      'MH': 'blue',
      'GJ': 'green',
      'RJ': 'orange',
      'KA': 'purple',
      'KL': 'pink',
      'MP': 'red',
      'PB': 'yellow',
      'AS': 'pink',
      'BR': 'black',
      // Add more states and colors here
    };

    return {
      fillColor: colorMapping[stateCode] || 'lightblue', // Default to gray if no match
      weight: 1,
      opacity: 1,
      color: 'black',
      fillOpacity: 0.7,
    };
  }

  // Add markers.
  addMarkers() {
    // Example markers for different states
    const markersData = [
      { name: 'Delhi', coordinates: [28.6139, 77.209], description: 'Capital of India' },
      { name: 'Mumbai', coordinates: [19.076, 72.8777], description: 'Financial Capital of India' },
      { name: 'Kolkata', coordinates: [22.5726, 88.3639], description: 'City of Joy' },
      { name: 'Chennai', coordinates: [13.0827, 80.2707], description: 'Gateway to South India' },
    ];

    markersData.forEach((markerData) => {
      const coordinates: L.LatLngTuple = markerData.coordinates as L.LatLngTuple;

      // Create a marker for each location
      const marker = L.marker(coordinates, {
        icon: new L.Icon({
          iconUrl: 'assets/images/maps/map-marker.png',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        })
      })
        .addTo(this.map) // Add the marker to the map
        .bindPopup(`<b>${markerData.name}</b><br>${markerData.description}`); // Add a popup
    });
  }

  private initMap(): void {
    const options = {
      "scrollWheelZoom": false,
      "fadeAnimation": true,
      "minZoom": 4.2,
      "maxZoom": 4.2,
      "zoomControl": false,
      "keyboard": false,
      "attributionControl": false,
      "doubleClickZoom": false,
      "dragging": false,
      "tap": false,
      "zoom": 4.2
    };

    this.map = L.map('map', options).setView([20.59, 78.96], 0.1);
    this.map.touchZoom.disable();
    this.map.doubleClickZoom.disable();
    this.map.scrollWheelZoom.disable();
    this.map.boxZoom.disable();
    this.map.keyboard.disable();
    this.map.dragging.enable();
  }

  ngOnDestroy(): void {
    // Clean up the subscription
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}