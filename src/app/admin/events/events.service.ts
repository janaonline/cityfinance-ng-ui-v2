import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FieldConfig } from '../../shared/dynamic-form/field.interface';
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

  // TODO: Remove this function once backend is ready
  getWebinarQuestions(): Observable<FieldConfig[]> {
    return of([
      {
        key: 'webinarId',
        required: true,
        label: 'Webinar Id',
        validations: [],
        formFieldType: 'input',
      },
      {
        key: 'title',
        required: true,
        label: 'Event Title',
        validations: [],
        formFieldType: 'input',
      },
      {
        key: 'desc',
        required: true,
        label: 'Event Description',
        validations: [],
        formFieldType: 'input',
      },
      {
        key: 'eventStatus',
        required: true,
        label: 'Event Status',
        validations: [],
        formFieldType: 'input',
      },
      {
        key: 'startAt',
        required: true,
        label: 'Event Start Date (UTC format)',
        validations: [],
        formFieldType: 'input',
      },
      {
        key: 'endAt',
        required: true,
        label: 'Event End Date (UTC format)',
        validations: [],
        formFieldType: 'input',
      },
      {
        key: 'redirectionLink',
        required: true,
        label: 'Redirection Link',
        validations: [],
        formFieldType: 'input',
      },
      {
        key: 'buttonLabels',
        required: true,
        label: 'Button Labels (Comma Separated)',
        validations: [],
        formFieldType: 'input',
      },
      {
        key: 'imgUrl',
        required: true,
        label: 'Image URL (Comma Separated)',
        validations: [],
        formFieldType: 'input',
      },
    ]).pipe(delay(1000));
  }
}
