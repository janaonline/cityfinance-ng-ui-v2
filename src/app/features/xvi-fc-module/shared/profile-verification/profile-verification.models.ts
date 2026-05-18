export interface ProfileItem {
  id?: string;
  name: string;
  designation: string;
  designantion?: string; // API variant (typo handled in service)
  email: string;
  mobile: string;
}

export interface EntityProfilesResponse {
  entityName: string;
  entityCode?: string;
  entityType?: string;
  stateName: string;
  profiles: ProfileItem[];
}

export interface ProfileVerificationApiResponse {
  stateName: string;
  contactPersonName: string;
  designation: string;
  officialEmail: string;
  mobileNumber: string;
  ulbName?: string;
  ulbCode?: string;
  ulbType?: string;
}

export interface ProfileVerificationPayload {
  isXVIFCProfileVerified: true;
  contactPersonName?: string;
  designation?: string;
  officialEmail?: string;
  mobileNumber?: string;
  otp?: string;
}
