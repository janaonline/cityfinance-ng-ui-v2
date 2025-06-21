export interface BondIssuances {
  bondIssueAmount: number;
  totalMunicipalBonds: number;
  inProgress: boolean;
}

export interface CreditRatings {
  ulb: string;
  state: string;
  agency: string;
  creditrating: string;
  status: string;
  date: string;
}

export interface CreditRatingData {
  total: number;
  creditRatingAboveBBB_Minus: number;
}

export interface CreditRatingMap {
  [region: string]: CreditRatingData;
}

export interface States {
  code: string;
  _id: string;
  name: string;
}

export interface Ulbs {
  code: string;
  censusCode: string;
  sbCode?: string;
  name: string;
  _id: string;
  state: string;
}

export interface ExploreSectionResponse {
  gridDetails: ExploresectionTable[];
  lastModifiedAt: string | null;
}

export interface ExploresectionTable {
  sequence: number;
  label: string;
  value: string | number;
  info: string;
  src: string;
}
