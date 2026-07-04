import { IUlbMaster } from '../../../../core/models/ulb-master';

export type UlbDialogAction = 'Create' | 'Edit';

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
