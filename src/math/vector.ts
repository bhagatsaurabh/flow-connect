import { Serializable, SerializedVector2 } from '../core/interfaces';
import { Constant } from './constants';

export class Vector2 implements Serializable {
  x: number;
  y: number;
  tmpX: number;
  tmpY: number;

  constructor(xOrDOMPoint: number | DOMPoint, y?: number) {
    if (xOrDOMPoint instanceof DOMPoint)
      [this.x, this.y] = [xOrDOMPoint.x, xOrDOMPoint.y];
    else
      [this.x, this.y] = [xOrDOMPoint, y];
  }

  toString() {
    return '[' + this.x.toFixed(3) + ', ' + this.y.toFixed(3) + ']';
  }
  add(arg1: number | Vector2, arg2?: number): Vector2 {
    if (arg1 instanceof Vector2) {
      return new Vector2(this.x + arg1.x, this.y + arg1.y);
    } else if (typeof arg2 === 'undefined') {
      return new Vector2(this.x + arg1, this.y + arg1);
    } else {
      return new Vector2(this.x + arg1, this.y + arg2);
    }
  }
  addInPlace(arg1: number | Vector2, arg2?: number): Vector2 {
    if (arg1 instanceof Vector2) {
      this.x += arg1.x;
      this.y += arg1.y;
    } else if (typeof arg2 === 'undefined') {
      this.x += arg1;
      this.y += arg1;
    } else {
      this.x += arg1;
      this.y += arg2;
    }
    return this;
  }
  multiply(arg1: number | Vector2, arg2?: number): Vector2 {
    if (arg1 instanceof Vector2) {
      return new Vector2(this.x * arg1.x, this.y * arg1.y);
    } else if (typeof arg2 === 'undefined') {
      return new Vector2(this.x * arg1, this.y * arg1);
    } else {
      return new Vector2(this.x * arg1, this.y * arg2);
    }
  }
  multiplyInPlace(arg1: number | Vector2, arg2?: number): Vector2 {
    if (arg1 instanceof Vector2) {
      this.x *= arg1.x;
      this.y *= arg1.y;
    } else if (typeof arg2 === 'undefined') {
      this.x *= arg1;
      this.y *= arg1;
    } else {
      this.x *= arg1;
      this.y *= arg2;
    }
    return this;
  }
  subtract(arg1: number | Vector2, arg2?: number): Vector2 {
    if (arg1 instanceof Vector2) {
      return new Vector2(this.x - arg1.x, this.y - arg1.y);
    } else if (typeof arg2 === 'undefined') {
      return new Vector2(this.x - arg1, this.y - arg1);
    } else {
      return new Vector2(this.x - arg1, this.y - arg2);
    }
  }
  subtractInPlace(arg1: number | Vector2, arg2?: number): void {
    if (arg1 instanceof Vector2) {
      this.x -= arg1.x;
      this.y -= arg1.y;
    } else if (typeof arg2 === 'undefined') {
      this.x -= arg1;
      this.y -= arg1;
    } else {
      this.x -= arg1;
      this.y -= arg2;
    }
  }
  rotate(pivot: Vector2, degrees: number): Vector2 {
    degrees = degrees * Constant.TAU;
    let cosT = Math.cos(degrees);
    let sinT = Math.sin(degrees);
    return new Vector2(
      (cosT * (this.x - pivot.x)) - (sinT * (this.y - pivot.y)) + pivot.x,
      (sinT * (this.x - pivot.x)) + (cosT * (this.y - pivot.y)) + pivot.y
    );
  }
  rotateInPlace(pivot: Vector2, degrees: number): Vector2 {
    degrees = degrees * Constant.TAU;
    let cosT = Math.cos(degrees);
    let sinT = Math.sin(degrees);
    this.tmpX = (cosT * (this.x - pivot.x)) - (sinT * (this.y - pivot.y)) + pivot.x;
    this.tmpY = (sinT * (this.x - pivot.x)) + (cosT * (this.y - pivot.y)) + pivot.y;
    this.x = this.tmpX;
    this.y = this.tmpY;
    return this;
  }
  transform(transform: DOMMatrix): Vector2 {
    return new Vector2(transform.transformPoint(this));
  }
  transformInPlace(transform: DOMMatrix) {
    let transformedPoint = transform.transformPoint(this);
    [this.x, this.y] = [transformedPoint.x, transformedPoint.y];
  }
  max() {
    return Math.max(this.x, this.y);
  }
  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }
  clamp(minX: number, maxX: number, minY: number, maxY: number): Vector2 {
    if (this.x < minX) this.x = minX;
    if (this.x > maxX) this.x = maxX;
    if (this.y < minY) this.y = minY;
    if (this.y > maxY) this.y = maxY;
    return this;
  }

  static Midpoint(vector1: Vector2, vector2: Vector2): Vector2 {
    return new Vector2((vector1.x + vector2.x) / 2, (vector1.y + vector2.y) / 2);
  }
  static Distance(vector1OrX1: Vector2 | number, vector2OrY1: Vector2 | number, x2?: number, y2?: number): number {
    if (vector1OrX1 instanceof Vector2 && vector2OrY1 instanceof Vector2) {
      return Math.sqrt(Math.pow(vector2OrY1.x - vector1OrX1.x, 2) + Math.pow(vector2OrY1.y - vector1OrX1.y, 2));
    } else if (typeof vector1OrX1 === 'number' && typeof vector2OrY1 === 'number') {
      return Math.sqrt(Math.pow(x2 - vector1OrX1, 2) + Math.pow(y2 - vector2OrY1, 2));
    }
  }
  static Zero(): Vector2 {
    return new Vector2(0, 0);
  }
  static One(): Vector2 {
    return new Vector2(1, 1);
  }
  static Bounds(vectors: Vector2[]): Vector2[] {
    let minVec = new Vector2(Number.MAX_VALUE, Number.MAX_VALUE);
    let maxVec = new Vector2(Number.MIN_VALUE, Number.MIN_VALUE);

    vectors.forEach((vector) => {
      if (vector.x < minVec.x) minVec.x = vector.x;
      if (vector.y < minVec.y) minVec.y = vector.y;
      if (vector.x > maxVec.x) maxVec.x = vector.x;
      if (vector.y > maxVec.y) maxVec.y = vector.y;
    });
    return [minVec, maxVec];
  }
  static Average(vectors: Vector2[]): Vector2 {
    let sumX = 0;
    let sumY = 0;
    vectors.forEach((vector) => {
      sumX += vector.x;
      sumY += vector.y;
    });
    return new Vector2(sumX / vectors.length, sumY / vectors.length);
  }
  static Random(minX: number, maxX: number, minY: number, maxY: number): Vector2 {
    return new Vector2(
      Math.random() * (maxX - minX) + minX,
      Math.random() * (maxY - minY) + minY
    );
  }
  static Lerp(start: Vector2, end: Vector2, amount: number): Vector2 {
    return new Vector2(
      start.x + ((end.x - start.x) * amount),
      start.y + ((end.y - start.y) * amount)
    );
  }

  serialize(): SerializedVector2 {
    return { x: this.x, y: this.y };
  }
  static deSerialize(data: SerializedVector2): Vector2 {
    return new Vector2(data.x, data.y);
  }
}
