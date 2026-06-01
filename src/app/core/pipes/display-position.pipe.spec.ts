import { DisplayPositionPipe } from './display-position.pipe';

describe('DisplayPositionPipe', () => {
  it('create an instance', () => {
    const pipe = new DisplayPositionPipe();
    expect(pipe).toBeTruthy();
  });

  it('returns whole numbers unchanged', () => {
    const pipe = new DisplayPositionPipe();

    expect(pipe.transform(12)).toBe(12);
  });

  it('separates decimal digits with dots for display', () => {
    const pipe = new DisplayPositionPipe();

    expect(pipe.transform(12.345)).toBe('12.3.4.5');
  });
});
