import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CategoryPayload,
  CreateCommentPayload,
  CreateThreadPayload,
  ForumAdminComment,
  ForumCategory,
  ForumComment,
  ForumCommentLikeResult,
  ForumEnvelope,
  ForumReactionKind,
  ForumReactionResult,
  ForumThread,
  ForumThreadDetail,
  ModerateThreadPayload,
  UpdateThreadPayload,
} from './forum.models';

/** All forum API calls. Responses are wrapped by the API interceptor; `.data` is unwrapped here. */
@Injectable({ providedIn: 'root' })
export class ForumService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.url2}forum`;

  private categories$: Observable<ForumCategory[]> | null = null;

  // ---- Categories ----------------------------------------------------------------------------

  /** Categories are cached for the session; admin mutations invalidate the cache. */
  getCategories(force = false): Observable<ForumCategory[]> {
    if (!this.categories$ || force) {
      this.categories$ = this.unwrap(
        this.http.get<ForumEnvelope<ForumCategory[]>>(`${this.baseUrl}/categories`),
      ).pipe(shareReplay({ bufferSize: 1, refCount: false }));
    }
    return this.categories$;
  }

  // ---- Threads -------------------------------------------------------------------------------

  getThreads(category?: string, q?: string): Observable<ForumThread[]> {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    if (q) params = params.set('q', q);
    return this.unwrap(
      this.http.get<ForumEnvelope<ForumThread[]>>(`${this.baseUrl}/threads`, { params }),
    );
  }

  getMyThreads(): Observable<ForumThread[]> {
    return this.unwrap(this.http.get<ForumEnvelope<ForumThread[]>>(`${this.baseUrl}/threads/mine`));
  }

  getSavedThreads(): Observable<ForumThread[]> {
    return this.unwrap(
      this.http.get<ForumEnvelope<ForumThread[]>>(`${this.baseUrl}/threads/saved`),
    );
  }

  /** Also counts one view for the signed-in user (server side). */
  getThread(slug: string): Observable<ForumThreadDetail> {
    return this.unwrap(
      this.http.get<ForumEnvelope<ForumThreadDetail>>(
        `${this.baseUrl}/threads/${encodeURIComponent(slug)}`,
      ),
    );
  }

  createThread(payload: CreateThreadPayload): Observable<ForumThread> {
    return this.unwrap(
      this.http.post<ForumEnvelope<ForumThread>>(`${this.baseUrl}/threads`, payload),
    );
  }

  updateThread(id: string, payload: UpdateThreadPayload): Observable<ForumThread> {
    return this.unwrap(
      this.http.patch<ForumEnvelope<ForumThread>>(`${this.baseUrl}/threads/${id}`, payload),
    );
  }

  deleteThread(id: string): Observable<{ deleted: boolean }> {
    return this.unwrap(
      this.http.delete<ForumEnvelope<{ deleted: boolean }>>(`${this.baseUrl}/threads/${id}`),
    );
  }

  // ---- Comments & reactions ------------------------------------------------------------------

  addComment(threadId: string, payload: CreateCommentPayload): Observable<ForumComment> {
    return this.unwrap(
      this.http.post<ForumEnvelope<ForumComment>>(
        `${this.baseUrl}/threads/${threadId}/comments`,
        payload,
      ),
    );
  }

  deleteComment(commentId: string): Observable<{ deleted: boolean }> {
    return this.unwrap(
      this.http.delete<ForumEnvelope<{ deleted: boolean }>>(
        `${this.baseUrl}/comments/${commentId}`,
      ),
    );
  }

  reactToThread(
    threadId: string,
    reaction: ForumReactionKind,
    active: boolean,
  ): Observable<ForumReactionResult> {
    return this.unwrap(
      this.http.post<ForumEnvelope<ForumReactionResult>>(
        `${this.baseUrl}/threads/${threadId}/reactions`,
        { reaction, active },
      ),
    );
  }

  likeComment(commentId: string, active: boolean): Observable<ForumCommentLikeResult> {
    return this.unwrap(
      this.http.post<ForumEnvelope<ForumCommentLikeResult>>(
        `${this.baseUrl}/comments/${commentId}/like`,
        { active },
      ),
    );
  }

  // ---- Admin ---------------------------------------------------------------------------------

  getAdminThreads(): Observable<ForumThread[]> {
    return this.unwrap(
      this.http.get<ForumEnvelope<ForumThread[]>>(`${this.baseUrl}/admin/threads`),
    );
  }

  moderateThread(id: string, payload: ModerateThreadPayload): Observable<ForumThread> {
    return this.unwrap(
      this.http.patch<ForumEnvelope<ForumThread>>(`${this.baseUrl}/admin/threads/${id}`, payload),
    );
  }

  getAdminComments(): Observable<ForumAdminComment[]> {
    return this.unwrap(
      this.http.get<ForumEnvelope<ForumAdminComment[]>>(`${this.baseUrl}/admin/comments`),
    );
  }

  moderateComment(id: string, isDeleted: boolean): Observable<{ updated: boolean }> {
    return this.unwrap(
      this.http.patch<ForumEnvelope<{ updated: boolean }>>(`${this.baseUrl}/admin/comments/${id}`, {
        isDeleted,
      }),
    );
  }

  createCategory(payload: CategoryPayload): Observable<ForumCategory> {
    return this.unwrap(
      this.http.post<ForumEnvelope<ForumCategory>>(`${this.baseUrl}/admin/categories`, payload),
    ).pipe(tap(() => this.invalidateCategories()));
  }

  updateCategory(id: string, payload: CategoryPayload): Observable<ForumCategory> {
    return this.unwrap(
      this.http.patch<ForumEnvelope<ForumCategory>>(
        `${this.baseUrl}/admin/categories/${id}`,
        payload,
      ),
    ).pipe(tap(() => this.invalidateCategories()));
  }

  deleteCategory(id: string): Observable<{ deleted: boolean }> {
    return this.unwrap(
      this.http.delete<ForumEnvelope<{ deleted: boolean }>>(
        `${this.baseUrl}/admin/categories/${id}`,
      ),
    ).pipe(tap(() => this.invalidateCategories()));
  }

  invalidateCategories(): void {
    this.categories$ = null;
  }

  private unwrap<T>(source: Observable<ForumEnvelope<T>>): Observable<T> {
    return source.pipe(map((res) => res.data));
  }
}
