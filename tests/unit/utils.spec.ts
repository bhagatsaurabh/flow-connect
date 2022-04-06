import { clamp, denormalize, getNewUUID, getRandom, intersects, normalize } from '../../src/utils/utils';

describe('Utils', () => {
  it('should produce unique GUID\'s (theoretically)', () => {
    let guids = new Set();
    for (let iters = 0; iters < 100; iters++) guids.add(getNewUUID());

    expect(guids.size).toStrictEqual(100);
  });

  it('should normalize between 0-1', () => {
    expect(normalize(174.267, 100, 200)).toBeGreaterThanOrEqual(0);
    expect(normalize(174.267, 100, 200)).toBeLessThanOrEqual(1);
    expect(normalize(5, -10, 10)).toBeGreaterThanOrEqual(0);
    expect(normalize(5, -10, 10)).toBeLessThanOrEqual(1);
  });

  it('should de-normalize within range', () => {
    expect(denormalize(normalize(1527.735, 1000, 2000), 1000, 2000)).toBeGreaterThanOrEqual(1000);
    expect(denormalize(normalize(1527.735, 1000, 2000), 1000, 2000)).toBeLessThanOrEqual(2000);
    expect(denormalize(normalize(386.263, 285.2, 582.725), 285.2, 582.725)).toBeGreaterThanOrEqual(285.2);
    expect(denormalize(normalize(386.263, 285.2, 582.725), 285.2, 582.725)).toBeLessThanOrEqual(582.725);
  });

  it('should generate random number within range', () => {
    expect(getRandom(185.626, 893.924)).toBeGreaterThanOrEqual(185.626);
    expect(getRandom(185.626, 893.924)).toBeLessThanOrEqual(893.924);
  });

  it('should clamp value within range', () => {
    expect(clamp(163.726, 170, 200)).toStrictEqual(170);
    expect(clamp(737.524, 500, 700)).toStrictEqual(700);
    expect(clamp(426.6, 300, 600)).toStrictEqual(426.6);
  });
});
