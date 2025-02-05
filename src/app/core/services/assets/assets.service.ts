import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ICreditRatingData } from '../../models/creditRating/creditRatingResponse';

@Injectable({
  providedIn: "root",
})
export class AssetsService {
  constructor(private _http: HttpClient) { }

  fetchCreditRatingDetailedReport() {
    return this._http.get(`/assets/files/credit-rating-new.json`);
  }

  fetchCreditRatingReport() {
    return this._http.get<ICreditRatingData[]>(
      `/assets/files/credit-rating.json`
    );
  }
}
