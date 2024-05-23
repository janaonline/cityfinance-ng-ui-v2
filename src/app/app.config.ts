import { ApplicationConfig, ErrorHandler, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { CustomHttpInterceptor } from './core/security/custom-http.interceptor';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { GlobalErrorHandler } from './core/services/global-error-handler.service';
import { AuthService } from './core/services/auth.service';
import { AuthGuard } from './core/security/auth-guard.service';
import { VersionCheckService } from './core/services/version-check.service';
import { APP_BASE_HREF } from '@angular/common';

export const appConfig: ApplicationConfig = {
  providers: [
    // {provide:APP_BASE_HREF, useValue: '/xvi-fc/'},
    provideRouter(routes), provideAnimationsAsync(),
    importProvidersFrom(HttpClientModule),

    // CustomHttpInterceptor,

    {
      provide: HTTP_INTERCEPTORS,
      useClass: CustomHttpInterceptor,
      multi: true,
    },
    // { provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy },
    // { provide: ErrorHandler, useClass: GlobalErrorHandler},
    AuthService,
    AuthGuard,
    VersionCheckService,
  ]
};
