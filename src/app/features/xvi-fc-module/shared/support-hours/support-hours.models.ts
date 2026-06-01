export interface NextSupportHour {
  date: string;
  description: string;
  time: string;
  hostedBy: string;
  joinUrl?: string;
}

export interface UpcomingSupportHour {
  date: string;
  details: string;
  status: string;
}

export interface SupportHoursApiResponse {
  nextSupportHour: NextSupportHour;
  upcomingSupportHours: UpcomingSupportHour[];
}
