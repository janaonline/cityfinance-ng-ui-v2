import { joinWithAnd } from './xvi-fc-text.utils';

describe('joinWithAnd', () => {
  it('joins names the way the messages read', () => {
    expect(joinWithAnd([])).toBe('');
    expect(joinWithAnd(['SFC Status'])).toBe('SFC Status');
    expect(joinWithAnd(['SFC Status', 'GTC'])).toBe('SFC Status and GTC');
    expect(joinWithAnd(['A', 'B', 'C'])).toBe('A, B and C');
  });
});
