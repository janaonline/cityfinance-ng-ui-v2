import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReviewTableService {

  constructor(private http: HttpClient) { }

  getFormList(paginationParams: any) {
    const params = { skip: 0, limit: 10 };
    let state = '5dcf9d7216a06aed41c748dd';
    // {{url}}xviFc/form_list/?state=5dcf9d7416a06aed41c748f0&skip=0&limit=10

    return this.http.post(
      `${environment.api.url}xviFc/form_list?state=${state}&skip=${paginationParams.skip}&limit=${paginationParams.limit}`, { params }
    );
  }
}
