import { IUlbMaster } from '../../../../core/models/ulb-master';

/** 'Resubmit' is the STATE user's fix-and-resend flow for a REJECTED ULB — uses the
 *  Register page's field set (not the ADMIN-only Edit field set). */
export type UlbDialogAction = 'Create' | 'Edit' | 'Resubmit';

export interface UlbDialogData {
  action: UlbDialogAction;
  ulbId: string | null;
  ulb?: Partial<IUlbMaster>;
}

export interface UlbDialogResponse {
  action: UlbDialogAction;
  ulbId: string | null;
  payload: Record<string, unknown>;
}
