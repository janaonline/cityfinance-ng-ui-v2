import { Injectable, OnDestroy } from '@angular/core';
import { Observable, finalize, of, shareReplay, tap } from 'rxjs';
import { FcUnspentUlbOption, FcUnspentUlbOptionsResult } from './fc-unspent-declaration.models';

/** Bounds cache growth during a long editing session — oldest entry is evicted first (simple LRU
 *  via re-insertion-on-access into an insertion-ordered `Map`). */
export const MAX_ULB_OPTIONS_CACHE_ENTRIES = 50;

export interface UlbOptionsCacheKeyParams {
  stateId: string;
  yearId: string;
  /** Already trimmed/lowercased by the caller — see `fc-unspent-ulb-options-cache.service.spec.ts`. */
  search: string;
  page: number;
  limit: number;
}

/** Stable cache key from every request parameter that can affect the API response. */
export function buildUlbOptionsCacheKey(params: UlbOptionsCacheKeyParams): string {
  return [params.stateId, params.yearId, params.search, params.page, params.limit].join('|');
}

/**
 * In-memory, feature-scoped cache for `FcUnspentDeclarationService.getUlbOptions` query results.
 *
 * Intentionally provided as a component-level provider on `FcUnspentDeclarationComponent` (see that
 * component's `providers` array) rather than `providedIn: 'root'`, so a new instance is created per
 * page visit and is destroyed — via `ngOnDestroy` below — along with the page, never persisting
 * across navigations or leaking into an unrelated FC Unspent session. `UlbPickerDialogComponent` is
 * opened with that same injector passed through `MatDialogConfig.injector` (see
 * `UnspentUlbTableComponent.openPicker`), so every dialog opened from one page session shares this
 * one cache instance even though the dialog itself is destroyed and recreated on every close/reopen.
 *
 * Never caches the complete ULB list — only the specific paginated/searched query results a user has
 * actually requested, bounded by `MAX_ULB_OPTIONS_CACHE_ENTRIES`.
 */
@Injectable()
export class FcUnspentUlbOptionsCacheService implements OnDestroy {
  private readonly entries = new Map<string, FcUnspentUlbOptionsResult>();
  private readonly inFlight = new Map<string, Observable<FcUnspentUlbOptionsResult>>();

  /** Returns a cached result for `key`, refreshing its recency, or `undefined` on a cache miss. */
  get(key: string): FcUnspentUlbOptionsResult | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;

    this.entries.delete(key);
    this.entries.set(key, entry);
    return entry;
  }

  /**
   * Returns the cached result for `key` if present; otherwise de-duplicates against any identical
   * in-flight request, otherwise calls `fetch()`, caching only a successful response and never a
   * failed one. Never mutates the objects `fetch()` resolves with — the array is shallow-frozen
   * before being stored so later dialog-local selection state can never write back into it.
   */
  getOrFetch(key: string, fetch: () => Observable<FcUnspentUlbOptionsResult>): Observable<FcUnspentUlbOptionsResult> {
    const cached = this.get(key);
    if (cached) return of(cached);

    const pending = this.inFlight.get(key);
    if (pending) return pending;

    const request$ = fetch().pipe(
      tap((result) => this.set(key, result)),
      finalize(() => this.inFlight.delete(key)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.inFlight.set(key, request$);
    return request$;
  }

  private set(key: string, result: FcUnspentUlbOptionsResult): void {
    const safeCopy: FcUnspentUlbOptionsResult = {
      ...result,
      options: Object.freeze([...result.options]) as FcUnspentUlbOption[],
    };

    this.entries.delete(key);
    this.entries.set(key, safeCopy);

    while (this.entries.size > MAX_ULB_OPTIONS_CACHE_ENTRIES) {
      const oldestKey = this.entries.keys().next().value;
      if (oldestKey === undefined) break;
      this.entries.delete(oldestKey);
    }
  }

  /** Discards every cached result and in-flight request — called on state/year reload and on destroy. */
  clear(): void {
    this.entries.clear();
    this.inFlight.clear();
  }

  ngOnDestroy(): void {
    this.clear();
  }
}
