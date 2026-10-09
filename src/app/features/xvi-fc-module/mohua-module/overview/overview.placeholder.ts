// Placeholder figures until the MoHUA overview API exists — replace with the real response. Amounts in crore.
export const OVERVIEW_FIGURES = {
  allocation: 37272,
  instalment1: 18636,
  ulbsCovered: 3891,
  released: 196,
  eligible: 1897,
  eligibleUlbs: 246,
  claims: {
    total: { count: 7, amount: 907 },
    underReview: { count: 4, amount: 493 },
    returned: { count: 1, amount: 60 },
    approved: { count: 2, amount: 354 },
    approvedSentToDoe: 196,
    approvedAwaitingDoe: 158,
  },
} as const;

/** Claims needing a next step today: under review (4), returned to resubmit (1) and approved but not yet sent to DoE (1). */
export const NEEDS_ACTION = {
  claims: 4 + 1 + 1,
  amount: 493 + 60 + 158,
} as const;

export const formatCrore = (value: number | null): string => (value === null ? '—' : `₹${value.toLocaleString('en-IN')} cr`);
