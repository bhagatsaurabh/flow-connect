import { Serializable } from '../common/interfaces';
import { normalize, clamp } from '../utils/utils';

export class Vector2 implements Serializable {
  x: number;
  y: number;

  constructor(xOrDOMPoint: number | DOMPoint, y?: number) {
    if (xOrDOMPoint instanceof DOMPoint)
      [this.x, this.y] = [xOrDOMPoint.x, xOrDOMPoint.y];
    else
      [this.x, this.y] = [xOrDOMPoint || 0, y || 0];
  }

  addInPlace(vector: Vector2): Vector2;
  addInPlace(scalar: number): Vector2;
  addInPlace(x: number, y: number): Vector2;
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
  multiplyInPlace(vector: Vector2): Vector2;
  multiplyInPlace(scalar: number): Vector2;
  multiplyInPlace(x: number, y: number): Vector2;
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
  subtractInPlace(vector: Vector2): Vector2;
  subtractInPlace(scalar: number): Vector2;
  subtractInPlace(x: number, y: number): Vector2;
  subtractInPlace(arg1: number | Vector2, arg2?: number): Vector2 {
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
    return this;
  }
  normalizeInPlace(min: number, max: number): Vector2;
  normalizeInPlace(minX: number, maxX: number, minY: number, maxY: number): Vector2;
  normalizeInPlace(min: number, max: number, minY?: number, maxY?: number): Vector2 {
    if (typeof minY !== 'undefined' && typeof maxY !== 'undefined') {
      this.x = normalize(this.x, min, max);
      this.y = normalize(this.y, minY, maxY);
    } else {
      this.x = normalize(this.x, min, max);
      this.y = normalize(this.y, min, max);
    }

    return this;
  }
  clampInPlace(min: number, max: number): Vector2;
  clampInPlace(minX: number, maxX: number, minY: number, maxY: number): Vector2;
  clampInPlace(min: number, max: number, minY?: number, maxY?: number): Vector2 {
    if (typeof minY !== 'undefined' && typeof maxY !== 'undefined') {
      this.x = clamp(this.x, min, max);
      this.y = clamp(this.y, minY, maxY);
    } else {
      this.x = clamp(this.x, min, max);
      this.y = clamp(this.y, min, max);
    }

    return this;
  }
  transformInPlace(transform: DOMMatrix): Vector2 {
    let transformedPoint = transform.transformPoint(this);
    [this.x, this.y] = [transformedPoint.x, transformedPoint.y];
    return this;
  }
  absInPlace(): Vector2 {
    this.x = Math.abs(this.x);
    this.y = Math.abs(this.y);
    return this;
  }

  add(vector: Vector2): Vector2;
  add(scalar: number): Vector2;
  add(x: number, y: number): Vector2;
  add(arg1: number | Vector2, arg2?: number): Vector2 {
    return (new Vector2(this.x, this.y) as any).addInPlace(arg1, arg2);
  }
  multiply(vector: Vector2): Vector2;
  multiply(scalar: number): Vector2;
  multiply(x: number, y: number): Vector2;
  multiply(arg1: number | Vector2, arg2?: number): Vector2 {
    return (new Vector2(this.x, this.y) as any).multiplyInPlace(arg1, arg2);
  }
  subtract(vector: Vector2): Vector2;
  subtract(scalar: number): Vector2;
  subtract(x: number, y: number): Vector2;
  subtract(arg1: number | Vector2, arg2?: number): Vector2 {
    return (new Vector2(this.x, this.y) as any).subtractInPlace(arg1, arg2);
  }
  normalize(min: number, max: number): Vector2;
  normalize(minX: number, maxX: number, minY: number, maxY: number): Vector2;
  normalize(min: number, max: number, minY?: number, maxY?: number): Vector2 {
    return new Vector2(this.x, this.y).normalizeInPlace(min, max, minY, maxY);
  }
  clamp(min: number, max: number): Vector2;
  clamp(minX: number, maxX: number, minY: number, maxY: number): Vector2;
  clamp(min: number, max: number, minY?: number, maxY?: number): Vector2 {
    return new Vector2(this.x, this.y).clampInPlace(min, max, minY, maxY);
  }
  transform(transform: DOMMatrix): Vector2 {
    return new Vector2(this.x, this.y).transformInPlace(transform);
  }
  abs(): Vector2 {
    return new Vector2(this.x, this.y).absInPlace();
  }

  toString() {
    return '[' + this.x.toFixed(3) + ', ' + this.y.toFixed(3) + ']';
  }
  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }
  max(): number {
    return Math.max(this.x, this.y);
  }
  isEqual(vector: Vector2, threshold?: number): boolean {
    if (typeof threshold !== 'undefined') {
      return Vector2.Distance(this, vector) <= threshold;
    }

    return this.x === vector.x && this.y === vector.y;
  }
  isInside(start: Vector2, end: Vector2): boolean;
  isInside(x1: number, y1: number, x2: number, y2: number): boolean;
  isInside(arg1: number | Vector2, arg2: number | Vector2, arg3?: number, arg4?: number): boolean {
    if (arg1 instanceof Vector2 && arg2 instanceof Vector2) {
      if (this.x < arg1.x || this.x > arg2.x) return false;
      if (this.y < arg1.y || this.y > arg2.y) return false;
    } else {
      if (this.x < arg1 || this.x > arg3) return false;
      if (this.y < arg2 || this.y > arg4) return false;
    }

    return true;
  }

  static Distance(vector1OrX1: Vector2 | number, vector2OrY1: Vector2 | number, x2?: number, y2?: number): number {
    if (vector1OrX1 instanceof Vector2 && vector2OrY1 instanceof Vector2) {
      return Math.sqrt(Math.pow(vector2OrY1.x - vector1OrX1.x, 2) + Math.pow(vector2OrY1.y - vector1OrX1.y, 2));
    } else if (typeof vector1OrX1 === 'number' && typeof vector2OrY1 === 'number') {
      return Math.sqrt(Math.pow(x2 - vector1OrX1, 2) + Math.pow(y2 - vector2OrY1, 2));
    }
  }
  static Midpoint(vector1: Vector2, vector2: Vector2): Vector2 {
    return new Vector2((vector1.x + vector2.x) / 2, (vector1.y + vector2.y) / 2);
  }
  static Zero(): Vector2 {
    return new Vector2(0, 0);
  }
  static Random(minX: number, maxX: number, minY: number, maxY: number): Vector2 {
    return new Vector2(
      Math.random() * (maxX - minX) + minX,
      Math.random() * (maxY - minY) + minY
    );
  }

  serialize(): SerializedVector2 {
    return { x: this.x, y: this.y };
  }
  static deSerialize(data: SerializedVector2): Vector2 {
    return new Vector2(data.x, data.y);
  }
}

export interface SerializedVector2 {
  x: number, y: number
}
