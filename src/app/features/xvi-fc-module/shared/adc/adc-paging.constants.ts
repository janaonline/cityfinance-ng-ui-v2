/** Every ADC table (list, members, ULBs) pages at most 20 rows; the API clamps anything larger. */
export const ADC_PAGE_SIZE_OPTIONS: readonly number[] = [10, 20];
export const ADC_DEFAULT_PAGE_SIZE = 20;
export const ADC_MAX_PAGE_SIZE = 20;
