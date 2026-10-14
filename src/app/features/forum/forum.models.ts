/** Typed models for the forum API (`/api/v2/forum`). Mirrors cf-nest-api-v2 `forum.types.ts`. */

export interface ForumEnvelope<T> {
  success: boolean;
  data: T;
  timestamp?: string;
  requestId?: string;
}

export interface ForumPublicUser {
  userId: string;
  name: string;
  role: string;
}

export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
}

export interface ForumThread {
  id: string;
  title: string;
  slug: string;
  body: string;
  categoryId: string;
  categorySlug: string;
  user: ForumPublicUser;
  replyCount: number;
  viewCount: number;
  likeCount: number;
  bookmarkCount: number;
  isPublished: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  liked?: boolean;
  bookmarked?: boolean;
}

export interface ForumComment {
  id: string;
  threadId: string;
  parentId?: string;
  body: string;
  user: ForumPublicUser;
  likeCount: number;
  deletedAt: string | null;
  deletedBy: string | null;
  createdAt: string;
  updatedAt: string;
  liked?: boolean;
}

export interface ForumAdminComment extends ForumComment {
  threadTitle: string;
  threadSlug: string | null;
}

export interface ForumThreadDetail {
  thread: ForumThread;
  comments: ForumComment[];
}

export type ForumReactionKind = 'like' | 'bookmark';

export interface ForumReactionResult {
  active: boolean;
  likeCount?: number;
  bookmarkCount?: number;
}

export interface ForumCommentLikeResult {
  active: boolean;
  likeCount: number;
}

export interface CreateThreadPayload {
  title: string;
  body: string;
  categorySlug: string;
}

export type UpdateThreadPayload = Partial<CreateThreadPayload>;

export interface CreateCommentPayload {
  body: string;
  parentId?: string;
}

export interface ModerateThreadPayload {
  isPublished?: boolean;
  isDeleted?: boolean;
}

export interface CategoryPayload {
  name: string;
  slug?: string;
  description: string;
}

/** Normalised error shown in forms: a general message plus per-field messages. */
export interface ForumFormError {
  message: string;
  fields: Record<string, string>;
}

/** Presentation copy for a category page, keyed by slug (see `FORUM_CATEGORY_CONTENT`). */
export interface ForumCategoryContent {
  name: string;
  slug: string;
  description: string;
  eyebrow: string;
  heading: string;
  message: string;
}

/** The minimal viewer shape needed by permission helpers (the app user plus Mongo `_id`). */
export interface ForumViewer {
  _id?: string;
  role?: string;
}
