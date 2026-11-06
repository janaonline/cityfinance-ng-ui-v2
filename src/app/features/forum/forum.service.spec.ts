import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { toFormError } from './forum-errors';
import { ForumCategory, ForumThread } from './forum.models';
import { ForumService } from './forum.service';

const base = `${environment.api.url2}forum`;
const wrap = <T>(data: T) => ({ success: true, data, timestamp: 't', requestId: 'r' });

describe('ForumService', () => {
  let service: ForumService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ForumService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('unwraps the response envelope for categories and caches them', () => {
    const categories = [{ id: '1', slug: 'mohua' } as ForumCategory];
    let first: ForumCategory[] | undefined;
    let second: ForumCategory[] | undefined;
    service.getCategories().subscribe((c) => (first = c));
    http.expectOne(`${base}/categories`).flush(wrap(categories));
    service.getCategories().subscribe((c) => (second = c));
    http.expectNone(`${base}/categories`);
    expect(first).toEqual(categories);
    expect(second).toEqual(categories);
  });

  it('sends category and q query params, omitting empty ones', () => {
    service.getThreads('mohua', 'grants').subscribe();
    const req = http.expectOne((r) => r.url === `${base}/threads`);
    expect(req.request.params.get('category')).toBe('mohua');
    expect(req.request.params.get('q')).toBe('grants');
    req.flush(wrap([]));

    service.getThreads(undefined, '').subscribe();
    const bare = http.expectOne((r) => r.url === `${base}/threads`);
    expect(bare.request.params.keys().length).toBe(0);
    bare.flush(wrap([]));
  });

  it('hits mine / saved / detail endpoints', () => {
    service.getMyThreads().subscribe();
    http.expectOne(`${base}/threads/mine`).flush(wrap([]));
    service.getSavedThreads().subscribe();
    http.expectOne(`${base}/threads/saved`).flush(wrap([]));
    let detail: unknown;
    service.getThread('a b').subscribe((d) => (detail = d));
    http.expectOne(`${base}/threads/a%20b`).flush(wrap({ thread: { id: 't' }, comments: [] }));
    expect(detail).toEqual({ thread: { id: 't' }, comments: [] });
  });

  it('creates, edits and deletes threads', () => {
    service
      .createThread({ title: 'Hello', body: 'b'.repeat(20), categorySlug: 'mohua' })
      .subscribe();
    const create = http.expectOne(`${base}/threads`);
    expect(create.request.method).toBe('POST');
    expect(create.request.body.categorySlug).toBe('mohua');
    create.flush(wrap({ id: '1' } as ForumThread));

    service.updateThread('1', { title: 'New' }).subscribe();
    const patch = http.expectOne(`${base}/threads/1`);
    expect(patch.request.method).toBe('PATCH');
    patch.flush(wrap({ id: '1' }));

    service.deleteThread('1').subscribe();
    const del = http.expectOne(`${base}/threads/1`);
    expect(del.request.method).toBe('DELETE');
    del.flush(wrap({ deleted: true }));
  });

  it('posts comments, reactions and comment likes', () => {
    service.addComment('t1', { body: 'hi', parentId: 'p' }).subscribe();
    const comment = http.expectOne(`${base}/threads/t1/comments`);
    expect(comment.request.body).toEqual({ body: 'hi', parentId: 'p' });
    comment.flush(wrap({ id: 'c' }));

    let result: unknown;
    service.reactToThread('t1', 'bookmark', true).subscribe((r) => (result = r));
    const react = http.expectOne(`${base}/threads/t1/reactions`);
    expect(react.request.body).toEqual({ reaction: 'bookmark', active: true });
    react.flush(wrap({ active: true, bookmarkCount: 3 }));
    expect(result).toEqual({ active: true, bookmarkCount: 3 });

    service.likeComment('c1', false).subscribe();
    const like = http.expectOne(`${base}/comments/c1/like`);
    expect(like.request.body).toEqual({ active: false });
    like.flush(wrap({ active: false, likeCount: 0 }));

    service.deleteComment('c1').subscribe();
    const del = http.expectOne(`${base}/comments/c1`);
    expect(del.request.method).toBe('DELETE');
    del.flush(wrap({ deleted: true }));
  });

  it('calls admin endpoints and invalidates the category cache on mutation', () => {
    service.getAdminThreads().subscribe();
    http.expectOne(`${base}/admin/threads`).flush(wrap([]));
    service.getAdminComments().subscribe();
    http.expectOne(`${base}/admin/comments`).flush(wrap([]));
    service.moderateThread('1', { isPublished: false }).subscribe();
    const mt = http.expectOne(`${base}/admin/threads/1`);
    expect(mt.request.body).toEqual({ isPublished: false });
    mt.flush(wrap({ id: '1' }));
    service.moderateComment('2', true).subscribe();
    const mc = http.expectOne(`${base}/admin/comments/2`);
    expect(mc.request.body).toEqual({ isDeleted: true });
    mc.flush(wrap({ updated: true }));

    service.getCategories().subscribe();
    http.expectOne(`${base}/categories`).flush(wrap([]));
    service.createCategory({ name: 'New', description: 'Desc' }).subscribe();
    http.expectOne(`${base}/admin/categories`).flush(wrap({ id: 'n' }));
    service.getCategories().subscribe();
    http.expectOne(`${base}/categories`).flush(wrap([]));

    service.updateCategory('n', { name: 'N2', description: 'Desc' }).subscribe();
    const upd = http.expectOne(`${base}/admin/categories/n`);
    expect(upd.request.method).toBe('PATCH');
    upd.flush(wrap({ id: 'n' }));

    service.deleteCategory('n').subscribe();
    const del = http.expectOne(`${base}/admin/categories/n`);
    expect(del.request.method).toBe('DELETE');
    del.flush(wrap({ deleted: true }));
  });
});

describe('toFormError', () => {
  it('maps validation message arrays to fields', () => {
    const err = new HttpErrorResponse({
      status: 400,
      error: { message: ['Title must be 5–140 characters.', 'Body must be 20–20,000 characters.'] },
    });
    const result = toFormError(err);
    expect(result.fields['title']).toContain('Title');
    expect(result.fields['body']).toContain('Body');
    expect(result.message).toBe('Please fix the errors below.');
  });

  it('uses a string message and a fallback', () => {
    expect(
      toFormError(new HttpErrorResponse({ status: 403, error: { message: 'Nope.' } })).message,
    ).toBe('Nope.');
    expect(toFormError(new HttpErrorResponse({ status: 500 }), 'Fallback').message).toBe(
      'Fallback',
    );
    expect(toFormError(new HttpErrorResponse({ status: 0 })).message).toContain('Could not reach');
  });
});
