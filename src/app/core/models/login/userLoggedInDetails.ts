import { ObjectID } from '../document.type';
import { AccessLevel, Permission } from '../../auth/permissions';
import { USER_TYPE } from '../user/userType';

export type StateSubRole = 'SUBMITTER' | 'EDITOR' | 'VIEWER';

export interface IUserLoggedInDetails {
  email: string;
  isActive: boolean;
  name: string;
  role: USER_TYPE;
  accessLevel?: AccessLevel;
  subRole?: StateSubRole;
  state?: ObjectID;
  // Resolved by the backend (buildUserResponsePayload / GET auth/me) as a sibling of `state`,
  // not nested under it — see municipal-data-hub.eligibility.ts for why this matters.
  stateName?: string | null;
  ulb?: ObjectID;
  /** Set only for an ADC (Autonomous District Council) user — a STATE-role user scoped to one ADC's ULBs. */
  adc?: ObjectID | null;
  adcName?: string | null;
  isXVIFCProfileVerified?: boolean;
  permissionOverrides?: {
    allow: Permission[];
    deny: Permission[];
  };
}
