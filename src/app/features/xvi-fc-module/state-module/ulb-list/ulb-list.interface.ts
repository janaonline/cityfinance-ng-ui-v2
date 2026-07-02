import { FieldConfig } from '../../../../shared/dynamic-form/field.interface';
import { IState } from '../../../../core/models/state/state';
import { IUlbMaster, IUlbType } from '../../../../core/models/ulb-master';

export type UlbDialogAction = 'Create' | 'Edit';

export interface UlbDialogData {
  action: UlbDialogAction;
  ulbTemplate: FieldConfig[];
  ulbId: string | null;
  states: IState[];
  ulbTypes: IUlbType[];
  ulb?: Partial<IUlbMaster>;
  /** When true, the State select is pre-filled and disabled (STATE users can only submit for their own state). */
  lockState?: boolean;
}

export interface UlbDialogResponse {
  action: UlbDialogAction;
  ulbId: string | null;
  payload: Record<string, unknown>;
}
