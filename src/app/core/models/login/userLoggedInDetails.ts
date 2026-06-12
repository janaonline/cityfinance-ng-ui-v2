import { ObjectID } from '../document.type';
import { AccessLevel, Permission } from '../../auth/permissions';
import { USER_TYPE } from '../user/userType';

export interface IUserLoggedInDetails {
  email: string;
  isActive: boolean;
  name: string;
  role: USER_TYPE;
  scope?: string;
  accessLevel?: AccessLevel;
  state?: ObjectID;
  ulb?: ObjectID;
  isXVIFCProfileVerified?: boolean;
  permissionOverrides?: {
    allow: Permission[];
    deny: Permission[];
  };
}
