import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { environment } from '../../../environments/environment';

declare const grecaptcha: {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
};

const BADGE_VISIBLE_CLASS = 'recaptcha-badge-visible';

@Injectable({ providedIn: 'root' })
export class RecaptchaService {
  private readonly siteKey = environment.recaptchaSiteKey;
  private readonly enabled = environment.captchaEnabled;
  private loadPromise: Promise<void> | null = null;

  loadScript(): void {
    if (!this.enabled || !this.siteKey) return;
    this.ensureLoaded().catch(() => undefined);
  }

  /**
   * Forces a brand-new Google reCAPTCHA client on the next execute() call, instead of reusing
   * whatever internal state the widget was left in. There's no official "reset" in the v3 API
   * (that's a v2/checkbox concept) — the closest equivalent is tearing down everything Google
   * injected and re-injecting a fresh script tag. Call this on entering the login page and after
   * a login attempt fails, so the next attempt starts clean rather than asking the same
   * possibly-stuck client (e.g. one left over from before a logout) for another token.
   */
  reset(): void {
    if (!this.enabled) return;
    this.teardown();
    this.loadScript();
  }

  /**
   * Removes every trace of the Google client: our api.js tag, the release script it pulls in,
   * the badge/iframe, and the `grecaptcha` / `___grecaptcha_cfg` globals. Deleting only
   * `grecaptcha` is not enough — a re-injected api.js sees the stale `___grecaptcha_cfg` and
   * re-attaches to the dead client, which then resolves execute() with a blank token.
   */
  teardown(): void {
    document
      .querySelectorAll('script[src*="google.com/recaptcha/"], script[src*="gstatic.com/recaptcha/"]')
      .forEach((el) => el.remove());
    document.querySelectorAll('.grecaptcha-badge').forEach((badge) => {
      const wrapper = badge.parentElement;
      (wrapper && wrapper !== document.body ? wrapper : badge).remove();
    });
    const win = window as unknown as { grecaptcha?: unknown; ___grecaptcha_cfg?: unknown };
    delete win.grecaptcha;
    delete win.___grecaptcha_cfg;
    this.loadPromise = null;
  }

  /** Resolves once `grecaptcha` is available, injecting api.js if it isn't loaded yet. */
  private ensureLoaded(): Promise<void> {
    if ((window as unknown as { grecaptcha?: unknown }).grecaptcha) return Promise.resolve();
    this.loadPromise ??= new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${this.siteKey}`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        this.teardown();
        reject(new Error('reCAPTCHA failed to load. Please try again.'));
      };
      document.head.appendChild(script);
    });
    return this.loadPromise;
  }

  /** Shows the floating reCAPTCHA badge. Call only while on the login page. */
  showBadge(): void {
    if (!this.enabled) return;
    document.body.classList.add(BADGE_VISIBLE_CLASS);
  }

  /** Hides the floating reCAPTCHA badge on all other pages. */
  hideBadge(): void {
    document.body.classList.remove(BADGE_VISIBLE_CLASS);
  }

  execute(action: string): Observable<string> {
    if (!this.enabled || !this.siteKey) return from(Promise.resolve(''));
    return from(
      // Wait for the script first — right after reset() the global is gone until the fresh
      // api.js finishes loading, and touching `grecaptcha` before then throws.
      this.ensureLoaded().then(
        () =>
          new Promise<string>((resolve, reject) => {
            grecaptcha.ready(() => {
              grecaptcha.execute(this.siteKey, { action }).then((token) => {
                // grecaptcha.execute() occasionally resolves with a null/empty token (a known
                // client-side quirk, not tied to any prior call) instead of rejecting — treating
                // that as success would ship a blank recaptchaToken straight to the backend.
                // Reject instead so the caller's retry (see LoginService.signInWithPassword) can
                // ask again.
                if (token) resolve(token);
                else reject(new Error('reCAPTCHA verification failed. Please try again.'));
              }, reject);
            });
          }),
      ),
    );
  }
}
