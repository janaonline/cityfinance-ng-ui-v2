import { HttpErrorResponse } from '@angular/common/http';
import type { IAdcRow } from '../../../shared/adc/adc.service';
import { FormControl, Validators } from '@angular/forms';
import {
  IDENTIFIER_SECURITY_VALIDATORS,
  noHtmlOrScript,
  noMongoOperators,
} from '../../../../../auth/validators/auth-security.validators';

/** Same rules as the State invite form (roles-teams-overview). */
const PERSON_NAME_PATTERN = /^[a-zA-Z .\-']+$/;
const DESIGNATION_PATTERN = /^[a-zA-Z .-]+$/;

export const ADC_NAME_MAX_LENGTH = 100;

/** Controls for the ADC Admin's details, shared by the Add ADC and Change Admin dialogs. */
export function adcAdminControls() {
  return {
    adminName: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        Validators.pattern(PERSON_NAME_PATTERN),
        noHtmlOrScript,
        noMongoOperators,
      ],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(254), ...IDENTIFIER_SECURITY_VALIDATORS],
    }),
    mobile: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[6-9]\d{9}$/), noHtmlOrScript, noMongoOperators],
    }),
    designation: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        Validators.pattern(DESIGNATION_PATTERN),
        noHtmlOrScript,
        noMongoOperators,
      ],
    }),
  };
}

/** The email belongs to a member removed earlier: the dialog offers to restore them. */
export interface AdcRemovedMember {
  name: string;
  designation: string;
}

/** Reads an API error into either the restore offer or a message to show inline. */
export function readAdcError(err: unknown, fallback: string): { removed?: AdcRemovedMember; message?: string } {
  const body: Record<string, unknown> = (err as HttpErrorResponse)?.error ?? {};
  if (body['code'] === 'EMAIL_XVIFC_REMOVED') {
    const removed = body['removedUser'] as Partial<AdcRemovedMember> | undefined;
    return { removed: { name: removed?.name ?? '', designation: removed?.designation ?? '' } };
  }
  // A validation 400 carries an array of messages.
  const message = Array.isArray(body['message']) ? body['message'].join(' ') : body['message'];
  return { message: typeof message === 'string' && message ? message : fallback };
}

/** The counts an ADC's Delete depends on (a list row or the detail header). */
export type AdcDeleteFacts = Pick<IAdcRow, 'ulbCount' | 'memberCount' | 'admin'>;

/** Any ULB, or a member besides the Admin, keeps an ADC from being deleted (the API refuses it too). */
export function canDeleteAdc(adc: AdcDeleteFacts): boolean {
  return adc.ulbCount === 0 && adc.memberCount <= (adc.admin ? 1 : 0);
}

/** Why Delete is off, e.g. "Has 4 ULBs and 2 other members"; null when it is allowed. */
export function adcDeleteBlockedReason(adc: AdcDeleteFacts): string | null {
  if (canDeleteAdc(adc)) return null;
  const otherMembers = adc.memberCount - (adc.admin ? 1 : 0);
  const blockers = [
    adc.ulbCount > 0 ? `${adc.ulbCount} ULB${adc.ulbCount === 1 ? '' : 's'}` : null,
    otherMembers > 0 ? `${otherMembers} other member${otherMembers === 1 ? '' : 's'}` : null,
  ].filter(Boolean);
  return `Has ${blockers.join(' and ')}`;
}
