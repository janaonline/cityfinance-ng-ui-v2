import { LOCKED_BANNER_MESSAGE } from './dur.component';

// No component test harness exists yet for DurComponent (a large, dependency-heavy component) -
// this covers just the LOCKED_BANNER_MESSAGE map the dynamic year access exemption fix touched,
// rather than standing up a full TestBed just for one new entry.
describe('DurComponent LOCKED_BANNER_MESSAGE', () => {
  it('shows an exemption-specific message for EXEMPTED_ACKNOWLEDGED (12)', () => {
    expect(LOCKED_BANNER_MESSAGE[12]).toBe('Your ULB has been exempted from this requirement. No submission is needed.');
  });

  it('still has the pre-existing messages for the other locked statuses', () => {
    expect(LOCKED_BANNER_MESSAGE[3]).toBeDefined();
    expect(LOCKED_BANNER_MESSAGE[5]).toBeDefined();
    expect(LOCKED_BANNER_MESSAGE[7]).toBeDefined();
    expect(LOCKED_BANNER_MESSAGE[8]).toBeDefined();
  });
});
