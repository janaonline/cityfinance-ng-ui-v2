# State Dashboard

## Purpose

This component renders the State DMA dashboard for the XVI-FC grant-processing overview.

## Route

`/xvifc/:yearId/dashboard`

Example:

`/xvifc/67d7d136d3d038946a5239e9/dashboard`

## Layout Reference

The layout follows the existing `sfc-status` state-module visual conventions and the provided dashboard mockup.

## Current Data Source

The current implementation uses static component-level mock data in `dashboardData`.

TODO: Replace static dashboardData with backend API once dashboard endpoint is available.

## Sections Rendered

- Header
- Metric cards
- Submit your State Data
- Review ULB Submissions
- Form completion rows
- Claim Letters

## Material Components Used

- `MatCardModule`
- `MatIconModule`
- `MatChipsModule`
- `MatButtonModule`
- `MatDividerModule`
- `MatListModule`

## Navigation Hooks

- Submit other state conditions: navigates to `../requirements`
- View ULB submissions: navigates to `../ulb-submissions`
- Start claim letter: placeholder method until a claim-letter workflow route exists

## Non-goals

- Does not modify SFC Status component
- Does not modify Disclosure component
- Does not add backend APIs
- Does not change existing ULB form flows

## Future API Contract Suggestion

```ts
{
  stateName: string;
  financialYear: string;
  totalUlbs: number;
  allocatedAmountCrore: number;
  claimedAmountCrore: number;
  complianceRate: number;
  compliantUlbs: number;
  stateDataTasks: Array<{
    key: string;
    title: string;
    subtitle: string;
    status: 'DONE' | 'PENDING';
    actionLabel?: string;
  }>;
  ulbSubmissionSummary: Array<{
    key: string;
    label: string;
    count: number;
    description: string;
  }>;
  formCompletionRows: Array<{
    label: string;
    completed: number;
    total: number;
  }>;
  claimLetters: Array<{
    key: string;
    title: string;
    subtitle: string;
    status: 'AVAILABLE' | 'LOCKED';
    actionLabel?: string;
  }>;
}
```
