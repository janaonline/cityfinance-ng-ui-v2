import { TowordPipe } from './toword.pipe';

describe('TowordPipe', () => {
  let pipe: TowordPipe;

  beforeEach(() => {
    pipe = new TowordPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('spells out a small amount with the Rupees suffix, no "Only"', () => {
    expect(pipe.transform(100)).toBe('One Hundred Rupees');
  });

  it('spells out a large amount using the Indian numbering system (crore/lakh)', () => {
    expect(pipe.transform(129300000)).toBe('Twelve Crore Ninety Three Lakh Rupees');
  });

  it('returns an empty string for zero/null/undefined', () => {
    expect(pipe.transform(0)).toBe('');
    expect(pipe.transform(null as unknown as number)).toBe('');
    expect(pipe.transform(undefined as unknown as number)).toBe('');
  });
});
