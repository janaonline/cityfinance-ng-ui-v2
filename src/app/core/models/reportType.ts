import { IULB } from './ulb';

export interface IReportType {
  isComparative: boolean;
  type: "Summary" | "Detailed";
  years: any[];
  yearList: any[];
  reportGroup: string;
  ulbList: IULB[];
  ulbIds: string[];
  valueType: "absolute" | "per_capita";
}
