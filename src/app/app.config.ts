import { ApplicationConfig, importProvidersFrom, inject, provideAppInitializer } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
// import { CustomHttpInterceptor } from './core/security/custom-http.interceptor';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
// import { GlobalErrorHandler } from './core/services/global-error-handler.service';
import { AuthGuard } from './core/security/auth-guard.service';
import { AuthService } from './core/services/auth.service';
import { VersionCheckService } from './core/services/version-check.service';
// import { APP_BASE_HREF } from '@angular/common';
import { provideClientHydration } from '@angular/platform-browser';
import { customHttpInterceptor } from './core/security/custom-http.interceptor';
import { otpAuthInterceptor } from './core/auth/auth.interceptor';
import { firstValueFrom } from 'rxjs';

export const appConfig: ApplicationConfig = {
  providers: [
    // {provide:APP_BASE_HREF, useValue: '/xvi-fc/'},
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    importProvidersFrom(MatSnackBarModule),
    // importProvidersFrom(HttpClientModule),
    // CustomHttpInterceptor,
    provideHttpClient(
      // customHttpInterceptor runs first (attaches legacy id_token, handles 401 refresh).
      // otpAuthInterceptor is a fallback that attaches cf_access_token when the
      // Authorization header hasn't been set yet (e.g. fresh OTP session with no legacy token).
      withInterceptors([customHttpInterceptor, otpAuthInterceptor])
    ),
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: CustomHttpInterceptor,
    //   multi: true,
    // },
    // { provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy },
    // { provide: ErrorHandler, useClass: GlobalErrorHandler},
    AuthService,
    AuthGuard,
    VersionCheckService,
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      return firstValueFrom(authService.restoreSession());
    }),
  ],
};
