import { environment } from '../../../environments/environment';
import { RecaptchaService } from './recaptcha.service';

describe('RecaptchaService', () => {
  let originalCaptchaEnabled: boolean;
  let originalSiteKey: string;
  let originalGrecaptcha: unknown;

  beforeEach(() => {
    originalCaptchaEnabled = environment.captchaEnabled;
    originalSiteKey = environment.recaptchaSiteKey;
    originalGrecaptcha = (window as unknown as { grecaptcha?: unknown }).grecaptcha;
  });

  afterEach(() => {
    (environment as { captchaEnabled: boolean }).captchaEnabled = originalCaptchaEnabled;
    (environment as { recaptchaSiteKey: string }).recaptchaSiteKey = originalSiteKey;
    (window as unknown as { grecaptcha?: unknown }).grecaptcha = originalGrecaptcha;
  });

  it('resolves immediately with an empty string when reCAPTCHA is disabled, never touching grecaptcha', (done) => {
    (environment as { captchaEnabled: boolean }).captchaEnabled = false;
    const grecaptchaSpy = { ready: jasmine.createSpy('ready'), execute: jasmine.createSpy('execute') };
    (window as unknown as { grecaptcha: unknown }).grecaptcha = grecaptchaSpy;
    const service = new RecaptchaService();

    service.execute('login').subscribe((token) => {
      expect(token).toBe('');
      expect(grecaptchaSpy.ready).not.toHaveBeenCalled();
      done();
    });
  });

  it('resolves with the real token when grecaptcha.execute succeeds', (done) => {
    (environment as { captchaEnabled: boolean }).captchaEnabled = true;
    (window as unknown as { grecaptcha: unknown }).grecaptcha = {
      ready: (cb: () => void) => cb(),
      execute: () => Promise.resolve('real-token'),
    };
    const service = new RecaptchaService();

    service.execute('login').subscribe((token) => {
      expect(token).toBe('real-token');
      done();
    });
  });

  it('errors instead of resolving when grecaptcha.execute comes back with a blank token — the known transient-null quirk', (done) => {
    (environment as { captchaEnabled: boolean }).captchaEnabled = true;
    (window as unknown as { grecaptcha: unknown }).grecaptcha = {
      ready: (cb: () => void) => cb(),
      execute: () => Promise.resolve(null),
    };
    const service = new RecaptchaService();

    service.execute('login').subscribe({
      next: () => fail('expected an error, not a resolved value'),
      error: (err: Error) => {
        expect(err.message).toBe('reCAPTCHA verification failed. Please try again.');
        done();
      },
    });
  });

  it('propagates a rejection from grecaptcha.execute itself (network error etc.) as an error', (done) => {
    (environment as { captchaEnabled: boolean }).captchaEnabled = true;
    (window as unknown as { grecaptcha: unknown }).grecaptcha = {
      ready: (cb: () => void) => cb(),
      execute: () => Promise.reject(new Error('network down')),
    };
    const service = new RecaptchaService();

    service.execute('login').subscribe({
      next: () => fail('expected an error, not a resolved value'),
      error: (err: Error) => {
        expect(err.message).toBe('network down');
        done();
      },
    });
  });

  it('teardown removes the Google globals, the badge and the injected scripts so a revisit starts clean', () => {
    const win = window as unknown as { grecaptcha?: unknown; ___grecaptcha_cfg?: unknown };
    win.grecaptcha = {};
    win.___grecaptcha_cfg = {};
    const wrapper = document.createElement('div');
    const badge = document.createElement('div');
    badge.className = 'grecaptcha-badge';
    wrapper.appendChild(badge);
    document.body.appendChild(wrapper);
    const script = document.createElement('script');
    script.setAttribute('src', 'https://www.gstatic.com/recaptcha/releases/x/recaptcha__en.js');
    document.head.appendChild(script);

    new RecaptchaService().teardown();

    expect(win.grecaptcha).toBeUndefined();
    expect(win.___grecaptcha_cfg).toBeUndefined();
    expect(document.body.contains(wrapper)).toBeFalse();
    expect(document.head.contains(script)).toBeFalse();
  });

  it('waits for a freshly injected script to load before calling grecaptcha after a reset', (done) => {
    (environment as { captchaEnabled: boolean }).captchaEnabled = true;
    (environment as { recaptchaSiteKey: string }).recaptchaSiteKey = 'site-key';
    let injected: HTMLScriptElement | undefined;
    const appendChild = document.head.appendChild.bind(document.head);
    spyOn(document.head, 'appendChild').and.callFake(<T extends Node>(node: T): T => {
      if (node instanceof HTMLScriptElement && node.src.includes('recaptcha/api.js')) {
        injected = node;
        return node;
      }
      return appendChild(node);
    });
    const service = new RecaptchaService();

    service.reset();
    service.execute('login').subscribe((token) => {
      expect(token).toBe('fresh-token');
      done();
    });

    expect(injected).toBeDefined();
    (window as unknown as { grecaptcha: unknown }).grecaptcha = {
      ready: (cb: () => void) => cb(),
      execute: () => Promise.resolve('fresh-token'),
    };
    injected!.onload!(new Event('load'));
  });
});
