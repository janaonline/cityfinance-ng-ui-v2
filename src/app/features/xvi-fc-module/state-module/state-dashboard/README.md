# XVI-FC State Dashboard Frontend

## Purpose

This component renders the State DMA dashboard for the XVI-FC grant-processing overview from one aggregated, read-only backend response.

## Frontend route

```text
/xvifc/:yearId/dashboard
```

## Backend endpoint

```http
GET /api/v2/xvi-fc/state/:stateId/:yearId/dashboard
```

The service uses `environment.api.url2`, which already contains the `/api/v2/` prefix. Authentication remains the responsibility of the existing HTTP interceptor.

## Context sources

- `yearId` comes from the Angular route parameter and is observed for route changes.
- `stateId` comes from `AuthService.getCurrentUserSnapshot().state`.
- Missing State or year context prevents the request and displays a controlled error.

## Data flow

```text
Route/Auth Context
→ StateDashboardService
→ Dashboard API
→ StateDashboardComponent
→ Angular Material UI
```

The component issues one dashboard request per route/context load. A newer load cancels an older pending request.

## UI states

- Loading: Material progress spinner with no stale dashboard values behind it.
- Success: API context, metrics, State tasks, ULB summary, form completion, and claim-letter display are rendered.
- Error: controlled messages are used for 401, 403, 404, 500, and network failures.
- Empty: shown only when a successful envelope has no dashboard data.
- Retry: re-reads route and authenticated State context and calls the same service without reloading the browser.

Valid zero metrics and zero-count rows remain successful dashboard data and do not trigger the empty state.

## Amount formatting

Backend amount values remain raw numeric values. The frontend adds the INR symbol, Indian digit grouping, and the lowercase `crore` unit label for display only.

There is no crore/rupee conversion: values are never divided or multiplied by `10_000_000`, and the API model is not mutated.

## API sections rendered

- Context and financial year
- Four metric cards
- State data tasks
- ULB submission summary
- Form completion with client-only progress percentages
- Read-only claim-letter display

Server-provided array ordering and semantic statuses are retained. Zero-count summary categories are not hidden.

## CTA limitations

This integration does not add State task, ULB review, claim-generation, claim-submission, exemption, or other write APIs. Existing confirmed frontend navigation may be used, while null claim routes remain controlled placeholders.

## Known backend fallbacks

- `grantType` may be null and is hidden when absent.
- Claimed amount remains zero until claim persistence exists.
- SLB completion remains zero until an executable source exists.
- Exemption count remains zero until an executable source exists.
- Instalment 2 remains locked without persisted claim records.

## Testing

```bash
npm run test -- --include=src/app/features/xvi-fc-module/state-module/state-dashboard/state-dashboard.service.spec.ts --watch=false
npm run test -- --include=src/app/features/xvi-fc-module/state-module/state-dashboard/state-dashboard.component.spec.ts --watch=false
npm run build
```

Final validation: 59 targeted tests passed across the service and component suites. Targeted Prettier and ESLint checks passed, and the production Angular build completed successfully.
