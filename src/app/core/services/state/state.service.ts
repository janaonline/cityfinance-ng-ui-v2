import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IApiEnvelope } from '../../models/ulb-master';
import { IState } from '../../models/state/state';

@Injectable({ providedIn: 'root' })
export class StateService {
  private readonly baseUrl = environment.api.url2 + 'master/state';

  constructor(private http: HttpClient) {}

  getStates(): Observable<IApiEnvelope<IState[]>> {
    return this.http.get<IApiEnvelope<IState[]>>(this.baseUrl);
  }
}
