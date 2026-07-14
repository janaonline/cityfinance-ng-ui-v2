import { ConditionalFieldConfig } from '../../dynamic-form-visibility.service';
import { FormActor, FormStatusValue } from '../../shared/form-progress/form-progress.component';

/** Canonical Finance Commission cycle identifiers. Never render these raw — use the page's computed display label instead. */
export type FcUnspentApplicableFc = '14TH_FC' | '15TH_FC';

export interface FcUnspentPermissions {
  canView: boolean;
  canEdit: boolean;
  canFinalSubmit: boolean;
}

/** One selectable ULB option, sourced from the backend in the real integration. */
export interface FcUnspentUlbOption {
  ulbId: string;
  censusCode: string | null;
  sbCode: string | null;
  ulbName: string;
  allocationAmount: number;
}

/**
 * One row of the unspent-ULB table. Only `ulbId` and `unspentAmount` are State-editable — the
 * rest, including `allocationPerc`/`eligibility`, are backend-owned. The frontend recomputes
 * `allocationPerc`/`eligibility` for preview only; the backend calculation remains authoritative.
 */
export interface FcUnspentUlbData {
  slNo: number;
  ulbId: string;
  censusCode: string | null;
  sbCode: string | null;
  ulbName: string;
  allocationAmount: number;
  unspentAmount: number;
  allocationPerc: number;
  eligibility: boolean;
}

export interface FcUnspentDeclarationData {
  stateName: string;
  applicableFc: FcUnspentApplicableFc;
  currentFormStatus: FormStatusValue;
  permissions: FcUnspentPermissions;
  actors: FormActor[];
  questions: ConditionalFieldConfig[];
  ulbOptions: FcUnspentUlbOption[];
  unspentUlbData: FcUnspentUlbData[];
}

/** UI dev fixture envelope shape only — not a confirmed backend contract. */
export interface FcUnspentDeclarationPreviewResponse {
  success: boolean;
  message: string;
  data: FcUnspentDeclarationData;
}
