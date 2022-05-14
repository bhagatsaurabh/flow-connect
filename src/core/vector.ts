import { Serializable } from '../common/interfaces.js';
import { normalize, clamp } from '../utils/utils.js';

export class Vector implements Serializable {
  x: number;
  y: number;

  constructor(xOrDOMPoint: number | DOMPoint, y?: number) {
    if (xOrDOMPoint instanceof DOMPoint)
      [this.x, this.y] = [xOrDOMPoint.x, xOrDOMPoint.y];
    else
      [this.x, this.y] = [xOrDOMPoint || 0, y || 0];
  }

  addInPlace(vector: Vector): Vector;
  addInPlace(scalar: number): Vector;
  addInPlace(x: number, y: number): Vector;
  addInPlace(arg1: number | Vector, arg2?: number): Vector {
    if (arg1 instanceof Vector) {
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
  multiplyInPlace(vector: Vector): Vector;
  multiplyInPlace(scalar: number): Vector;
  multiplyInPlace(x: number, y: number): Vector;
  multiplyInPlace(arg1: number | Vector, arg2?: number): Vector {
    if (arg1 instanceof Vector) {
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
  subtractInPlace(vector: Vector): Vector;
  subtractInPlace(scalar: number): Vector;
  subtractInPlace(x: number, y: number): Vector;
  subtractInPlace(arg1: number | Vector, arg2?: number): Vector {
    if (arg1 instanceof Vector) {
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
  normalizeInPlace(min: number, max: number): Vector;
  normalizeInPlace(minX: number, maxX: number, minY: number, maxY: number): Vector;
  normalizeInPlace(min: number, max: number, minY?: number, maxY?: number): Vector {
    if (typeof minY !== 'undefined' && typeof maxY !== 'undefined') {
      this.x = normalize(this.x, min, max);
      this.y = normalize(this.y, minY, maxY);
    } else {
      this.x = normalize(this.x, min, max);
      this.y = normalize(this.y, min, max);
    }

    return this;
  }
  clampInPlace(min: number, max: number): Vector;
  clampInPlace(minX: number, maxX: number, minY: number, maxY: number): Vector;
  clampInPlace(min: number, max: number, minY?: number, maxY?: number): Vector {
    if (typeof minY !== 'undefined' && typeof maxY !== 'undefined') {
      this.x = clamp(this.x, min, max);
      this.y = clamp(this.y, minY, maxY);
    } else {
      this.x = clamp(this.x, min, max);
      this.y = clamp(this.y, min, max);
    }

    return this;
  }
  transformInPlace(transform: DOMMatrix): Vector {
    let transformedPoint = transform.transformPoint(this);
    [this.x, this.y] = [transformedPoint.x, transformedPoint.y];
    return this;
  }
  absInPlace(): Vector {
    this.x = Math.abs(this.x);
    this.y = Math.abs(this.y);
    return this;
  }

  add(vector: Vector): Vector;
  add(scalar: number): Vector;
  add(x: number, y: number): Vector;
  add(arg1: number | Vector, arg2?: number): Vector {
    return (new Vector(this.x, this.y) as any).addInPlace(arg1, arg2);
  }
  multiply(vector: Vector): Vector;
  multiply(scalar: number): Vector;
  multiply(x: number, y: number): Vector;
  multiply(arg1: number | Vector, arg2?: number): Vector {
    return (new Vector(this.x, this.y) as any).multiplyInPlace(arg1, arg2);
  }
  subtract(vector: Vector): Vector;
  subtract(scalar: number): Vector;
  subtract(x: number, y: number): Vector;
  subtract(arg1: number | Vector, arg2?: number): Vector {
    return (new Vector(this.x, this.y) as any).subtractInPlace(arg1, arg2);
  }
  normalize(min: number, max: number): Vector;
  normalize(minX: number, maxX: number, minY: number, maxY: number): Vector;
  normalize(min: number, max: number, minY?: number, maxY?: number): Vector {
    return new Vector(this.x, this.y).normalizeInPlace(min, max, minY, maxY);
  }
  clamp(min: number, max: number): Vector;
  clamp(minX: number, maxX: number, minY: number, maxY: number): Vector;
  clamp(min: number, max: number, minY?: number, maxY?: number): Vector {
    return new Vector(this.x, this.y).clampInPlace(min, max, minY, maxY);
  }
  isInside(start: Vector, end: Vector): boolean;
  isInside(x1: number, y1: number, x2: number, y2: number): boolean;
  isInside(arg1: number | Vector, arg2: number | Vector, arg3?: number, arg4?: number): boolean {
    if (arg1 instanceof Vector && arg2 instanceof Vector) {
      if (this.x < arg1.x || this.x > arg2.x) return false;
      if (this.y < arg1.y || this.y > arg2.y) return false;
    } else {
      if (this.x < arg1 || this.x > arg3) return false;
      if (this.y < arg2 || this.y > arg4) return false;
    }

    return true;
  }
  assign(vector: Vector): Vector;
  assign(scalar: number): Vector;
  assign(x: number, y: number): Vector;
  assign(arg1: number | Vector, arg2?: number): Vector {
    if (arg1 instanceof Vector) {
      this.x = arg1.x;
      this.y = arg1.y;
    } else if (typeof arg2 === 'undefined') {
      this.x = arg1;
      this.y = arg1;
    } else {
      this.x = arg1;
      this.y = arg2;
    }
    return this;
  }
  transform(transform: DOMMatrix): Vector {
    return new Vector(this.x, this.y).transformInPlace(transform);
  }
  abs(): Vector {
    return new Vector(this.x, this.y).absInPlace();
  }
  toString() {
    return '[' + this.x.toFixed(3) + ', ' + this.y.toFixed(3) + ']';
  }
  clone(): Vector {
    return new Vector(this.x, this.y);
  }
  max(): number {
    return Math.max(this.x, this.y);
  }
  isEqual(vector: Vector, threshold?: number): boolean {
    if (typeof threshold !== 'undefined') {
      return Vector.Distance(this, vector) <= threshold;
    }

    return this.x === vector.x && this.y === vector.y;
  }

  static Distance(vector1OrX1: Vector | number, vector2OrY1: Vector | number, x2?: number, y2?: number): number {
    if (vector1OrX1 instanceof Vector && vector2OrY1 instanceof Vector) {
      return Math.sqrt(Math.pow(vector2OrY1.x - vector1OrX1.x, 2) + Math.pow(vector2OrY1.y - vector1OrX1.y, 2));
    } else if (typeof vector1OrX1 === 'number' && typeof vector2OrY1 === 'number') {
      return Math.sqrt(Math.pow(x2 - vector1OrX1, 2) + Math.pow(y2 - vector2OrY1, 2));
    }
  }
  static Midpoint(vector1: Vector, vector2: Vector): Vector {
    return new Vector((vector1.x + vector2.x) / 2, (vector1.y + vector2.y) / 2);
  }
  static Zero(): Vector {
    return new Vector(0, 0);
  }
  static Random(minX: number, maxX: number, minY: number, maxY: number): Vector {
    return new Vector(
      Math.random() * (maxX - minX) + minX,
      Math.random() * (maxY - minY) + minY
    );
  }

  serialize(): SerializedVector {
    return { x: this.x, y: this.y };
  }
  static deSerialize(data: SerializedVector): Vector {
    return new Vector(data.x, data.y);
  }
}

export interface SerializedVector {
  x: number, y: number
}
