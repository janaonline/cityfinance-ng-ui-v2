export interface ProfileItem {
  id?: string;
  _id?: string;
  name: string;
  designation: string;
  designantion?: string; // API variant (typo handled in service)
  email: string;
  mobile: string;
}

export interface EntityProfilesResponse {
  entityName: string;
  entityCode?: string;
  entityType?: string;
  stateName: string;
  profiles: ProfileItem[];
}
