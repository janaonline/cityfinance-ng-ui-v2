import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { IMapCreationConfig } from '../../../core/util/map/models/mapCreationConfig';
import { MapUtil } from '../../../core/util/map/mapUtil';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements AfterViewInit {
  private map: L.Map | undefined;

  // Center coordinates of India
  private indiaCenter: L.LatLngExpression = [20.5937, 78.9629];

  // Initialize the map after view is ready
  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    // Initialize the map with the center on India
    this.map = L.map('map', {
      center: this.indiaCenter,
      zoom: 5
    });

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Optional: Add a marker for New Delhi
    const marker = L.marker([28.6139, 77.2090]).addTo(this.map);
    marker.bindPopup("<b>New Delhi</b><br>Capital of India").openPopup();
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
