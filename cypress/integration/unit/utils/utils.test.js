import { ViewPort } from '../../../../src/math/constants';
import { Vector } from '../../../../src/math/vector';
import { clamp, denormalize, getNewUUID, getRandom, intersects, normalize } from '../../../../src/utils/utils';

describe('Utils', () => {
  it('should produce unique GUID\'s (theoretically)', () => {
    let guids = new Set();
    for (let iters = 0; iters < 100; iters++) guids.add(getNewUUID());

    expect(guids.size).to.be.equal(100);
  });

  it('should normalize between 0-1', () => {
    expect(normalize(174.267, 100, 200)).to.be.within(0, 1);
    expect(normalize(5, -10, 10)).to.be.within(0, 1);
  });

  it('should de-normalize within range', () => {
    expect(denormalize(normalize(1527.735, 1000, 2000), 1000, 2000)).to.be.within(1000, 2000);
    expect(denormalize(normalize(386.263, 285.2, 582.725), 285.2, 582.725)).to.be.within(285.2, 582.725);
  });

  it('should generate random number within range', () => {
    expect(getRandom(185.626, 893.924)).to.be.within(185.626, 893.924);
  });

  it('should decide if two rectangles are intersecting or not', () => {
    let rectangle1 = { start: new Vector(10, 10), end: new Vector(20, 20) };
    let rectangle2 = { start: new Vector(10, 10), end: new Vector(15, 15) };
    expect(intersects(
      rectangle1.start.x, rectangle1.start.y, rectangle1.end.x, rectangle1.end.y,
      rectangle2.start.x, rectangle2.start.y, rectangle2.end.x, rectangle2.end.y
    )).to.be.equal(ViewPort.INSIDE);

    rectangle1 = { start: new Vector(10, 10), end: new Vector(20, 20) };
    rectangle2 = { start: new Vector(12, 12), end: new Vector(15, 15) };
    expect(intersects(
      rectangle1.start.x, rectangle1.start.y, rectangle1.end.x, rectangle1.end.y,
      rectangle2.start.x, rectangle2.start.y, rectangle2.end.x, rectangle2.end.y
    )).to.be.equal(ViewPort.INSIDE);

    rectangle1 = { start: new Vector(13, 13), end: new Vector(20, 20) };
    rectangle2 = { start: new Vector(12, 12), end: new Vector(15, 15) };
    expect(intersects(
      rectangle1.start.x, rectangle1.start.y, rectangle1.end.x, rectangle1.end.y,
      rectangle2.start.x, rectangle2.start.y, rectangle2.end.x, rectangle2.end.y
    )).to.be.equal(ViewPort.INTERSECT);

    rectangle1 = { start: new Vector(-10, -10), end: new Vector(10, 10) };
    rectangle2 = { start: new Vector(-30, 30), end: new Vector(-20, 40) };
    expect(intersects(
      rectangle1.start.x, rectangle1.start.y, rectangle1.end.x, rectangle1.end.y,
      rectangle2.start.x, rectangle2.start.y, rectangle2.end.x, rectangle2.end.y
    )).to.be.equal(ViewPort.OUTSIDE);

    rectangle1 = { start: new Vector(10, 10), end: new Vector(20, 20) };
    rectangle2 = { start: new Vector(20, 15), end: new Vector(25, 20) };
    expect(intersects(
      rectangle1.start.x, rectangle1.start.y, rectangle1.end.x, rectangle1.end.y,
      rectangle2.start.x, rectangle2.start.y, rectangle2.end.x, rectangle2.end.y
    )).to.be.equal(ViewPort.INTERSECT);
  });

  it('should clamp value within range', () => {
    expect(clamp(163.726, 170, 200)).to.be.equal(170);
    expect(clamp(737.524, 500, 700)).to.be.equal(700);
    expect(clamp(426.6, 300, 600)).to.be.equal(426.6);
  });
});
