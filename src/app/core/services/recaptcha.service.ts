import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { environment } from '../../../environments/environment';

declare const grecaptcha: {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
};

@Injectable({ providedIn: 'root' })
export class RecaptchaService {
  private readonly siteKey = environment.recaptchaSiteKey;
  private readonly enabled = environment.captchaEnabled;
  private scriptLoaded = false;

  loadScript(): void {
    if (!this.enabled || this.scriptLoaded || !this.siteKey) return;
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${this.siteKey}`;
    script.async = true;
    document.head.appendChild(script);
    this.scriptLoaded = true;
  }

  execute(action: string): Observable<string> {
    if (!this.enabled || !this.siteKey) return from(Promise.resolve(''));
    return from(
      new Promise<string>((resolve, reject) => {
        grecaptcha.ready(() => {
          grecaptcha.execute(this.siteKey, { action }).then(resolve, reject);
        });
      }),
    );
  }
}
