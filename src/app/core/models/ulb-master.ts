import { UploadedFileMetadata } from '../../shared/dynamic-form/components/file/file-metadata.types';

export interface IUlbApproval {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedBy?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  rejectReason?: string;
}

/** Canonical dynamic-form uploaded-file shape persisted by the Register ULB form. */
export type IUlbGazetteFile = UploadedFileMetadata;

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
  ulbTypeName?: string;
  state: string;
  stateName?: string;
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
  /** True for a legacy ULB that predates the approval workflow (no `approval` ever stored) —
   *  the backend backfills a synthetic 'APPROVED' `approval` for these on read, but this flag
   *  is what actually distinguishes them from an ADMIN-reviewed approval. */
  isExistingUser?: boolean;
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
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXISTING';
  sortBy?: 'name' | 'code' | 'createdAt';
  sortDir?: 1 | -1;
  page?: number;
  limit?: number;
}

/** xvi-fc dynamic year access — one materialized (or admin-set seed) year entry on a ULB. */
export interface IUlbYearAccessEntry {
  yearEnabled: boolean;
  yearId: string;
  disabledFormIds: number[];
}

/** A formId currently eligible for the exemption checklist — see cf-nest-api-v2's
 *  src/master/form-json-config/CLAUDE.md for what each field means and the full formId registry. */
export interface IExemptableForm {
  formId: number;
  isApplicableForExemption: boolean;
  exemptionGraceYears: number;
  submissionScope: 'PER_YEAR' | 'ONCE_EVER';
  /** Backend-computed display label (falls back to "Form #<id>" server-side for an unregistered
   *  formId) — render this directly instead of keeping a formId -> label map here. */
  label: string;
}

/** `GET master/ulb/:id/year-access` response. */
export interface IUlbYearAccess {
  startYear: number | null;
  yearAccess: Record<string, IUlbYearAccessEntry>;
  exemptableForms: IExemptableForm[];
}

/** `PATCH master/ulb/:id/year-access` payload — both fields optional/patch-style, edit-anytime,
 *  never blocks Approve/Reject. */
export interface IUpdateUlbYearAccess {
  startYear?: number | null;
  disabledFormIds?: number[];
}
