export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

export interface PagedData<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EmailTemplate {
  _id: string;
  name: string;
  slug: string;
  subject: string;
  body: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateTemplatePayload {
  name: string;
  slug: string;
  subject: string;
  body: string;
  isActive: boolean;
}

export type CreateTemplatePayload = UpdateTemplatePayload;

export interface SendEmailPayload {
  to: string[];
  templateId?: string;
  templateSlug?: string;
  subject: string;
  body: string;
  variables?: Record<string, string>;
}

// ── Automated email reminders ─────────────────────────────────────────────────

export type ReminderStatus = 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED';
export type RecipientCategory = 'ONLY_ME' | 'ULB' | 'STATE' | 'ALL';

export interface CreateReminderPayload {
  name: string;
  templateId: string;
  deadlineDate: string;
  reminderDaysBefore: number;
  reminderTime: string;
  recipientCategory: RecipientCategory;
  variables?: Record<string, string>;
}

export interface ReminderTemplateRef {
  _id: string;
  name: string;
  slug: string;
  subject: string;
}

export interface EmailReminder {
  _id: string;
  name: string;
  templateId: ReminderTemplateRef | null;
  deadlineDate: string;
  reminderDaysBefore: number;
  reminderTime: string;
  reminderDate: string;
  recipientCategory: RecipientCategory;
  variables: Record<string, string>;
  status: ReminderStatus;
  sentAt: string | null;
  sentCount: number;
  failedCount: number;
  lastError: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
