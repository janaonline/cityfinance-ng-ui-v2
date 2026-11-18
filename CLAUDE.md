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
npm run lint:fix     # ESLint with auto-fix
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
├── admin/          # Admin-only routes
│   ├── ocr/        # OCR validation pipeline UI (job submission, results, comparison table)
│   ├── xvi-fc-review/  # 16th FC review & approval workflow
│   ├── afs-dashboard/  # AFS financial statement dashboards
│   └── events/     # Events dashboard
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
- **XVI FC** (`features/xvi-fc-module/`) — 16th Finance Commission data entry split into mohua/state/ulb/pmu/doe/admin/adc sub-modules (role-gated via `canMatch` in `xvi-fc-module.routes.ts`) — `pmu-module/` is the MOHUA_PMU reviewer role's placeholder Overview + People and Roles + worklist + form/row review detail pages, sitting between state submission and MoHUA's own review; `doe-module/` is the XVIFC_DOE role's view-only copy of the MoHUA dashboard (it reuses `MOHUA_DASHBOARD_ROUTES` from `mohua-module.routes.ts` — overview, state view, ULB view, read-only form screens — plus its own People and Roles page, and registers none of MoHUA's review/claims routes; the API's `DoeReadOnlyGuard` enforces the same rule). `adc-module/` is the ADC (Autonomous District Council, Assam) user — a `STATE`-role user whose stored `userData` has an `adc`: `isAdcRole` matches it before `isStateRole` (which now requires no `adc`), route data `role: 'STATE_ADC'` (a menu role the sidebar API is called with), and `ADC_ROUTES` expose only an ADC Overview (per-form status counts built from the existing `state/ulb-submissions` list endpoints), ULB Forms Review (reuses the State `ulb-submissions` + review components), ULB list / Register ULB (reuse the State `ulb-list`), its own team page (`ADC_ROLES_CONFIG`), Support and FAQ — every other path redirects to the overview; the API's `AdcAccessGuard` enforces the same rule, and the UI never infers per-ULB rights itself (list rows carry `canReview` / `adcName`, and a State user sees ADC-owned ULBs read-only). The Portal Admin owns ADCs: `admin-module/adc/` (route `adc`, sidebar row "ADC" after ULB Registration) lists them (server-paginated `GET master/adc/manage`, at most 20 per page via `shared/adc/adc-paging.constants.ts`; search ADC or Admin name/email, Admin-status filter, server sort, all kept in the URL) with a View link and one shared `adc-actions-menu/` (Rename, Set/Change Admin - a server-side member search - and Delete, shown greyed with its reason when blocked). Add ADC creates an ADC together with its ADC Admin. `adc/:id` (`adc-detail/`, `menuGroup: 'adc'`) is a read-only header plus lazy Members and ULBs tabs (`?tab=`), each a server-paged, filtered, sorted table built on `adc-detail/adc-paged-table.ts`; all calls go through `shared/adc/adc.service.ts`; the ADC Admin manages only Reviewers/Viewers. The State admin does not manage ADC teams (the Portal Admin and the ADC Admin do); the old State `adc-teams` route only redirects to People and Roles. Admin also gets an "Assign ADC" action on the ULB list (`GET master/adc` picker). MoHUA, PMU, DoE and ADC People and Roles pages are all `shared/roles-teams-overview/` driven by a `RolesTeamsConfig` in route data. Their profile verification takes the no-entity "mohua" flow. Sidebar rows for PMU/DoE are database rows seeded by the API's `seed:xvifc-pmu-doe-menu` script — plus `shared/` (dynamic form pieces, profile verification, years selection, and the role-neutral `status-history/` click-the-status-pill timeline dialog reused by any reviewer worklist via `ReviewWorklistColumn.historyLoader`, and the read-only `status-summary-cards/` overview cards fed by a worklist endpoint's `data.summary`) and `styles/` (theme/layout partials) used across all of them.
- **XVI FC Form** (`features/xvi-fc-form/`) — Form submission for 16th FC; protected by `authGuard`.
- **AFS Dashboard** (`pages/`) — Financial statement dashboards (current and legacy versions).
- **OCR** (`admin/ocr/`) — Two-step Gemini OCR validation pipeline. Jobs are submitted via `ocr-validation/`, polled for status, and results shown with extraction metadata and financial validation checks. Key models live in `ocr-validation/ocr-validation-models.ts` (`OcrValidationExtraction`, `OcrValidationBasicCheck`, `OcrValidationResult`). The comparison table (`ocr-comparison-table/`) is a legacy view using a different response schema (`upload-file-ocr/ocr-response.ts`) — do not mix the two.

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
