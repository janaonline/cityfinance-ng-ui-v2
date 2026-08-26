# CityfinanceNgUiV2

[![codecov](https://codecov.io/gh/janaonline/cityfinance-ng-ui-v2/graph/badge.svg?token=3UNOUB3NL3)](https://codecov.io/gh/janaonline/cityfinance-ng-ui-v2)

## Overview

CityFinance NG is a web platform used by municipal bodies, state governments, and the central Ministry of Housing & Urban Affairs (MoHUA) to manage and track urban finance and grant-related workflows in India. This README focuses on the platform's largest and most active area — the **XVI FC module**, which digitizes the entire 16th Finance Commission grant reporting and review process.

## Table of Contents

- [What is the 16th Finance Commission (XVI FC) Module?](#what-is-the-16th-finance-commission-xvi-fc-module)
- [Who Uses It — The Four Roles](#who-uses-it--the-four-roles)
- [Features at a Glance](#features-at-a-glance)
- [Also in This Repository](#also-in-this-repository)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [XVI FC Module — Architecture](#xvi-fc-module--architecture)
- [XVI FC Module — Feature Reference by Role](#xvi-fc-module--feature-reference-by-role)
- [Further Documentation](#further-documentation)
- [Known Issues](#known-issues)
- [Further Help](#further-help)

## What is the 16th Finance Commission (XVI FC) Module?

The 16th Finance Commission (XVI FC) determines how central government grants are distributed to urban local bodies (ULBs) — municipalities, municipal corporations, and town panchayats — across India, subject to each ULB and state meeting certain compliance and reporting conditions. Historically this reporting was a manual, paper- and email-heavy process spread across three separate stakeholder groups.

The XVI FC module replaces that process with a single web workflow: municipalities submit their financial disclosures and supporting documents, state governments review and aggregate submissions from every municipality under them and submit their own state-level compliance data, and MoHUA reviews what each state submits before grant funds are released. An internal Admin role keeps the system itself running (reminder notifications, registry oversight).

## Who Uses It — The Four Roles

The module serves four distinct user roles, each with entirely their own workspace after logging in.

### ULB (Urban Local Body)

A municipality's finance team. They fill in financial disclosure forms, upload audited and provisional annual account documents, and submit their bank account details for grant disbursement (via PFMS).

### State

A state government official. They track and review submissions coming in from every ULB in their state, manage the state's registry of ULBs, and submit the state's own compliance forms — including confirming their State Finance Commission (SFC) status, elected-body status, devolution formula data, and declaring any unspent grant funds.

### MOHUA (Ministry)

A central Ministry of Housing & Urban Affairs reviewer. They review what states submit — approving or rejecting state SFC-status and unspent-fund declarations, with the ability to reject individual line items and attach written remarks.

### Admin

An internal system administrator. They manage automated email reminder schedules and have oversight visibility into the full ULB registry, but don't participate in the grant reporting workflow itself.

Before entering their workspace, every user first selects the financial/grant year they're working in, and may be required to complete a profile-verification step.

## Features at a Glance

| Feature | Role(s) | What it does |
|---|---|---|
| Financial disclosure form | ULB | Submit financial disclosure data for the year |
| Document uploads (audited / provisional) | ULB | Upload annual account documents, with unsaved-work protection |
| Bank account (PFMS) submission | ULB | Submit bank details for grant disbursement, with IFSC lookup and secure document proof upload |
| State dashboard | State | Aggregated view of grants, tasks, ULB submission progress, and form completion |
| ULB registry management | State, Admin | Register and manage the list of ULBs under a state |
| SFC status | State, MOHUA (review) | Report / review State Finance Commission constitution and report status |
| Elected body status | State | Confirm elected urban local body status, including bulk Excel upload and post-submission corrections |
| Devolution formula | State | Submit the state's fund-allocation formula data |
| Unspent fund declaration | State, MOHUA (review) | Declare (and review) any unspent 16th-FC grant funds, broken down by ULB |
| Claim letter | State | Select ULBs and per-ULB claim amounts against the state's Devolution allocation, upload a signed claim letter, and submit to MoHUA |
| Scheduled reminders | Admin | Manage automated email reminder templates and schedules |
| Roles & teams directory | All roles | Browse relevant contacts and team roles |
| Support hours | All roles | View helpdesk support hours |

## Also in This Repository

This repository also contains several other feature areas outside the scope of this section: **CFR** (City Finance Ranking — state/ULB rankings on an India map), an **OCR validation** pipeline for document extraction, **AFS Dashboard** (audited financial statement dashboards), and the platform's **authentication** flows. See `CLAUDE.md` for details on those areas.

---

## Tech Stack

| Category | Library |
|---|---|
| Framework | Angular 20 (standalone components, no NgRx) |
| UI | Angular Material 20, Bootstrap 5 |
| Maps | Leaflet 1.9 |
| Charts | Chart.js 4 + chartjs-plugin-datalabels |
| PDF / Excel export | jsPDF, pdfmake, pdf-lib, xlsx, jszip, file-saver |
| Auth | @auth0/angular-jwt (JWT decoding) |
| Alerts | SweetAlert2 |
| Testing | Karma + Jasmine |
| Linting / Formatting | ESLint, Prettier |

## Getting Started

### Prerequisites

Node.js (LTS) and npm.

### Installation

```bash
npm install
```

### Development Server

```bash
npm run local     # Dev server on localhost:4300 with local config
npm run staging   # Dev server with staging config
npm run dev       # Dev server on port 4300 with development config
```

### Building

```bash
npm run build   # Production build (base href: /fc/)
npm run watch   # Build in watch mode
```

### Testing

```bash
npm run test     # Unit tests via Karma + Jasmine (watch mode)
```

To run a single test file:

```bash
npx ng test --include='src/app/path/to/file.spec.ts'
```

To run the full suite once (no watch), add `--watch=false`.

### Linting & Formatting

```bash
npm run lint        # ESLint (TS + HTML)
npm run lint:fix    # ESLint with auto-fix
npm run format      # Prettier (TS + HTML)
```

### Bundle Analysis

```bash
npm run analyze   # Webpack bundle analyzer (builds first)
npm run sm         # source-map-explorer
```

## Project Structure

### App-Level Layout

```
src/app/
├── core/           # Singleton services, guards, interceptors, pipes, validators, models
├── shared/         # Reusable UI components (header, footer, map, dialogs, dynamic-form)
├── features/       # Lazy-loaded feature areas (cfr, xvi-fc-module, xvi-fc-form, auth)
├── auth/           # Login, signup, forgot-password, OTP page components
├── admin/          # Admin-only routes (ocr, xvi-fc-review, afs-dashboard, events)
└── pages/          # Top-level page components
```

See `CLAUDE.md` for the full app-wide architecture reference.

### XVI FC Module Layout

```
src/app/features/xvi-fc-module/
├── admin-module/               # ADMIN role workspace
│   ├── overview/                # Landing page
│   └── scheduled-reminders/     # Email reminder template management (CRUD)
├── mohua-module/                # MOHUA role workspace
│   ├── overview/                # Landing dashboard
│   ├── roles-teams-overview/    # Contacts/roles directory
│   ├── review-state-submissions/  # Reviews a state's SFC-status submission
│   └── fc-unspent-review/       # Reviews states' unspent-fund declarations
├── state-module/                # STATE role workspace (largest sub-module)
│   ├── overview/                 # Landing dashboard
│   ├── state-dashboard/          # Aggregated grants/tasks/submissions dashboard
│   ├── ulb-submissions/          # Tracks incoming ULB submissions
│   ├── insights/                 # Analytics page
│   ├── requirements/             # Pre-condition checklist
│   ├── sfc-status/               # State Finance Commission status form
│   ├── elected-body-status/      # Elected ULB status form + bulk upload
│   ├── devolution-formula/       # Devolution/allocation formula submission
│   ├── special-infrastructure/   # Grant scheme info page
│   ├── urbanisation-premium/     # Grant scheme info page
│   ├── doe-status/               # Status page
│   ├── support-hours/            # Helpdesk hours
│   ├── roles-teams-overview/     # Contacts/roles directory
│   ├── ulb-list/                 # ULB registry management + registration
│   └── fc-unspent-declaration/   # Unspent grant fund declaration
├── ulb-module/                   # ULB role workspace
│   ├── overview/                 # Landing dashboard
│   ├── roles-teams-overview/     # Contacts/roles directory
│   ├── support-hours/            # Helpdesk hours
│   └── ulb-forms/                # Forms hub
│       ├── fill-disclosure/        # Financial disclosure form
│       ├── upload-documents/       # Audited/provisional document uploads
│       └── xvi-fc-bank-account/    # PFMS bank account submission
├── shared/                       # Cross-role reusable components
│   ├── form-progress/             # Status stepper (Draft → Submitted → Under Review...)
│   ├── overview-card/             # Reusable stat/summary card
│   ├── page-error-state/          # Shared error-state display
│   ├── profile-verification/      # Pre-workspace profile verification gate
│   ├── support-hours/             # Reusable support-hours card
│   └── years-selection/           # Financial/grant year picker
├── styles/                       # Module-scoped SCSS (layout mixins, theme tokens)
├── xvi-fc-module.routes.ts       # Top-level role router
├── xvi-fc-module.service.ts      # Route-context resolution, year validation
├── xvi-fc-side-menu.config.ts    # Role definitions, link builder
├── xvi-fc-side-menu.service.ts   # Fetches role/year-scoped sidebar from backend
└── dynamic-form-visibility.service.ts  # Conditional field visibility engine
```

## XVI FC Module — Architecture

### Routing & Role-Gating

`xvi-fc-module.routes.ts` mounts the module at `/xvifc` and reads the logged-in user's `role` from `localStorage.userData`. Four `canMatch` guards (`isUlbRole`, `isStateRole`, `isMohuaRole`, `isAdminRole`) route the same URL shape — `/xvifc/:yearId/...` — into one of four completely separate lazy-loaded route trees (`ulb-module/ulb-module.routes.ts`, `state-module/state-module.routes.ts`, `mohua-module/mohua-module.routes.ts`, `admin-module/admin-module.routes.ts`). A user only ever sees the routes belonging to their own role. Unmatched paths redirect to `/xvifc/year`, the year-selection step.

### State Management

Like the rest of the app, the XVI FC module uses RxJS `BehaviorSubject`s in services rather than NgRx. `xvi-fc-module.service.ts` (`XvifcModuleService`) resolves and holds the live role/year/entity route context, drives the sidebar menu reload whenever that context changes, and validates the selected year against the list of available years.

### Shared Infrastructure

- **`dynamic-form-visibility.service.ts`** — a conditional-visibility engine for the shared dynamic-form system: builds a dependency graph of which fields' visibility/enabled/validation state depends on other fields' values, and shows/hides/enables/disables/cascades controls as values change. This powers the "Yes/No branching" forms across `sfc-status`, `devolution-formula`, `elected-body-status`, and `fc-unspent-declaration`.
- **`xvi-fc-side-menu.config.ts`** / **`xvi-fc-side-menu.service.ts`** — define the role set and fetch the role- and year-specific sidebar menu structure from the backend (`xvi-fc/sidebar/:role`).
- **`shared/form-progress`** — renders a form's lifecycle status (Draft → Submitted → Under Review → ...) as a stepper/pill, with different steps for state-type vs. ULB-type forms.
- **`shared/overview-card`, `shared/page-error-state`, `shared/support-hours`, `shared/years-selection`, `shared/profile-verification`** — reusable building blocks used across all four role sub-modules.

### Styling

`styles/_shared-layout.scss` defines shared layout mixins (page headers, content-stack wrappers); `styles/_theme-colors.scss` is a generated Angular Material color palette; `styles/_xvi-fc-theme.scss` defines the module's Material theme and CSS custom-property tokens consumed throughout the module's components.

## XVI FC Module — Feature Reference by Role

### ULB Module

- **`ulb-forms/fill-disclosure`** — financial-disclosure data-entry form.
- **`ulb-forms/upload-documents`** — audited/provisional annual account file uploads; guarded by a deactivate guard to prevent losing unsaved uploads.
- **`ulb-forms/xvi-fc-bank-account`** — PFMS bank account submission with IFSC lookup and S3-based proof-document upload; the full account number is always masked and never stored or returned by the API (see linked doc below).
- **`overview`, `roles-teams-overview`, `support-hours`** — landing dashboard, contacts directory, helpdesk hours.

### State Module

- **`state-dashboard`** — aggregated read-only dashboard (grant metrics, tasks, ULB submission summary, form completion %, claim letter).
- **`sfc-status`** — State Finance Commission status form with draft-save/final-submit workflow.
- **`elected-body-status`** — elected ULB status form with Excel bulk upload/validation and a post-submission correction flow.
- **`devolution-formula`** — devolution/allocation formula data submission.
- **`fc-unspent-declaration`** — Yes/No branching declaration of unspent grant funds, with a searchable/paginated ULB picker.
- **`claim-letter`** — select ULBs and per-ULB claim amounts against the state's Installment 1 Devolution allocation, upload a signed claim letter, and submit to MoHUA; supports up to 3 concurrent claim batches with a searchable/paginated ULB picker.
- **`ulb-list`** (+ `register-ulb`) — manages the state's registry of ULBs.
- **`ulb-submissions`, `requirements`, `insights`, `special-infrastructure`, `urbanisation-premium`, `doe-status`** — submission tracking and informational pages.
- **`overview`, `roles-teams-overview`, `support-hours`** — landing dashboard, contacts directory, helpdesk hours.

### MOHUA Module

- **`fc-unspent-review`** — reviews states' unspent-fund declarations, per state, with single-row (`mohua-remarks-dialog`) or bulk (`bulk-reject-rows-dialog`) rejection with written remarks.
- **`review-state-submissions`** — reviews a state's SFC-status submission.
- **`overview`, `roles-teams-overview`** — landing dashboard, contacts directory.

### Admin Module

- **`scheduled-reminders`** — full management UI for automated email reminder templates and schedules.
- **`ulb-list`** — oversight view of the full ULB registry (reuses the State module's component).
- **`overview`** — landing page.

## Further Documentation

Some features have their own deeper documentation rather than being duplicated here:

- [`state-module/state-dashboard/README.md`](src/app/features/xvi-fc-module/state-module/state-dashboard/README.md) — State dashboard API integration details.
- [`ulb-module/ulb-forms/xvi-fc-bank-account/README.md`](src/app/features/xvi-fc-module/ulb-module/ulb-forms/xvi-fc-bank-account/README.md) — PFMS bank account form flow, including security notes.
- [`state-module/fc-unspent-declaration/FC_UNSPENT_UI_API_CONTRACT.md`](src/app/features/xvi-fc-module/state-module/fc-unspent-declaration/FC_UNSPENT_UI_API_CONTRACT.md) — UI-to-API contract for the unspent declaration feature.

## Known Issues

- `src/app/features/xvi-fc-module/temp.ts` appears to be unreferenced scratch code (only referenced in a commented-out import) and is not part of the module's actual architecture.

## Further Help

To get more help on the Angular CLI use `ng help` or check out the [Angular CLI Overview and Command Reference](https://angular.io/cli). For architecture and command reference aimed at AI-assisted development in this repo, see `CLAUDE.md`.
