export interface EventAlert {
  _id: string;
  webinarId: string;
  title: string;
  desc: string;
  eventStatus: number;
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
  items: EventAlert[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface EventDeleteResponse {
  success: boolean;
  message: string;
}
