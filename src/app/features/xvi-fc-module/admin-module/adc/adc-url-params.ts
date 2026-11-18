import { ParamMap, Params } from '@angular/router';
import {
  ADC_DEFAULT_PAGE_SIZE,
  ADC_MAX_PAGE_SIZE,
  ADC_PAGE_SIZE_OPTIONS,
} from '../../shared/adc/adc-paging.constants';

/** Navigation state the ADC list puts on its links, so the detail page's "ADC" breadcrumb reopens the list as it was. */
export interface AdcListNavigationState {
  adcListQuery?: Params;
}

/** `page` and `limit` from the URL: a bad value falls back to the default, a limit over the max is clamped. */
export function readPageParams(params: ParamMap): { page: number; limit: number } {
  const page = Number(params.get('page'));
  const limit = Number(params.get('limit'));
  return {
    page: Number.isInteger(page) && page >= 1 ? page : 1,
    limit:
      Number.isInteger(limit) && limit > ADC_MAX_PAGE_SIZE
        ? ADC_MAX_PAGE_SIZE
        : ADC_PAGE_SIZE_OPTIONS.includes(limit)
          ? limit
          : ADC_DEFAULT_PAGE_SIZE,
  };
}
