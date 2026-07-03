export interface UlbContacts {
  commissionerName?: string;
  commissionerEmail?: string;
  commissionerConatactNumber?: string;
  accountantName: string;
  accountantEmail: string;
  accountantConatactNumber: string;
}

export interface UlbEntityInfo {
  name: string;
  ulbCode?: string;
  censusCode?: string;
  ulbType?: string;
  stateName?: string;
}

export interface StateProfile {
  name: string;
  email: string;
  mobile: string;
  designation: string;
}
