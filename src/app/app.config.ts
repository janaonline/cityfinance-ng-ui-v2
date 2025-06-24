import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
// import { CustomHttpInterceptor } from './core/security/custom-http.interceptor';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
// import { GlobalErrorHandler } from './core/services/global-error-handler.service';
import { AuthGuard } from './core/security/auth-guard.service';
import { AuthService } from './core/services/auth.service';
import { VersionCheckService } from './core/services/version-check.service';
// import { APP_BASE_HREF } from '@angular/common';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { customHttpInterceptor } from './core/security/custom-http.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // {provide:APP_BASE_HREF, useValue: '/xvi-fc/'},
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    // importProvidersFrom(HttpClientModule),
    // CustomHttpInterceptor,
    provideHttpClient(
      withInterceptors([customHttpInterceptor])
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
    VersionCheckService, provideClientHydration(withEventReplay()),
  ],
};
