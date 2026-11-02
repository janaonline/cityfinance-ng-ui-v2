import {
  buildBatchNarrative,
  buildExemptionBadges,
  computeClaimDifferencePercentage,
  formatUnderReviewSuffix,
  describeEligibilitySourceDescription,
  describeEligibilitySourceLabel,
  formatUlbBreakdown,
  humanizeToken,
  isClaimWithinVariance,
  readApiError,
} from './claim-letter.utils';

describe('readApiError', () => {
  it('reads an HttpErrorResponse body, joining a class-validator message array', () => {
    const api = readApiError({
      error: { statusCode: 400, message: ['a must be a number', 'b is required'], code: 'X' },
    });
    expect(api).toEqual({
      statusCode: 400,
      message: 'a must be a number b is required',
      messages: ['a must be a number', 'b is required'],
      code: 'X',
      errors: undefined,
    });
  });

  it('reads a thrown success:false response and keeps a well-formed errors map only', () => {
    expect(readApiError({ success: false, message: 'Bad.', errors: { a: [{ message: 'Too long.' }] } }).errors).toEqual(
      {
        a: [{ message: 'Too long.' }],
      },
    );
    expect(readApiError({ error: { message: 'Bad.', errors: { a: 'not a list' } } }).errors).toBeUndefined();
  });

  it('is empty-handed for an error without a body', () => {
    expect(readApiError(null)).toEqual({});
    expect(readApiError({ error: { statusCode: 500 } }).message).toBeUndefined();
  });
});

describe('computeClaimDifferencePercentage', () => {
  it('returns 0 when allocation is 0 (avoids divide-by-zero)', () =>
    expect(computeClaimDifferencePercentage(0, 5)).toBe(0));
  it('returns a positive percentage when claimed exceeds allocation', () =>
    expect(computeClaimDifferencePercentage(10, 11)).toBeCloseTo(10, 5));
  it('returns a negative percentage when claimed is below allocation', () =>
    expect(computeClaimDifferencePercentage(10, 9)).toBeCloseTo(-10, 5));
  it('returns 0 when claimed equals allocation', () => expect(computeClaimDifferencePercentage(10, 10)).toBe(0));
});

describe('isClaimWithinVariance', () => {
  it('is true exactly at the lower 90% boundary', () => expect(isClaimWithinVariance(10, 9, 90, 110)).toBe(true));
  it('is true exactly at the upper 110% boundary', () => expect(isClaimWithinVariance(10, 11, 90, 110)).toBe(true));
  it('is false just below the lower boundary', () => expect(isClaimWithinVariance(10, 8.9, 90, 110)).toBe(false));
  it('is false just above the upper boundary', () => expect(isClaimWithinVariance(10, 11.1, 90, 110)).toBe(false));
  it('is true when claimed equals allocation', () => expect(isClaimWithinVariance(10, 10, 90, 110)).toBe(true));
  it('respects a configured non-default variance band', () => {
    expect(isClaimWithinVariance(10, 10, 100, 100)).toBe(true);
    expect(isClaimWithinVariance(10, 9.9, 100, 100)).toBe(false);
    expect(isClaimWithinVariance(10, 10.1, 100, 100)).toBe(false);
  });
});

describe('humanizeToken', () => {
  it('title-cases an underscore-separated token', () =>
    expect(humanizeToken('DEVOLUTION_FORMULA')).toBe('Devolution Formula'));
  it('handles a single-word token', () => expect(humanizeToken('FAILED')).toBe('Failed'));
  it('handles a token with digits', () =>
    expect(humanizeToken('FORM_STATUS_3_NOT_ACCEPTED')).toBe('Form Status 3 Not Accepted'));
});

describe('describeEligibilitySourceLabel', () => {
  it('prefers displayLabel when the backend configured one', () =>
    expect(describeEligibilitySourceLabel({ formType: 'DEVOLUTION_FORMULA', displayLabel: 'Devolution Formula' })).toBe(
      'Devolution Formula',
    ));
  it('falls back to a humanized formType when displayLabel is absent', () =>
    expect(describeEligibilitySourceLabel({ formType: 'SFC_STATUS' })).toBe('Sfc Status'));
});

describe('describeEligibilitySourceDescription', () => {
  it('prefers displayDescription when the backend configured one', () =>
    expect(
      describeEligibilitySourceDescription({
        formType: 'DEVOLUTION_FORMULA',
        displayDescription: 'Devolution Formula must be submitted by the state.',
      }),
    ).toBe('Devolution Formula must be submitted by the state.'));
  it('falls back to a generated "must be submitted" sentence when displayDescription is absent', () =>
    expect(describeEligibilitySourceDescription({ formType: 'SFC_STATUS' })).toBe(
      'Sfc Status must be submitted by the state.',
    ));
  it('appends the ULB count breakdown in parentheses when ulbBreakdown is present', () =>
    expect(
      describeEligibilitySourceDescription({
        formType: 'ELECTED_BODY',
        displayDescription: 'Elected Body constitution must be submitted by the state.',
        ulbBreakdown: { eligible: 100, ineligible: 20, exempted: 3, total: 123 },
      }),
    ).toBe(
      'Elected Body constitution must be submitted by the state. (100 eligible, 3 exempted, 20 ineligible out of 123 ULBs)',
    ));
});

