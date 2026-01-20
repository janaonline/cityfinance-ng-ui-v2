import { FieldConfig } from '../../shared/dynamic-form/field.interface';

export interface EventAlert {
  _id: string;
  webinarId: string;
  title: string;
  desc: string;
  eventStatus: 1 | 2;
  startAt: string;
  endAt: string;
  redirectionLink: string;
  formId?: string;
  buttonLabels?: string[];
  imgUrl?: string[];
  updatedAt: string;
}

export interface EventResponse {
  success: boolean;
  message: string;
  data: EventAlert;
}

export interface EventsResponseFindAll {
  data: EventAlert[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface EventDeleteResponse {
  success: boolean;
  message: string;
}

export interface EventTemplateDialogData {
  action: 'Create' | 'Edit';
  eventId: string | null;
  eventTemplate: FieldConfig[];
}

export interface EventTemplateDialogResponse {
  action: 'Create' | 'Edit';
  eventId: string | null;
  payload: EventAlert;
}

export const ARRAY_VALUES = ['buttonLabels', 'imgUrl'];
export const EVENT_STATUS = {
  1: 'Active',
  2: 'Draft',
};
