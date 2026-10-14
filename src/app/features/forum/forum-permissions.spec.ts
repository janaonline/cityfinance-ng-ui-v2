import { formatRelativeDate } from './forum-date';
import {
  canComment,
  canDeleteThread,
  canEditThread,
  canModerateComment,
  isAuthor,
  isForumAdmin,
} from './forum-permissions';

describe('forum permissions', () => {
  const author = { _id: 'u1', role: 'ULB' };
  const other = { _id: 'u2', role: 'STATE' };
  const admin = { _id: 'u3', role: 'ADMIN' };
  const thread = { user: { userId: 'u1' } };

  it('identifies admins by role', () => {
    expect(isForumAdmin(admin)).toBeTrue();
    expect(isForumAdmin(author)).toBeFalse();
    expect(isForumAdmin(null)).toBeFalse();
  });

  it('identifies the author by userId === _id', () => {
    expect(isAuthor(author, thread)).toBeTrue();
    expect(isAuthor(other, thread)).toBeFalse();
    expect(isAuthor({ role: 'ULB' }, thread)).toBeFalse();
    expect(isAuthor(author, { user: null })).toBeFalse();
  });

  it('allows the author and admins to edit / delete threads and moderate comments', () => {
    for (const fn of [canEditThread, canDeleteThread, canModerateComment]) {
      expect(fn(author, thread)).toBeTrue();
      expect(fn(admin, thread)).toBeTrue();
      expect(fn(other, thread)).toBeFalse();
      expect(fn(null, thread)).toBeFalse();
    }
  });

  it('lets any signed-in user comment', () => {
    expect(canComment(other)).toBeTrue();
    expect(canComment(null)).toBeFalse();
  });
});

describe('formatRelativeDate', () => {
  const now = new Date('2026-10-13T12:00:00Z');

  it('formats recent dates relatively', () => {
    expect(formatRelativeDate('2026-10-13T09:00:00Z', now)).toBe('3 hours ago');
    expect(formatRelativeDate('2026-10-12T12:00:00Z', now)).toBe('yesterday');
    expect(formatRelativeDate('2026-10-13T11:59:50Z', now)).toBe('just now');
  });

  it('falls back to absolute dates for old or invalid values', () => {
    expect(formatRelativeDate('2025-01-01T00:00:00Z', now)).toContain('2025');
    expect(formatRelativeDate('not a date', now)).toBe('');
    expect(formatRelativeDate(null, now)).toBe('');
  });
});
