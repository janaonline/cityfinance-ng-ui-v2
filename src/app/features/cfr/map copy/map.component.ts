import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { IMapCreationConfig, IStateLayerStyle } from '../../../core/util/map/models/mapCreationConfig';
import { MapUtil } from '../../../core/util/map/mapUtil';
import { GeographicalService } from '../../../core/services/geographical/geographical.service';
@Component({
  selector: 'app-map-copy',
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements AfterViewInit {
  private map!: L.Map;

  // Center coordinates of India
  private indiaCenter: L.LatLngExpression = [20.5937, 78.9629];
  StatesJSONForMapCreation: any;
  defaultStateLayerStyle: IStateLayerStyle = {
    fillColor: '#efefef',
    weight: 1,
    opacity: 1,
    color: '#403f3f',
    fillOpacity: 1,
  };

  constructor(protected _geoService: GeographicalService,) {
    this.createNationalMapJson();
  }

  // Initialize the map after view is ready
  ngAfterViewInit(): void {
    console.log('this.StatesJSONForMapCreation', this.StatesJSONForMapCreation);
    this.initMap();
  }

  createNationalMapJson() {
    const promise = this._geoService.loadConvertedIndiaGeoData().subscribe((data) => {
      this.StatesJSONForMapCreation = data;
      // this.initMap();
      L.geoJSON(this.StatesJSONForMapCreation, {
        style: this.defaultStateLayerStyle,
      }).addTo(this.map)

    });
    // promise.then((data) => (this.StatesJSONForMapCreation = data));
    // return Promise.all([promise]);
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
    // Initialize the map with the center on India
    // this.map = L.map('map', {
    //   center: this.indiaCenter,
    //   zoom: 5
    // });
    this.map = L.map('map', options).setView([20.59, 78.96], 0.1);

    // const stateLayers = MapUtil.applyStyleOnStates(
    //   configuration.geoData,
    //   configuration.layerOptions,
    // );

    // L.geoJSON(this.StatesJSONForMapCreation, {
    //   style: this.defaultStateLayerStyle,
    // }).addTo(this.map)

    this.map.touchZoom.disable();
    this.map.doubleClickZoom.disable();
    this.map.scrollWheelZoom.disable();
    this.map.boxZoom.disable();
    this.map.keyboard.disable();
    this.map.dragging.disable();

    // Add OpenStreetMap tile layer
    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //   maxZoom: 18,
    //   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    // }).addTo(this.map);

    // // Optional: Add a marker for New Delhi
    const marker = L.marker([28.6139, 77.2090], {
      icon: new L.Icon({
        // iconUrl: 'assets/images/maps/simple_blue_dot.png',
        // iconSize: [10, 10],
        // iconAnchor: [6, 6],
        iconUrl: 'assets/images/maps/map-marker.png',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      }), title: 'delhi'
    }).addTo(this.map);
    marker.bindPopup("<b>New Delhi</b><br>Capital of India"); //.openPopup();
  }

  // public static createDefaultNationalMap(configuration: IMapCreationConfig) {
  //   console.log(configuration);
  //   const options = configuration.options
  //     ? { ...MapUtil.defaultMapConfiguration, ...configuration.options }
  //     : MapUtil.defaultMapConfiguration;
  //   let map = L.map(configuration.containerId, options).setView([20.59, 78.96], 0.1);

  //   const stateLayers = MapUtil.applyStyleOnStates(
  //     configuration.geoData,
  //     configuration.layerOptions,
  //   ).addTo(map);

  //   map = MapUtil.centerMap(map, stateLayers);
  //   map.touchZoom.disable();
  //   map.doubleClickZoom.disable();
  //   map.scrollWheelZoom.disable();
  //   map.boxZoom.disable();
  //   map.keyboard.disable();
  //   map.dragging.disable();

  //   return { map, stateLayers };
  //   //store map instance for feature reference to destroy.
  // }

}
