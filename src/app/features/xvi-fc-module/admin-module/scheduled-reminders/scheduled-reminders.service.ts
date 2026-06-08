import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import {
  ApiEnvelope,
  CreateReminderPayload,
  CreateTemplatePayload,
  EmailReminder,
  EmailTemplate,
  PagedData,
  SendEmailPayload,
  UpdateTemplatePayload,
} from './scheduled-reminders.models';

@Injectable({ providedIn: 'root' })
export class ScheduledRemindersService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.api.url2;

  getTemplates(page = 1, limit = 20): Observable<EmailTemplate[]> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http
      .get<any>(`${this.base}email-templates`, { params })
      .pipe(
        map(res => {
          if (res?.success === false) throw new Error(res.message ?? 'Failed to load templates');
          const payload = res?.data ?? res;
          return (Array.isArray(payload) ? payload : (payload?.data ?? [])) as EmailTemplate[];
        }),
        catchError(this.handle),
      );
  }

  updateTemplate(id: string, payload: UpdateTemplatePayload): Observable<EmailTemplate> {
    return this.http
      .patch<any>(`${this.base}email-templates/${id}`, payload)
      .pipe(
        map(res => {
          if (res?.success === false) throw new Error(res.message ?? 'Failed to update template');
          return (res?.data ?? res) as EmailTemplate;
        }),
        catchError(this.handle),
      );
  }

  createTemplate(payload: CreateTemplatePayload): Observable<EmailTemplate> {
    return this.http
      .post<any>(`${this.base}email-templates`, payload)
      .pipe(
        map(res => {
          if (res?.success === false) throw new Error(res.message ?? 'Failed to create template');
          return (res?.data ?? res) as EmailTemplate;
        }),
        catchError(this.handle),
      );
  }

  getReminders(page = 1, limit = 20): Observable<EmailReminder[]> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http
      .get<any>(`${this.base}email-reminders`, { params })
      .pipe(
        map(res => {
          if (res?.success === false) throw new Error(res.message ?? 'Failed to load reminders');
          const payload = res?.data ?? res;
          return (Array.isArray(payload) ? payload : (payload?.data ?? [])) as EmailReminder[];
        }),
        catchError(this.handle),
      );
  }

  createReminder(payload: CreateReminderPayload): Observable<EmailReminder> {
    return this.http
      .post<any>(`${this.base}email-reminders`, payload)
      .pipe(
        map(res => {
          if (res?.success === false) throw new Error(res.message ?? 'Failed to create reminder');
          return (res?.data ?? res) as EmailReminder;
        }),
        catchError(this.handle),
      );
  }

  sendEmail(payload: SendEmailPayload): Observable<void> {
    return this.http
      .post<any>(`${this.base}email-templates/send`, payload)
      .pipe(
        map(res => {
          if (res?.success === false) throw new Error(res.message ?? 'Failed to send email');
        }),
        catchError(this.handle),
      );
  }

  private handle(err: HttpErrorResponse | Error): Observable<never> {
    const msg =
      err instanceof HttpErrorResponse
        ? (err.error?.message ?? err.error?.error ?? err.message)
        : err.message;
    return throwError(() => new Error(msg ?? 'An unexpected error occurred'));
  }
}
