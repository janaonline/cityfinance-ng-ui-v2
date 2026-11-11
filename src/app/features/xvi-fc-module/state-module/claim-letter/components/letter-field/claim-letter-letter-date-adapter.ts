import { Injectable } from '@angular/core';
import { UtcIsoDateAdapter } from '../../../../../../shared/dynamic-form/components/date/utc-iso-date-adapter';

const DMY_SLASH_PATTERN = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

/** The shared UTC-safe adapter (shown as "07 Oct 2026", the way the letter prints dates) that also
 *  reads a typed DD/MM/YYYY day-first; the native parser would read it month-first. */
@Injectable()
export class ClaimLetterLetterDateAdapter extends UtcIsoDateAdapter {
  override parse(value: unknown, parseFormat: unknown): Date | null {
    const match = typeof value === 'string' ? DMY_SLASH_PATTERN.exec(value.trim()) : null;
    if (!match) return super.parse(value, parseFormat);
    const [day, month, year] = [Number(match[1]), Number(match[2]) - 1, Number(match[3])];
    const date = new Date(year, month, day);
    // 31/02/2026 would roll over to March; treat it as invalid instead.
    return date.getDate() === day && date.getMonth() === month ? date : this.invalid();
  }
}
