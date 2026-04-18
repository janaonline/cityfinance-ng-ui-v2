import {
    DestroyRef,
    Directive,
    ElementRef,
    SecurityContext,
    computed,
    effect,
    inject,
    input,
    signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { S3Service } from '../services/s3.service';

function trimNullableString(value: string | null | undefined): string {
    return value?.trim() ?? '';
}

@Directive({
    selector: 'a[appSignedUrl]',
    standalone: true,
    host: {
        '(click)': 'onClick($event)',
        '[attr.href]': 'href() || null',
        '[attr.rel]': 'rel()',
        '[attr.aria-busy]': 'ariaBusy()',
    },
})
export class SignedUrlDirective {
    readonly appSignedUrl = input('', { transform: trimNullableString });

    private readonly elementRef = inject(ElementRef<HTMLAnchorElement>);
    private readonly sanitizer = inject(DomSanitizer);
    private readonly s3Service = inject(S3Service);
    private readonly destroyRef = inject(DestroyRef);

    private readonly loadingState = signal(false);
    private readonly resolvedHrefState = signal('');

    readonly href = computed(() => {
        const resolvedHref = this.resolvedHrefState();
        if (resolvedHref) {
            return resolvedHref;
        }

        const raw = this.appSignedUrl();
        return this.isAbsoluteHttpsUrl(raw) ? this.toSafeHttpsUrl(raw) : '';
    });

    readonly rel = computed(() =>
        this.elementRef.nativeElement.getAttribute('target') === '_blank'
            ? 'noopener noreferrer'
            : null
    );

    readonly ariaBusy = computed(() => (this.loadingState() ? 'true' : null));

    private readonly resetOnInputChange = effect(() => {
        this.appSignedUrl();
        this.loadingState.set(false);
        this.resolvedHrefState.set('');
    });

    onClick(event: MouseEvent): void {
        const raw = this.appSignedUrl();

        if (!raw) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        if (this.href()) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        if (this.loadingState()) {
            return;
        }

        const target = this.elementRef.nativeElement.getAttribute('target') || '_self';

        let popup: Window | null = null;
        if (target === '_blank') {
            popup = window.open('about:blank', '_blank');
            if (!popup) {
                return;
            }
        }

        this.loadingState.set(true);

        this.s3Service
            .getSignedUrl(raw)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (signedUrl: string) => {
                    this.loadingState.set(false);

                    const safeUrl = this.toSafeHttpsUrl(signedUrl);
                    if (!safeUrl) {
                        popup?.close();
                        return;
                    }

                    this.resolvedHrefState.set(safeUrl);

                    if (popup) {
                        popup.location.href = safeUrl;
                    } else {
                        window.location.href = safeUrl;
                    }
                },
                error: () => {
                    this.loadingState.set(false);
                    popup?.close();
                },
            });
    }

    private isAbsoluteHttpsUrl(value: string): boolean {
        if (!value) {
            return false;
        }

        try {
            const url = new URL(value);
            return url.protocol === 'https:';
        } catch {
            return false;
        }
    }

    private toSafeHttpsUrl(value: string): string {
        const sanitized = this.sanitizer.sanitize(
            SecurityContext.URL,
            trimNullableString(value)
        );

        if (!sanitized) {
            return '';
        }

        try {
            const parsed = new URL(sanitized);
            return parsed.protocol === 'https:' ? parsed.toString() : '';
        } catch {
            return '';
        }
    }
}