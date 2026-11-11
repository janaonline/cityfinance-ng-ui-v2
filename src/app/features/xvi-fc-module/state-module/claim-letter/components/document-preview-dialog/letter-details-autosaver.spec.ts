import { DestroyRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ClaimLetterLetterDetailsSaveResult } from '../../claim-letter.models';
import { LetterDetailsAutosaver, LetterDetailsAutosaverHost } from './letter-details-autosaver';

const DESTROY_REF = { destroyed: false, onDestroy: () => () => undefined } as unknown as DestroyRef;

function saveResult(values: Record<string, unknown>): ClaimLetterLetterDetailsSaveResult {
  return {
    values,
    isComplete: false,
    missingFields: [],
    hasSignedFile: false,
    letterDetailsUpdatedAt: '2026-10-28T10:00:00.000Z',
    signedFileRemoved: false,
  } as ClaimLetterLetterDetailsSaveResult;
}

describe('LetterDetailsAutosaver', () => {
  let controls: Record<string, FormControl>;
  let requests: { data: Record<string, unknown>; reply: Subject<ClaimLetterLetterDetailsSaveResult> }[];
  let host: jasmine.SpyObj<Pick<LetterDetailsAutosaverHost, 'onSaved' | 'onRejected' | 'onConflict' | 'changed'>>;
  let autosaver: LetterDetailsAutosaver;

  beforeEach(() => {
    controls = {
      letterNo: new FormControl('UD/7'),
      departmentEmail: new FormControl('', Validators.email),
    };
    requests = [];
    host = jasmine.createSpyObj('host', ['onSaved', 'onRejected', 'onConflict', 'changed']);
    autosaver = new LetterDetailsAutosaver({
      save: (data) => {
        const reply = new Subject<ClaimLetterLetterDetailsSaveResult>();
        requests.push({ data, reply });
        return reply;
      },
      control: (key) => controls[key] ?? null,
      serialize: (key) => controls[key]?.value || null,
      canSave: () => true,
      hasUnsavedValue: () => Object.values(controls).some((c) => c.invalid),
      ...host,
      destroyRef: DESTROY_REF,
    });
    autosaver.reset({ letterNo: 'UD/1' });
  });

  function fail(index: number, error: unknown): void {
    requests[index].reply.error(error);
  }

  it('sends a valid changed value, and nothing when it matches what is saved', () => {
    expect(autosaver.queue('letterNo')).toBeTrue();
    autosaver.flush();
    expect(requests.map((r) => r.data)).toEqual([{ letterNo: 'UD/7' }]);

    requests[0].reply.next(saveResult({ letterNo: 'UD/7' }));
    expect(autosaver.queue('letterNo')).toBeFalse();
    expect(autosaver.status()).toBe('saved');
    expect(autosaver.savedAny).toBeTrue();
  });

  it('holds back an invalid value and shows it as not saved', () => {
    controls['departmentEmail'].setValue('not-an-email');

    expect(autosaver.queue('departmentEmail')).toBeFalse();
    expect(requests).toEqual([]);
    expect(autosaver.status()).toBe('invalid');
  });

  it('keeps one request in flight and batches later changes into the next', () => {
    autosaver.queue('letterNo');
    autosaver.flush();
    controls['departmentEmail'].setValue('a@b.in');
    autosaver.queue('departmentEmail');
    autosaver.flush();
    expect(requests.length).toBe(1);

    requests[0].reply.next(saveResult({ letterNo: 'UD/7' }));
    expect(requests.length).toBe(2);
    expect(requests[1].data).toEqual({ departmentEmail: 'a@b.in' });
  });

  it('marks refused boxes and resends only the values the server accepted', () => {
    controls['departmentEmail'].setValue('a@b.in');
    autosaver.queue('letterNo');
    autosaver.queue('departmentEmail');
    autosaver.flush();

    const errors = { departmentEmail: [{ message: 'Use an official address.' }] };
    fail(0, { error: { message: 'Validation failed.', errors } });

    expect(host.onRejected).toHaveBeenCalledWith(errors);
    expect(requests.length).toBe(2);
    expect(requests[1].data).toEqual({ letterNo: 'UD/7' });
  });

  it('never resends on its own when the error names none of the sent boxes', () => {
    autosaver.queue('letterNo');
    autosaver.flush();

    fail(0, { error: { message: 'Validation failed.', errors: { somethingElse: [{ message: 'Bad.' }] } } });

    expect(requests.length).toBe(1);
    expect(autosaver.status()).toBe('failed');
    expect(autosaver.saveError()).toBe('Validation failed.');
    expect(autosaver.hasPending).toBeTrue();

    autosaver.retry();
    expect(requests.length).toBe(2);
    expect(requests[1].data).toEqual({ letterNo: 'UD/7' });
  });

  it('waits for Retry after a failed save and releases Download / Close', async () => {
    autosaver.queue('letterNo');
    autosaver.flush();
    const idle = autosaver.whenIdle();

    fail(0, { status: 0 });

    await expectAsync(idle).toBeResolved();
    expect(autosaver.status()).toBe('failed');
    expect(autosaver.saveError()).toContain('Retry');
  });

  it('hands a conflict to the host to reload', () => {
    autosaver.queue('letterNo');
    autosaver.flush();

    fail(0, { error: { message: 'Someone else saved.', code: 'LETTER_DETAILS_CHANGED' } });

    expect(host.onConflict).toHaveBeenCalledWith('Someone else saved.');
    expect(requests.length).toBe(1);
  });
});
