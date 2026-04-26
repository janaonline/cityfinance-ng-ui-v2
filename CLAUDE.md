# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run local        # Dev server on localhost:4300 with local config
npm run staging      # Dev server with staging config
npm run dev          # Dev server on port 4300 with development config

# Build
npm run build        # Production build (base href: /fc/)
npm run watch        # Build in watch mode

# Testing
npm run test         # Unit tests via Karma + Jasmine (watch mode)

# Code quality
npm run lint         # ESLint (TS + HTML)
npm run format       # Prettier (TS + HTML)

# Bundle analysis
npm run analyze      # Webpack bundle analyzer (builds first)
npm run sm           # source-map-explorer
```

To run a single test file, use the `--include` flag:
```bash
npx ng test --include='src/app/path/to/file.spec.ts'
```

## Architecture

**Angular 20** standalone-component app. No NgRx or other state management library — state is managed via RxJS `BehaviorSubject`s in services.

### Entry Points

- [src/main.ts](src/main.ts) — bootstraps the app
- [src/app/app.config.ts](src/app/app.config.ts) — provider registration (HTTP, router, JWT, interceptors)
- [src/app/app.routes.ts](src/app/app.routes.ts) — top-level routing with lazy-loaded features

### Module Layout

```
src/app/
├── core/           # Singleton services, guards, interceptors, pipes, validators, models
├── shared/         # Reusable UI components (header, footer, map, dialogs, dynamic-form)
├── features/       # Lazy-loaded feature areas (cfr, xvi-fc-module, xvi-fc-form, auth)
├── auth/           # Login, signup, forgot-password, OTP page components
├── admin/          # Admin-only routes (xvi-fc-review)
├── pages/          # Top-level page components
├── material.module.ts  # Centralised Angular Material re-exports
└── app.component.ts
```

### Authentication

Two parallel auth flows coexist:

1. **Session/JWT flow** — `AuthService` (`core/security/`) manages login, token storage, silent refresh, and session restoration. The `customHttpInterceptor` injects `x-access-token`/`Bearer` headers and handles 401 refresh-and-retry.
2. **OTP flow** — `OtpAuthService` (`core/auth/`) manages OTP token separately. `otpAuthInterceptor` is a fallback for OTP-secured endpoints.

Route protection uses the functional `authGuard` (`core/guards/`). A `MaintenanceGuard` redirects to the maintenance page when the site is in maintenance mode.

### Environment Config

All environments (`src/environments/`) derive `baseUrl` from `window.location.origin` at runtime. API base paths (`/api/v1/`, `/api/v2/`, `/api/v3/`) are appended dynamically, so no proxy config is needed. The `local` configuration overrides environment variables for `localhost:4300`.

### Key Feature Areas

- **CFR** (`features/cfr/`) — City Finance Ranking: state/ULB rankings, Leaflet India map, PDF export.
- **XVI FC** (`features/xvi-fc-module/`) — 16th Finance Commission data entry split into mohua/state/ulb sub-modules.
- **XVI FC Form** (`features/xvi-fc-form/`) — Form submission for 16th FC; protected by `authGuard`.
- **AFS Dashboard** (`pages/`) — Financial statement dashboards (current and legacy versions).

### Shared Infrastructure

- **Dynamic Form** (`shared/dynamic-form/`) — Schema-driven reactive form builder used across feature modules.
- **24 custom pipes** (`core/pipes/`) — INR formatting, rupee conversion, storage URL rewriting, population formatting, etc.
- **Custom validators** (`core/validators/`) — Date range, cross-field comparison, URL, and password validators.
- **Material module** (`app/material.module.ts`) — Import this module (not individual Material modules) in feature modules.

## Code Conventions

- **Selectors:** components use `app-` prefix (kebab-case); directives use `app` prefix (camelCase) — enforced by ESLint.
- **Prettier:** single quotes, semicolons, trailing commas everywhere, 100-char line width.
- **Strict TypeScript:** `strict: true` plus `noImplicitOverride`, `noImplicitReturns`, `noPropertyAccessFromIndexSignature`.
- CFR spec files (`src/app/features/cfr/**/*.spec.ts`) are excluded from the default Karma run.

## Key Dependencies

| Category | Library |
|---|---|
| UI | Angular Material 20, Bootstrap 5 |
| Maps | Leaflet 1.9 (CSS included via angular.json global styles) |
| Charts | Chart.js 4 + chartjs-plugin-datalabels |
| PDF/Excel export | jsPDF, pdfmake, pdf-lib, xlsx, jszip, file-saver |
| Auth | @auth0/angular-jwt (JWT decoding) |
| Alerts | sweetalert2 11 |
