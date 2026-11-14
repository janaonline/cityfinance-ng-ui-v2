import { buildStatusSummaryCards, summaryPercent, WorklistStatusSummary } from './status-summary-cards.models';

const summary = (overrides: Partial<WorklistStatusSummary> = {}): WorklistStatusSummary => ({
  total: 28,
  statesInScope: 28,
  notStarted: 26,
  inProgress: 0,
  underReview: { mohua: 2, pmu: 0 },
  returned: { mohua: 0, pmu: 0 },
  acknowledged: 0,
  ...overrides,
});

describe('buildStatusSummaryCards', () => {
  it('builds the five cards in order (Total Forms Expected is commented out), matching the product mockup', () => {
    const cards = buildStatusSummaryCards(summary());

    expect(cards.map((c) => c.label)).toEqual([
      'Not Started',
      'In Progress',
      'Under Review',
      'Returned',
      'Acknowledged',
    ]);
    expect(cards.map((c) => c.value)).toEqual([26, 0, 2, 0, 0]);
    expect(cards.map((c) => c.subText)).toEqual([
      '93% of 28',
      '0% of 28',
      'MoHUA 2 · PMU 0',
      'MoHUA 0 · PMU 0',
      '0% of 28',
    ]);
  });

  it('adds MoHUA and PMU for Under Review / Returned and splits them in the sub-text', () => {
    const cards = buildStatusSummaryCards(
      summary({ underReview: { mohua: 3, pmu: 4 }, returned: { mohua: 1, pmu: 5 } }),
    );
    expect(cards[2]).toEqual(jasmine.objectContaining({ value: 7, subText: 'MoHUA 3 · PMU 4' }));
    expect(cards[3]).toEqual(jasmine.objectContaining({ value: 6, subText: 'MoHUA 1 · PMU 5' }));
  });

  it('uses the history dialog colours for borders', () => {
    expect(buildStatusSummaryCards(summary()).map((c) => c.accent)).toEqual([
      'secondary',
      'secondary',
      'warning',
      'danger',
      'success',
    ]);
  });

  it('does not divide by zero for an empty scope', () => {
    const cards = buildStatusSummaryCards(
      summary({ total: 0, statesInScope: 0, notStarted: 0, underReview: { mohua: 0, pmu: 0 } }),
    );
    expect(cards.map((c) => c.subText)).toEqual([
      '0% of 0',
      '0% of 0',
      'MoHUA 0 · PMU 0',
      'MoHUA 0 · PMU 0',
      '0% of 0',
    ]);
  });
});

describe('summaryPercent', () => {
  it('rounds to whole numbers', () => {
    expect(summaryPercent(26, 28)).toBe(93);
    expect(summaryPercent(1, 3)).toBe(33);
    expect(summaryPercent(2, 3)).toBe(67);
  });
});
