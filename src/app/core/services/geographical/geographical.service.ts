import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FeatureCollection, Geometry } from 'geojson';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// import * as topo from 'topojson';
import { IRawIndiaGEOData } from '../../models/geoDatas/india';

@Injectable({
  providedIn: "root",
})
export class GeographicalService {
  private readonly rawIndiaMapCached = new BehaviorSubject<IRawIndiaGEOData | null>(
    null
  );
  private readonly convertedIndiaMapCached = new BehaviorSubject<any>(null);

  constructor(private _http: HttpClient) { }

  loadRawIndiaGeoData() {
    // if (this.rawIndiaMapCached.value) return this.rawIndiaMapCached;

    return this._http
      // .get<IRawIndiaGEOData>("/assets/jsonFile/india_v2.json")
      .get<IRawIndiaGEOData>("/assets/jsonFile/state_boundaries_24Jan2024.json")
      .pipe(
        map((response) => {
          this.rawIndiaMapCached.next(response);
          return response;
        })
      );
  }

  loadConvertedIndiaGeoData() {
    return this.loadRawIndiaGeoData();
    // return this.loadRawIndiaGeoData().pipe(
    //   map((rawData) => {
    //     return topo.feature(rawData, rawData.objects.india);
    //   })
    // );
  }

  loadStatesGeoData(): Observable<
    FeatureCollection<
      Geometry,
      {
        [name: string]: any;
      }
    >
  > {
    return this._http.get<any>("/assets/jsonFile/states_with_district_boundaries.json");
  }
}
