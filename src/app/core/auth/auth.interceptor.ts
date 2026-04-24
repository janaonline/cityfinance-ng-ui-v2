import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { OtpAuthService } from './auth.service';

const OTP_AUTH_SKIP_PATHS = ['auth/sendOtp', 'auth/verifyOtp'];

const API_BASES = () =>
  [environment.api.url, environment.api.url2, environment.api.url3].filter(Boolean);

export const otpAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(OtpAuthService);
  const token = authService.getToken();

  if (!token) return next(req);

  const isOtpEndpoint = OTP_AUTH_SKIP_PATHS.some((path) => req.url.includes(path));
  if (isOtpEndpoint) return next(req);

  const isApiRequest = API_BASES().some((base) => req.url.startsWith(base));
  if (!isApiRequest) return next(req);

  // Existing interceptor (customHttpInterceptor) already sets Authorization
  // when the legacy token is present.  Skip if already set to avoid a
  // redundant overwrite; fall through to attach our token as a fallback.
  if (req.headers.has('Authorization')) return next(req);

  return next(
    req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    }),
  );
};
