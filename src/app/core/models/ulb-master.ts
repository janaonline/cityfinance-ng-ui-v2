export interface IUlbApproval {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedBy?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  rejectReason?: string;
}

export interface IUlbGazetteFile {
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType?: string;
  noOfPage: number | null;
}

/** ULB master-data record, as returned by the cf-nest-api-v2 `master/ulb` CRUD endpoints. */
export interface IUlbMaster {
  _id: string;
  code: string;
  name: string;
  slug?: string;
  censusCode?: string | null;
  sbCode?: string | null;
  population?: number;
  area?: number;
  wards?: number;
  ulbType: string;
  state: string;
  district?: string;
  natureOfUlb?: string | null;
  isUA?: 'YES' | 'No';
  isMillionPlus?: 'YES' | 'No';
  amrut?: string;
  lgdCode?: string;
  regionalName?: string;
  dateOfConstitution?: string | null;
  gazetteNotificationNumber?: string | null;
  gazetteNotificationFile?: IUlbGazetteFile | null;
  isActive: boolean;
  isPublish: boolean;
  approval: IUlbApproval;
  createdAt?: string;
  modifiedAt?: string;
}

export interface IUlbType {
  _id: string;
  name: string;
}

/** Generic NestJS response envelope applied by ResponseTransformInterceptor. */
export interface IApiEnvelope<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface IUlbMasterPage {
  data: IUlbMaster[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface IUlbMasterListQuery {
  search?: string;
  state?: string;
  ulbType?: string;
  isActive?: boolean;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  sortBy?: 'name' | 'code' | 'createdAt';
  sortDir?: 1 | -1;
  page?: number;
  limit?: number;
}
