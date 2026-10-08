/** ULB master record subset returned by cf-fastapi-v3's `/ulbs/autocomplete`. */
export interface IUlbSummary {
  _id: string;
  name: string;
  code?: string;
  slug?: string;
  keywords?: string;
  district?: string;
  natureOfUlb?: string;
  population?: number;
  wards?: number;
  area?: number;
}
