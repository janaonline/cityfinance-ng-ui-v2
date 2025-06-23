import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'inrFormat',
})
export class InrFormatPipe implements PipeTransform {
  /**
   * Transform a numeric value into formatted INR string.
   *
   * @param value - The raw value to be formatted
   * @param format - The display format: 'auto' | 'cr' | 'lakh' | 'k' | 'inr'
   * @param max - Maximum number of decimal places
   * @param min - Minimum number of decimal places
   * @returns A formatted INR string with unit
   */

  transform(
    value: unknown,
    format: 'auto' | 'cr' | 'lakh' | 'k' | 'inr' = 'auto',
    max: number = 0,
    min: number = 0,
  ): string {
    if (value === null || value === undefined || isNaN(Number(value))) return '-';

    const number = Number(value);
    const absNumber = Math.abs(number);
    let formatted: string;

    const options = {
      maximumFractionDigits: max,
      minimumFractionDigits: min,
    };

    switch (format) {
      case 'cr':
        formatted = `${(number / 1e7).toLocaleString('en-IN', options)} Cr`;
        break;
      case 'lakh':
        formatted = `${(number / 1e5).toLocaleString('en-IN', options)} Lakh`;
        break;
      case 'k':
        formatted = `${(number / 1e3).toLocaleString('en-IN', options)} K`;
        break;
      case 'inr':
        formatted = number.toLocaleString('en-IN');
        break;
      case 'auto':
      default:
        if (absNumber >= 1e7) {
          formatted = `${(number / 1e7).toLocaleString('en-IN', options)} Cr`;
        } else if (absNumber >= 1e5) {
          formatted = `${(number / 1e5).toLocaleString('en-IN', options)} Lakh`;
        } else if (absNumber >= 1e3) {
          formatted = `${(number / 1e3).toLocaleString('en-IN', options)} K`;
        } else {
          formatted = number.toLocaleString('en-IN');
        }
    }

    return `₹ ${formatted}`;
  }
}
