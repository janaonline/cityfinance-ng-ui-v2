import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UtilityService } from '../../../core/services/utility.service';
import { ExploreSectionResponse } from './interfaces';

@Injectable({
  providedIn: 'root',
})
export class ExploreSectionService {
  constructor(
    private https: HttpClient,
    private _uitlity: UtilityService,
  ) {}

  public getExploreSectionData(
    stateCode: string = '',
    stateId: string = '',
  ): Observable<{ data: ExploreSectionResponse[] }> {
    let params = new HttpParams();
    if (stateCode) params = params.set('stateCode', stateCode);
    if (stateId) params = params.set('stateId', stateId);

    return this.https.get<{ data: ExploreSectionResponse[] }>(
      `${environment.api.url}dashboard/home-page/get-Data`,
      { params },
    );
  }

  public getCityData(ulbId: string = ''): Observable<{ gridDetails: ExploreSectionResponse[] }> {
    if (!ulbId) this._uitlity.swalPopup('Error', 'ULB Id is mandatory!', 'error');
    const params = { ulbId };
    return this.https.get<{ gridDetails: ExploreSectionResponse[] }>(
      `${environment.api.url}dashboard/city/city-details`,
      { params },
    );
  }
}
