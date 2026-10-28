import { DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs';
import {
  CLAIM_LETTER_ERROR_CODE,
  ClaimLetterApiErrorMap,
  ClaimLetterLetterDetailsSaveResult,
} from '../../claim-letter.models';
import { readApiError } from '../../claim-letter.utils';
import { isBlankValue } from '../letter-field/claim-letter-letter-field.component';

export type ClaimLetterSaveStatus = 'idle' | 'saving' | 'saved' | 'invalid' | 'failed';

/** A blank required box is still saved (as blank); only a wrong value is held back. */
export function hasBlockingError(control: AbstractControl): boolean {
  return Object.keys(control.errors ?? {}).some((name) => name !== 'required');
}

function sameValue(a: unknown, b: unknown): boolean {
  if (isBlankValue(a) || isBlankValue(b)) return isBlankValue(a) && isBlankValue(b);
  return a === b;
}

/** What the autosaver needs from the editor that owns the boxes. */
export interface LetterDetailsAutosaverHost {
  save(
    data: Record<string, unknown>,
    confirmSignedFileRemoval: boolean,
  ): Observable<ClaimLetterLetterDetailsSaveResult>;
  control(key: string): AbstractControl | null;
  /** The value as sent: blank as null, dates as UTC ISO strings. */
  serialize(key: string): unknown;
  canSave(): boolean;
  /** A box holds a value that was not saved because it breaks a rule (or the server refused it). */
  hasUnsavedValue(): boolean;
  onSaved(result: ClaimLetterLetterDetailsSaveResult): void;
  /** Marks the boxes the server refused. */
  onRejected(errors: ClaimLetterApiErrorMap): void;
  /** Someone else changed the details (or the signed letter): reload them. */
  onConflict(message: string | undefined): void;
  /** A box's state changed outside a form event (touched, server error). */
  changed(): void;
  destroyRef: DestroyRef;
}

/**
 * The letter editor's autosave: only a valid, changed value is sent; one request at a time, later
 * changes batched into the next; Download and Close wait on `whenIdle()`.
 */
export class LetterDetailsAutosaver {
  readonly status = signal<ClaimLetterSaveStatus>('idle');
  readonly saveError = signal<string | null>(null);

  private saved: Record<string, unknown> = {};
  private readonly pending = new Set<string>();
  private inFlight: Record<string, unknown> | null = null;
  private confirmRemoval = false;
  private savedAnything = false;
  private idleWaiters: (() => void)[] = [];

  constructor(private readonly host: LetterDetailsAutosaverHost) {}

  /** At least one save went through (the detail page then refreshes). */
  get savedAny(): boolean {
    return this.savedAnything;
  }

  get hasPending(): boolean {
    return this.pending.size > 0;
  }

  /** New details loaded: start over from what the server holds. */
  reset(saved: Record<string, unknown>): void {
    this.saved = { ...saved };
    this.confirmRemoval = false;
    this.pending.clear();
    this.status.set('idle');
  }

  /** The State confirmed that a changed save may remove the uploaded signed letter. */
  allowSignedFileRemoval(): void {
    this.confirmRemoval = true;
  }

  /** Adds `key` to the next save when its value is valid and differs from what is saved (or being
   *  saved). Returns whether anything was queued. */
  queue(key: string): boolean {
    const control = this.host.control(key);
    if (!control || !this.host.canSave()) return false;
    control.markAsTouched();
    this.host.changed();
    if (hasBlockingError(control)) {
      this.pending.delete(key);
      if (!this.inFlight && this.status() !== 'failed') this.settle();
      return false;
    }
    const value = this.host.serialize(key);
    const baseline = this.inFlight && key in this.inFlight ? this.inFlight[key] : this.saved[key];
    if (sameValue(value, baseline)) {
      this.pending.delete(key);
      return false;
    }
    this.pending.add(key);
    return true;
  }

  /** Sends everything pending in one request, unless one is already in flight (it follows then). */
  flush(): void {
    if (this.inFlight) return;
    if (this.pending.size === 0) {
      this.settle();
      return;
    }
    const data: Record<string, unknown> = {};
    for (const key of this.pending) data[key] = this.host.serialize(key);
    this.pending.clear();
    this.inFlight = data;
    this.status.set('saving');
    this.saveError.set(null);
    this.host
      .save(data, this.confirmRemoval)
      .pipe(takeUntilDestroyed(this.host.destroyRef))
      .subscribe({
        next: (result) => this.onSaved(result),
        error: (err: unknown) => this.onSaveError(data, err),
      });
  }

  retry(): void {
    this.saveError.set(null);
    this.flush();
  }

  /** Resolves once nothing is in flight and nothing is pending (or the last save failed). */
  whenIdle(): Promise<void> {
    if (!this.inFlight && (this.pending.size === 0 || this.status() === 'failed')) return Promise.resolve();
    return new Promise((resolve) => this.idleWaiters.push(resolve));
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private onSaved(result: ClaimLetterLetterDetailsSaveResult): void {
    this.inFlight = null;
    this.savedAnything = true;
    this.saved = { ...result.values };
    this.host.onSaved(result);
    this.flush();
  }

  private onSaveError(data: Record<string, unknown>, err: unknown): void {
    this.inFlight = null;
    const api = readApiError(err);
    if (
      api.code === CLAIM_LETTER_ERROR_CODE.LETTER_DETAILS_CHANGED ||
      api.code === CLAIM_LETTER_ERROR_CODE.SIGNED_FILE_REMOVAL_NOT_CONFIRMED
    ) {
      this.releaseWaiters();
      this.host.onConflict(api.message);
      return;
    }

    const errors = api.errors;
    const sent = Object.keys(data);
    // Nothing was written. Resend only when the server refused some of what was sent; otherwise
    // the same request would fail the same way, so it waits for Retry.
    if (errors && sent.some((key) => errors[key])) {
      this.host.onRejected(errors);
      for (const key of sent) if (!errors[key]) this.pending.add(key);
      this.host.changed();
      this.flush();
      return;
    }

    if (errors) this.host.onRejected(errors);
    for (const key of sent) this.pending.add(key);
    this.saveError.set(api.message ?? 'Unable to save. Check your connection and click Retry.');
    this.status.set('failed');
    this.releaseWaiters();
  }

  /** Nothing in flight or pending: show the resting status and release Download / Close. */
  private settle(): void {
    this.status.set(this.host.hasUnsavedValue() ? 'invalid' : this.savedAnything ? 'saved' : 'idle');
    this.releaseWaiters();
  }

  private releaseWaiters(): void {
    const waiters = this.idleWaiters;
    this.idleWaiters = [];
    for (const resolve of waiters) resolve();
  }
}
