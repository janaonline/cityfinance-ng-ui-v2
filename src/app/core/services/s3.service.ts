import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface SignedUrlApiResponse {
    success: boolean;
    message: string;
    data?: {
        signedUrl?: string;
    };
}

interface CacheEntry {
    expiresAt: number;
    value$: Observable<string>;
}

@Injectable({
    providedIn: 'root',
})
export class S3Service {
    private readonly http = inject(HttpClient);

    private readonly cacheTtlMs = 55 * 60 * 1000;
    private readonly signedUrlCache = signal(new Map<string, CacheEntry>());

    readonly cacheSize = computed(() => this.signedUrlCache().size);

    getSignedUrl(filePath: string): Observable<string> {
        const path = this.normalizePath(filePath);

        if (!path) {
            return of('');
        }

        if (this.isAbsoluteHttpsUrl(path)) {
            return of(path);
        }

        const now = Date.now();
        const cached = this.signedUrlCache().get(path);

        if (cached && cached.expiresAt > now) {
            return cached.value$;
        }

        const request$ = this.http
            .post<SignedUrlApiResponse>(`${environment.api.url}get-signed-url`, {
                fileUrl: path,
            })
            .pipe(
                map((res) => res?.data?.signedUrl?.trim() ?? ''),
                catchError(() => {
                    this.deleteCacheEntry(path);
                    return of('');
                }),
                shareReplay({ bufferSize: 1, refCount: false })
            );

        this.setCacheEntry(path, {
            expiresAt: now + this.cacheTtlMs,
            value$: request$,
        });

        return request$;
    }

    clearCache(): void {
        this.signedUrlCache.set(new Map());
    }

    clearExpiredCache(): void {
        const now = Date.now();
        const next = new Map(this.signedUrlCache());

        for (const [key, entry] of next.entries()) {
            if (entry.expiresAt <= now) {
                next.delete(key);
            }
        }

        this.signedUrlCache.set(next);
    }

    private setCacheEntry(path: string, entry: CacheEntry): void {
        const next = new Map(this.signedUrlCache());
        next.set(path, entry);
        this.signedUrlCache.set(next);
    }

    private deleteCacheEntry(path: string): void {
        const next = new Map(this.signedUrlCache());
        next.delete(path);
        this.signedUrlCache.set(next);
    }

    private normalizePath(value: string | null | undefined): string {
        return value?.trim() ?? '';
    }

    private isAbsoluteHttpsUrl(value: string): boolean {
        try {
            const url = new URL(value);
            return url.protocol === 'https:';
        } catch {
            return false;
        }
    }
}