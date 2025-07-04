import { IState } from './state/state';

export interface BondIssuances {
  bondIssueAmount: number;
  totalMunicipalBonds: number;
  inProgress: boolean;
}

export interface BorrowingsData extends BorrowingsKeys {
  table: string;
  key: string;
  header: string;
  label: string;
}

export interface BorrowingsKeys {
  [key: string]: string | null;
}

// export interface CreditRatings {
//   ulb: string;
//   state: string;
//   agency: string;
//   creditrating: string;
//   status: string;
//   date: string;
// }

// export interface CreditRatingData {
//   total: number;
//   creditRatingAboveBBB_Minus: number;
// }

// export interface CreditRatingMap {
//   [region: string]: CreditRatingData;
// }

// export interface States {
//   code: string;
//   _id: string;
//   name: string;
// }

// export interface Ulbs {
//   code: string;
//   censusCode: string;
//   sbCode?: string;
//   name: string;
//   _id: string;
//   state: string;
// }

export interface ExploreSectionResponse {
  gridDetails: ExploresectionTable[];
  lastModifiedAt: string | null;
  popCat: string;
  state: IState;
  ulbId: string;
  ulbName: string;
}

export interface ExploresectionTable {
  sequence: number;
  label: string;
  value: string | number;
  info: string;
  src: string;
}

export interface BsIsDataBase {
  code?: string | number | null;
  reportType?: string | null;
  lineItem: string;
  class?: string;
  info?: string;
}

export interface BsIsData extends BsIsDataBase {
  [year: `${number}`]: number | string | null;
}

export interface AfsPopupData {
  excel: FileData[];
  pdf: FileData[];
  type: string;
}

export interface FileData {
  name: string;
  url: string;
}

export interface FileMetadata {
  fileName: string;
  fileUrl: string;
  modifiedAt: string;
  state: string;
  type: string;
  ulbId: string;
  ulbName: string;
  year: string;
  _id: string;
}

export interface ButtonObj {
  label: string;
  key: string;
}
