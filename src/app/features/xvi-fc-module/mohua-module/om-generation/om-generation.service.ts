import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { UploadedFileMetadata } from '../../../../shared/dynamic-form/components/file/file-metadata.types';
import { XviFcDownloadedFile, parseContentDispositionFileName } from '../../download-file-name.util';
import { ApiEnvelope, unwrapResponse } from '../api-response.util';
import { OM_INSTALLMENT, OmEditorValues, OmEditorView, OmHistoryRow, OmStates } from './om-generation.models';

/** MoHUA's Office Memorandums: verified letters by State, the OM editor, Generate, the signed copy and history. */
@Injectable({ providedIn: 'root' })
export class OmGenerationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.url2}xvi-fc/mohua/om/`;

  getStates(yearId: string): Observable<OmStates> {
    return this.get<OmStates>(`${yearId}/${OM_INSTALLMENT}`);
  }

  getEditor(claimLetterId: string): Observable<OmEditorView> {
    return this.get<OmEditorView>(`letter/${claimLetterId}/document`);
  }

  /** Saves the boxes that changed; the response is the refreshed OM. */
  saveDraft(claimLetterId: string, values: Partial<OmEditorValues>): Observable<OmEditorView> {
    return this.http
      .patch<ApiEnvelope<OmEditorView> | OmEditorView>(`${this.baseUrl}letter/${claimLetterId}/draft`, values)
      .pipe(map((response) => unwrapResponse(response)));
  }

  /** Issues the OM and returns one PDF: the OM, then the claim letter's annexures (a repeat call returns the same OM). */
  generate(claimLetterId: string): Observable<XviFcDownloadedFile> {
    return this.http
      .post(`${this.baseUrl}letter/${claimLetterId}/generate`, {}, { responseType: 'blob', observe: 'response' })
      .pipe(map(toDownloadedFile));
  }

  downloadPdf(omId: string): Observable<XviFcDownloadedFile> {
    return this.http
      .get(`${this.baseUrl}${omId}/pdf`, { responseType: 'blob', observe: 'response' })
      .pipe(map(toDownloadedFile));
  }

  uploadSignedFile(omId: string, file: UploadedFileMetadata): Observable<OmHistoryRow> {
    return this.http
      .put<ApiEnvelope<OmHistoryRow> | OmHistoryRow>(`${this.baseUrl}${omId}/signed-file`, file)
      .pipe(map((response) => unwrapResponse(response)));
  }

  getHistory(yearId: string): Observable<OmHistoryRow[]> {
    return this.get<OmHistoryRow[]>(`history/${yearId}/${OM_INSTALLMENT}`);
  }

  private get<T>(path: string): Observable<T> {
    return this.http.get<ApiEnvelope<T> | T>(`${this.baseUrl}${path}`).pipe(map((response) => unwrapResponse(response)));
  }
}

function toDownloadedFile(response: HttpResponse<Blob>): XviFcDownloadedFile {
  return {
    blob: response.body ?? new Blob(),
    fileName: parseContentDispositionFileName(response.headers.get('Content-Disposition')),
  };
}
