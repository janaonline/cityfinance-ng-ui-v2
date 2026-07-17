import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { FcUnspentUlbOptionsResult } from './fc-unspent-declaration.models';
import {
  buildUlbOptionsCacheKey,
  FcUnspentUlbOptionsCacheService,
  MAX_ULB_OPTIONS_CACHE_ENTRIES,
} from './fc-unspent-ulb-options-cache.service';

function makeResult(total = 1): FcUnspentUlbOptionsResult {
  return {
    options: [{ ulbId: 'ulb-1', censusCode: '800123', sbCode: null, ulbName: 'Sample ULB', allocationAmount: 20 }],
    page: 1,
    limit: 20,
    total,
  };
}

describe('buildUlbOptionsCacheKey', () => {
  it('builds a stable key from every parameter that can affect the response', () => {
    const key = buildUlbOptionsCacheKey({ stateId: 's1', yearId: 'y1', search: 'nagar', page: 2, limit: 20 });
    expect(key).toBe('s1|y1|nagar|2|20');
  });

  it('produces different keys for different stateId/yearId/search/page/limit', () => {
    const base = { stateId: 's1', yearId: 'y1', search: 'nagar', page: 1, limit: 20 };
    const variants = [
      { ...base, stateId: 's2' },
      { ...base, yearId: 'y2' },
      { ...base, search: 'other' },
      { ...base, page: 2 },
      { ...base, limit: 50 },
    ];
    const baseKey = buildUlbOptionsCacheKey(base);
    for (const variant of variants) {
      expect(buildUlbOptionsCacheKey(variant)).not.toBe(baseKey);
    }
  });
});

