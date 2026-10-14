import { ForumViewer } from './forum.models';

interface HasAuthor {
  user?: { userId?: string | null } | null;
}

export const isForumAdmin = (viewer: ForumViewer | null | undefined): boolean =>
  viewer?.role === 'ADMIN';

/** Author = item.user.userId equals the signed-in user's `_id`. */
export const isAuthor = (viewer: ForumViewer | null | undefined, item: HasAuthor): boolean =>
  !!viewer?._id && !!item.user?.userId && item.user.userId === viewer._id;

export const canCreateThread = (viewer: ForumViewer | null | undefined): boolean => !!viewer;
export const canComment = canCreateThread;

export const canEditThread = (viewer: ForumViewer | null | undefined, thread: HasAuthor): boolean =>
  !!viewer && (isForumAdmin(viewer) || isAuthor(viewer, thread));
export const canDeleteThread = canEditThread;

export const canModerateComment = (
  viewer: ForumViewer | null | undefined,
  comment: HasAuthor,
): boolean => !!viewer && (isForumAdmin(viewer) || isAuthor(viewer, comment));
