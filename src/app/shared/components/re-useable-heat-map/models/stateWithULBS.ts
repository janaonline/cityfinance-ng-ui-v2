import { IStateULBCovered } from "../../../../core/models/stateUlbConvered";
import { ULBWithMapData } from "../../../../core/models/ulbsForMapResponse";


export interface IStateWithULBS extends IStateULBCovered {
  ulbs: ULBWithMapData[];
}
