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
});