describe('formatUlbBreakdown', () => {
  it('formats the tally as "N eligible, N exempted, N ineligible out of N ULBs"', () =>
    expect(formatUlbBreakdown({ eligible: 100, ineligible: 20, exempted: 3, total: 123 })).toBe(
      '100 eligible, 3 exempted, 20 ineligible out of 123 ULBs',
    ));

  it('adds how many exempted ULBs rest on a request still under MoHUA review', () =>
    expect(formatUlbBreakdown({ eligible: 100, ineligible: 20, exempted: 3, exemptedUnderReview: 1, total: 123 })).toBe(
      '100 eligible, 3 exempted (1 under review), 20 ineligible out of 123 ULBs',
    ));
});

describe('formatUnderReviewSuffix', () => {
  it('is empty unless an exemption is still under review', () => {
    expect(formatUnderReviewSuffix({ eligible: 1, ineligible: 0, exempted: 2, exemptedUnderReview: 2, total: 3 })).toBe(
      ' (2 under review)',
    );
    expect(formatUnderReviewSuffix({ eligible: 1, ineligible: 0, exempted: 2, exemptedUnderReview: 0, total: 3 })).toBe(
      '',
    );
    expect(formatUnderReviewSuffix({ eligible: 1, ineligible: 0, exempted: 2, total: 3 })).toBe('');
  });
});

describe('buildExemptionBadges', () => {
  it('makes one badge per status, under review first, naming the criteria', () =>
    expect(
      buildExemptionBadges([
        { label: 'Provisional Accounts', status: 'REJECTED' },
        { label: 'Audited Accounts', status: 'UNDER_REVIEW' },
        { label: 'Election Status', status: 'UNDER_REVIEW' },
      ]),
    ).toEqual([
      {
        status: 'UNDER_REVIEW',
        text: 'Exemption under review',
        tooltip: 'Exemption request under MoHUA review: Audited Accounts, Election Status',
      },
      {
        status: 'REJECTED',
        text: 'Exemption rejected by MoHUA',
        tooltip: 'Exemption request rejected by MoHUA: Provisional Accounts',
      },
    ]));

  it('makes none without notes', () => {
    expect(buildExemptionBadges(undefined)).toEqual([]);
    expect(buildExemptionBadges([])).toEqual([]);
  });
});

describe('buildBatchNarrative', () => {
  const baseInput = {
    rowCount: 0,
    expectedUlbCount: 10,
    liveClaimedTotal: 0,
    totalInstallmentAllocation: 25,
    remainingAfterThisBatch: 25,
    slotsRemaining: 2,
    installment: 1 as const,
    formatAmount: (value: number) => `${value} Cr.`,
  };

  it('shows a neutral placeholder when no rows have been added yet', () => {
    expect(buildBatchNarrative(baseInput)).toEqual([
      "Add ULBs below to see how this batch affects your state's overall allocation.",
    ]);
  });

  it('builds three bullets once rows exist, interpolating the installment number dynamically', () => {
    const narrative = buildBatchNarrative({
      ...baseInput,
      rowCount: 2,
      liveClaimedTotal: 5,
      remainingAfterThisBatch: 20,
      installment: 2,
    });

    expect(narrative.length).toBe(3);
    expect(narrative[0]).toBe('This batch includes 2 of 10 eligible ULBs (20.0%).');
    expect(narrative[1]).toContain('Installment 2 allocation');
    expect(narrative[1]).toContain('20.0%'); // 5 / 25
    expect(narrative[2]).toContain('20 Cr.');
    expect(narrative[2]).toContain('2 more batches');
  });

  it('uses singular "batch" when exactly one slot remains', () => {
    const narrative = buildBatchNarrative({ ...baseInput, rowCount: 1, slotsRemaining: 1 });
    expect(narrative[2]).toContain('1 more batch.');
  });

  it('never shows a negative slot count when none remain', () => {
    const narrative = buildBatchNarrative({ ...baseInput, rowCount: 1, slotsRemaining: -1 });
    expect(narrative[2]).toContain('0 more batches');
  });

  it('avoids divide-by-zero when expectedUlbCount or totalInstallmentAllocation is 0', () => {
    const narrative = buildBatchNarrative({
      ...baseInput,
      rowCount: 1,
      expectedUlbCount: 0,
      totalInstallmentAllocation: 0,
    });
    expect(narrative[0]).toContain('(0.0%)');
    expect(narrative[1]).toContain('0.0%');
  });
});
