export interface ICreditRatingData {
  ulb: string;
  state: string;
  agency: string;
  creditrating: string;
  status: string;
  date: string;

  creditRating: string;
  outlook: string;
  type: string;
  amount: string | number;
  link: string;
}

export interface CreditRatingData {
  total: number;
  creditRatingAboveBBB_Minus: number;
}

export interface CreditRatingMap {
  [stateName: string]: CreditRatingData;
}
