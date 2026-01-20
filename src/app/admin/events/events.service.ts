import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FieldConfig } from '../../shared/dynamic-form/field.interface';
import { EVENT_TEMPLATE } from './eventTemplate.constant';
import { EventAlert, EventDeleteResponse, EventResponse, EventsResponseFindAll } from './interface';

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  constructor(private http: HttpClient) {}

  createEvent(eventData: EventAlert): Observable<EventAlert> {
    const apiUrl = environment.api.url2 + 'events';
    return this.http.post<EventAlert>(apiUrl, eventData);
  }

  getEvents(): Observable<EventsResponseFindAll> {
    const apiUrl = environment.api.url2 + 'events';
    return this.http.get<EventsResponseFindAll>(apiUrl);
  }

  getEventById(eventId: string): Observable<EventResponse> {
    const apiUrl = environment.api.url2 + `events/${eventId}`;
    return this.http.get<EventResponse>(apiUrl);
  }

  updateEventById(event_id: string, eventData: EventAlert): Observable<EventAlert> {
    const apiUrl = environment.api.url2 + `events/${event_id}`;
    return this.http.patch<EventAlert>(apiUrl, eventData);
  }

  removeEventById(event_id: string): Observable<EventDeleteResponse> {
    const apiUrl = environment.api.url2 + `events/${event_id}`;
    return this.http.delete<EventDeleteResponse>(apiUrl);
  }

  getEventTemplate(): FieldConfig[] {
    return EVENT_TEMPLATE;
  }
}
