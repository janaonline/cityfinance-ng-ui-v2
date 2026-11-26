import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ForumThread } from '../forum.models';
import { ThreadCardComponent } from './thread-card.component';

const thread = (overrides: Partial<ForumThread> = {}): ForumThread => ({
  id: 't1',
  title: 'Grant query',
  slug: 'grant-query',
  body: 'body',
  categoryId: 'c1',
  categorySlug: 'ulb-queries',
  user: { userId: 'u1', name: 'Kaithoon Municipality', role: 'ULB' },
  replyCount: 0,
  viewCount: 3,
  likeCount: 1,
  bookmarkCount: 987,
  isPublished: true,
  deletedAt: null,
  createdAt: '2026-11-01T10:00:00Z',
  updatedAt: '2026-11-01T10:00:00Z',
  lastActivityAt: '2026-11-01T10:00:00Z',
  lastReply: null,
  ...overrides,
});

describe('ThreadCardComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ThreadCardComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  function render(value: ForumThread, categoryName: string | null = null): HTMLElement {
    const fixture = TestBed.createComponent(ThreadCardComponent);
    fixture.componentRef.setInput('thread', value);
    fixture.componentRef.setInput('categoryName', categoryName);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows "No replies yet" when the thread has no reply', () => {
    const el = render(thread());
    expect(el.querySelector('.thread-last-post')?.textContent).toContain('No replies yet');
  });

  it('shows the last replier name in the Last post cell', () => {
    const el = render(
      thread({
        lastReply: {
          userId: 'u2',
          name: 'State DMA, Punjab',
          role: 'STATE',
          createdAt: '2026-11-20T10:00:00Z',
        },
      }),
    );
    expect(el.querySelector('.thread-last-post strong')?.textContent).toContain(
      'State DMA, Punjab',
    );
  });

  it('shows the topic name, not the slug, and no bookmark count', () => {
    expect(render(thread()).querySelector('.meta a')?.textContent).toContain('ULB Queries');
    const custom = render(thread({ categorySlug: 'water-supply' }), 'Water Supply');
    expect(custom.querySelector('.meta a')?.textContent).toContain('Water Supply');
    expect(custom.textContent).not.toContain('987');
  });
});