describe('FcUnspentUlbOptionsCacheService', () => {
  let service: FcUnspentUlbOptionsCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [FcUnspentUlbOptionsCacheService] });
    service = TestBed.inject(FcUnspentUlbOptionsCacheService);
  });

  it('get() returns undefined for a key that was never set', () => {
    expect(service.get('missing')).toBeUndefined();
  });

  describe('getOrFetch', () => {
    it('calls fetch on a cache miss and caches only a successful result', () => {
      const result = makeResult();
      const fetch = jasmine.createSpy('fetch').and.returnValue(of(result));

      let emitted: FcUnspentUlbOptionsResult | undefined;
      service.getOrFetch('key-1', fetch).subscribe((r) => (emitted = r));

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(emitted).toEqual(result);
      expect(service.get('key-1')).toEqual(result);
    });

    it('serves a cache hit without calling fetch again', () => {
      const fetch = jasmine.createSpy('fetch').and.returnValue(of(makeResult()));
      service.getOrFetch('key-1', fetch).subscribe();

      const secondFetch = jasmine.createSpy('secondFetch').and.returnValue(of(makeResult(999)));
      let emitted: FcUnspentUlbOptionsResult | undefined;
      service.getOrFetch('key-1', secondFetch).subscribe((r) => (emitted = r));

      expect(secondFetch).not.toHaveBeenCalled();
      expect(emitted?.total).toBe(1); // the originally cached value, not the (never-called) second fetch's
    });

    it('never caches a failed response, and a subsequent call fetches again', () => {
      const failingFetch = jasmine.createSpy('failingFetch').and.returnValue(throwError(() => new Error('network')));
      service.getOrFetch('key-1', failingFetch).subscribe({ error: () => undefined });

      expect(service.get('key-1')).toBeUndefined();

      const retryFetch = jasmine.createSpy('retryFetch').and.returnValue(of(makeResult()));
      service.getOrFetch('key-1', retryFetch).subscribe();

      expect(retryFetch).toHaveBeenCalledTimes(1);
    });

    it('deduplicates identical simultaneous requests into a single fetch call', () => {
      const subject = new Subject<FcUnspentUlbOptionsResult>();
      const fetch = jasmine.createSpy('fetch').and.returnValue(subject);

      let firstEmitted: FcUnspentUlbOptionsResult | undefined;
      let secondEmitted: FcUnspentUlbOptionsResult | undefined;
      service.getOrFetch('key-1', fetch).subscribe((r) => (firstEmitted = r));
      service.getOrFetch('key-1', fetch).subscribe((r) => (secondEmitted = r));

      expect(fetch).toHaveBeenCalledTimes(1);

      const result = makeResult();
      subject.next(result);
      subject.complete();

      expect(firstEmitted).toEqual(result);
      expect(secondEmitted).toEqual(result);
    });

    it('allows a fresh fetch for the same key once the in-flight request has failed', () => {
      const subject = new Subject<FcUnspentUlbOptionsResult>();
      const firstFetch = jasmine.createSpy('firstFetch').and.returnValue(subject);
      service.getOrFetch('key-1', firstFetch).subscribe({ error: () => undefined });
      service.getOrFetch('key-1', firstFetch).subscribe({ error: () => undefined });

      subject.error(new Error('network'));
      expect(firstFetch).toHaveBeenCalledTimes(1);

      const retryFetch = jasmine.createSpy('retryFetch').and.returnValue(of(makeResult()));
      service.getOrFetch('key-1', retryFetch).subscribe();
      expect(retryFetch).toHaveBeenCalledTimes(1);
    });

    it('treats different keys as fully independent requests', () => {
      const fetchA = jasmine.createSpy('fetchA').and.returnValue(of(makeResult(1)));
      const fetchB = jasmine.createSpy('fetchB').and.returnValue(of(makeResult(2)));

      service.getOrFetch('key-a', fetchA).subscribe();
      service.getOrFetch('key-b', fetchB).subscribe();

      expect(fetchA).toHaveBeenCalledTimes(1);
      expect(fetchB).toHaveBeenCalledTimes(1);
      expect(service.get('key-a')?.total).toBe(1);
      expect(service.get('key-b')?.total).toBe(2);
    });
  });

  describe('eviction', () => {
    it('bounds the cache to MAX_ULB_OPTIONS_CACHE_ENTRIES, evicting the oldest entry first', () => {
      for (let i = 0; i < MAX_ULB_OPTIONS_CACHE_ENTRIES + 5; i++) {
        service.getOrFetch(`key-${i}`, () => of(makeResult(i))).subscribe();
      }

      expect(service.get('key-0')).toBeUndefined();
      expect(service.get('key-4')).toBeUndefined();
      expect(service.get(`key-${MAX_ULB_OPTIONS_CACHE_ENTRIES + 4}`)).toBeDefined();

      // Count survivors without letting get()'s own recency-refresh change what we're counting.
      let survivors = 0;
      for (let i = 0; i < MAX_ULB_OPTIONS_CACHE_ENTRIES + 5; i++) {
        if (service.get(`key-${i}`)) survivors++;
      }
      expect(survivors).toBe(MAX_ULB_OPTIONS_CACHE_ENTRIES);
    });

    it('accessing an entry refreshes its recency so it survives a subsequent eviction pass', () => {
      for (let i = 0; i < MAX_ULB_OPTIONS_CACHE_ENTRIES; i++) {
        service.getOrFetch(`key-${i}`, () => of(makeResult(i))).subscribe();
      }
      // Touch the oldest entry so it's no longer the least-recently-used one.
      expect(service.get('key-0')).toBeDefined();

      service.getOrFetch('key-overflow', () => of(makeResult(999))).subscribe();

      expect(service.get('key-0')).toBeDefined();
      expect(service.get('key-1')).toBeUndefined();
    });
  });

  describe('data safety', () => {
    it('freezes the cached options array so later mutation attempts throw rather than silently corrupt the cache', () => {
      service.getOrFetch('key-1', () => of(makeResult())).subscribe();
      const cached = service.get('key-1');

      expect(() => (cached as { options: unknown[] }).options.push({})).toThrowError();
    });

    it('does not let selection-state style mutation of a returned result affect what is cached', () => {
      const original = makeResult();
      service.getOrFetch('key-1', () => of(original)).subscribe();

      const cached = service.get('key-1');
      expect(cached?.options).not.toBe(original.options);
    });
  });

  describe('clear / ngOnDestroy', () => {
    it('clear() removes every cached entry and in-flight request', () => {
      service.getOrFetch('key-1', () => of(makeResult())).subscribe();
      expect(service.get('key-1')).toBeDefined();

      service.clear();

      expect(service.get('key-1')).toBeUndefined();
    });

    it('a cleared in-flight request is fetched fresh again', () => {
      const subject = new Subject<FcUnspentUlbOptionsResult>();
      const fetch = jasmine.createSpy('fetch').and.returnValue(subject);
      service.getOrFetch('key-1', fetch).subscribe();

      service.clear();

      const retryFetch = jasmine.createSpy('retryFetch').and.returnValue(of(makeResult()));
      service.getOrFetch('key-1', retryFetch).subscribe();
      expect(retryFetch).toHaveBeenCalledTimes(1);
    });

    it('ngOnDestroy clears the cache (simulating component-scoped provider teardown)', () => {
      service.getOrFetch('key-1', () => of(makeResult())).subscribe();
      expect(service.get('key-1')).toBeDefined();

      service.ngOnDestroy();

      expect(service.get('key-1')).toBeUndefined();
    });
  });
});
