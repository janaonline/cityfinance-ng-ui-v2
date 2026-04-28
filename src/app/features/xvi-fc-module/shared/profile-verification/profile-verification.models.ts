export interface ProfileVerificationApiResponse {
  stateName: string;
  contactPersonName: string;
  designation: string;
  officialEmail: string;
  mobileNumber: string;
  // ULB-only pre-filled fields
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
}
