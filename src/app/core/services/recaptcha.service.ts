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
  private scriptLoaded = false;
  private scriptEl: HTMLScriptElement | null = null;

  loadScript(): void {
    if (!this.enabled || this.scriptLoaded || !this.siteKey) return;
    console.log('Loading reCAPTCHA script...');
    this.scriptEl = document.createElement('script');
    this.scriptEl.src = `https://www.google.com/recaptcha/api.js?render=${this.siteKey}`;
    this.scriptEl.async = true;
    document.head.appendChild(this.scriptEl);
    this.scriptLoaded = true;
  }

  /**
   * Forces a brand-new Google reCAPTCHA client on the next execute() call, instead of reusing
   * whatever internal state the widget was left in. There's no official "reset" in the v3 API
   * (that's a v2/checkbox concept) — the closest equivalent is discarding the loaded script and
   * client object entirely and re-injecting a fresh script tag. Call this after a login attempt
   * fails (wrong credentials or a reCAPTCHA failure), so the next attempt starts clean rather
   * than asking the same possibly-stuck client for another token.
   */
  reset(): void {
    if (!this.enabled) return;
    this.scriptEl?.remove();
    this.scriptEl = null;
    this.scriptLoaded = false;
    delete (window as unknown as { grecaptcha?: unknown }).grecaptcha;
    this.loadScript();
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
      new Promise<string>((resolve, reject) => {
        grecaptcha.ready(() => {
          console.log('1. Executing reCAPTCHA...');
          grecaptcha.execute(this.siteKey, { action }).then((token) => {
            // grecaptcha.execute() occasionally resolves with a null/empty token (a known
            // client-side quirk, not tied to any prior call) instead of rejecting — treating that
            // as success would ship a blank recaptchaToken straight to the backend. Reject instead
            // so the caller's retry (see LoginService.signInWithPassword) can ask again.
            if (token) resolve(token);
            else reject(new Error('reCAPTCHA verification failed. Please try again.'));
          }, reject);
        });
      }),
    );
  }
}
