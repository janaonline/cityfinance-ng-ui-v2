export type OtpPurpose = 'login';

export interface SendOtpPayload {
  identifier: string;
  purpose?: OtpPurpose;
}

export interface SendOtpResponse {
  success: true;
  message: string;
  mobile?: string;
  email?: string;
  requestId?: string;
}

export interface VerifyOtpPayload {
  identifier: string;
  requestId?: string;
  otp: string;
}

export type UserRole =
  | 'ADMIN'
  | 'MoHUA'
  | 'PARTNER'
  | 'STATE'
  | 'ULB'
  | 'USER'
  | 'XVIFC_STATE'
  | 'STATE_DASHBOARD'
  | 'AFS_ADMIN'
  | 'XVIFC'
  | 'PMU'
  | 'AAINA';

export type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NA';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  username: string;
  sbCode: string | null;
  censusCode: string | null;
  designation: string;
  organization: string;
  state: string | null;
  ulb: string | null;
  createdBy: string | null;
  departmentName: string;
  departmentContactNumber: string;
  departmentEmail: string;
  address: string;
  commissionerName: string;
  commissionerEmail: string;
  commissionerConatactNumber: string;
  accountantName: string;
  accountantEmail: string;
  accountantConatactNumber: string;
  status: UserStatus;
  rejectReason: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isDeleted: boolean;
  isRegistered: boolean;
  isVerified2223: boolean;
  isNodalOfficer: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VerifyOtpResponse {
  token: string;
  user: AuthUser;
  allYears?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  errors?: Record<string, string[]>;
}

export const OtpErrorMessage = {
  PLEASE_WAIT: 'Please wait before requesting another OTP.',
  MAX_RESEND: 'Maximum OTP requests reached. Please try again later.',
  LOCKED: 'Too many attempts. Please try again later.',
  TOO_MANY_VERIFY: 'Too many attempts. Please request a new OTP.',
  INVALID_OTP: 'Invalid or expired OTP',
} as const;
