import { Vector } from '../../../../src/math/vector';

describe('Vector', () => {
  describe('Constructor', () => {
    it('should create a Vector with single DOMPoint', () => {
      let vector = new Vector(new DOMPoint(20, 20));

      expect(vector).to.be.an.instanceOf(Vector);
      expect(vector).to.have.property('x', 20);
      expect(vector).to.have.property('y', 20);
    });

    it('should create a Vector with two co-ords', () => {
      let vector = new Vector(100, 150);

      expect(vector).to.be.an.instanceOf(Vector);
      expect(vector).to.have.property('x', 100);
      expect(vector).to.have.property('y', 150);
    });

    it('should create a Vector with default values without args', () => {
      let vector = new Vector();
      expect(vector).to.be.an.instanceOf(Vector);
      expect(vector).to.have.property('x', 0);
      expect(vector).to.have.property('y', 0);

      vector = new Vector(100);
      expect(vector).to.be.an.instanceOf(Vector);
      expect(vector).to.have.property('x', 100);
      expect(vector).to.have.property('y', 0);

      vector = new Vector(undefined, 200);
      expect(vector).to.be.an.instanceOf(Vector);
      expect(vector).to.have.property('x', 0);
      expect(vector).to.have.property('y', 200);
    });
  });
  describe('String Representation', () => {
    it('should create a string representation of co-ords', () => {
      let vector = new Vector(125.987285, 138.392796);
      expect(vector.toString()).equal('[125.987, 138.393]');

      vector = new Vector(20, 30.1);
      expect(vector.toString()).equal('[20.000, 30.100]');
    });
  });
  describe('Addition', () => {
    it('should create a new vector when summing with another vector', () => {
      let vector1 = new Vector(20, 30);
      let vector2 = new Vector(35, 60);

      let vector3 = vector1.add(vector2);
      expect(vector3).to.not.equal(vector1);
      expect(vector3).to.not.equal(vector2);
      expect(vector3).to.have.property('x', 55);
      expect(vector3).to.have.property('y', 90);
    });

    it('should create a new vector when summing with a scalar', () => {
      let vector1 = new Vector(20, 30);

      let vector2 = vector1.add(168);
      expect(vector2).to.not.equal(vector1);
      expect(vector2).to.have.property('x', 188);
      expect(vector2).to.have.property('y', 198);
    });

    it('should create a new vector when summing respectively with co-ords using two scalars', () => {
      let vector1 = new Vector(20, 30);

      let vector2 = vector1.add(100, 200);
      expect(vector2).to.not.equal(vector1);
      expect(vector2).to.have.property('x', 120);
      expect(vector2).to.have.property('y', 230);
    });
  });
  describe('In-place Addition', () => {
    it('should sum another vector in-place', () => {
      let vector1 = new Vector(20, 30);
      let vector2 = new Vector(35, 60);

      let vector3 = vector1.addInPlace(vector2);
      expect(vector3).to.be.equal(vector1);
      expect(vector3).to.have.property('x', 55);
      expect(vector3).to.have.property('y', 90);
    });

    it('should sum a scalar in-place', () => {
      let vector1 = new Vector(20, 30);

      let vector2 = vector1.addInPlace(168);
      expect(vector2).to.be.equal(vector1);
      expect(vector2).to.have.property('x', 188);
      expect(vector2).to.have.property('y', 198);
    });

    it('should sum two scalars respectively in-place to two co-ords', () => {
      let vector1 = new Vector(20, 30);

      let vector2 = vector1.addInPlace(100, 200);
      expect(vector2).to.be.equal(vector1);
      expect(vector2).to.have.property('x', 120);
      expect(vector2).to.have.property('y', 230);
    });
  });
  describe('Subtraction', () => {
    it('should create a new vector when subtracting from another vector', () => {
      let vector1 = new Vector(50, 50);
      let vector2 = new Vector(25, 30);

      let vector3 = vector1.subtract(vector2);
      expect(vector3).to.not.equal(vector1);
      expect(vector3).to.not.equal(vector2);
      expect(vector3).to.have.property('x', 25);
      expect(vector3).to.have.property('y', 20);
    });

    it('should create a new vector when subtracting from a scalar', () => {
      let vector1 = new Vector(20, 30);

      let vector2 = vector1.subtract(50);
      expect(vector2).to.not.equal(vector1);
      expect(vector2).to.have.property('x', -30);
      expect(vector2).to.have.property('y', -20);
    });

    it('should create a new vector when subtracting respectively from co-ords using two scalars', () => {
      let vector1 = new Vector(20, 100);

      let vector2 = vector1.subtract(100, 50);
      expect(vector2).to.not.equal(vector1);
      expect(vector2).to.have.property('x', -80);
      expect(vector2).to.have.property('y', 50);
    });
  });
  describe('In-place Subtraction', () => {
    it('should subtract another vector in-place', () => {
      let vector1 = new Vector(20, 30);
      let vector2 = new Vector(35, 60);

      let vector3 = vector1.subtractInPlace(vector2);
      expect(vector3).to.be.equal(vector1);
      expect(vector3).to.have.property('x', -15);
      expect(vector3).to.have.property('y', -30);
    });

    it('should subtract from a scalar in-place', () => {
      let vector1 = new Vector(180, 155);

      let vector2 = vector1.subtractInPlace(28);
      expect(vector2).to.be.equal(vector1);
      expect(vector2).to.have.property('x', 152);
      expect(vector2).to.have.property('y', 127);
    });

    it('should subtract two scalars respectively in-place from two co-ords', () => {
      let vector1 = new Vector(100, 200);

      let vector2 = vector1.subtractInPlace(20, 30);
      expect(vector2).to.be.equal(vector1);
      expect(vector2).to.have.property('x', 80);
      expect(vector2).to.have.property('y', 170);
    });
  });
  describe('Multiplication', () => {
    it('should create a new vector when multiplying with another vector', () => {
      let vector1 = new Vector(63, 74);
      let vector2 = new Vector(72, 14);

      let vector3 = vector1.multiply(vector2);
      expect(vector3).to.not.equal(vector1);
      expect(vector3).to.not.equal(vector2);
      expect(vector3).to.have.property('x', 63 * 72);
      expect(vector3).to.have.property('y', 74 * 14);
    });

    it('should create a new vector when multiplying with a scalar', () => {
      let vector1 = new Vector(20, 30);

      let vector2 = vector1.multiply(36);
      expect(vector2).to.not.equal(vector1);
      expect(vector2).to.have.property('x', 20 * 36);
      expect(vector2).to.have.property('y', 30 * 36);
    });

    it('should create a new vector when multiplying respectively with co-ords using two scalars', () => {
      let vector1 = new Vector(20, 30);

      let vector2 = vector1.multiply(100, 200);
      expect(vector2).to.not.equal(vector1);
      expect(vector2).to.have.property('x', 100 * 20);
      expect(vector2).to.have.property('y', 200 * 30);
    });
  });
  describe('In-place Multiplication', () => {
    it('should multiply another vector in-place', () => {
      let vector1 = new Vector(20, 30);
      let vector2 = new Vector(35, 60);

      let vector3 = vector1.multiplyInPlace(vector2);
      expect(vector3).to.be.equal(vector1);
      expect(vector3).to.have.property('x', 20 * 35);
      expect(vector3).to.have.property('y', 30 * 60);
    });

    it('should multiply a scalar in-place', () => {
      let vector1 = new Vector(20, 30);

      let vector2 = vector1.multiplyInPlace(16);
      expect(vector2).to.be.equal(vector1);
      expect(vector2).to.have.property('x', 16 * 20);
      expect(vector2).to.have.property('y', 16 * 30);
    });

    it('should multiply two scalars respectively in-place to two co-ords', () => {
      let vector1 = new Vector(20, 30);

      let vector2 = vector1.multiplyInPlace(100, 200);
      expect(vector2).to.be.equal(vector1);
      expect(vector2).to.have.property('x', 100 * 20);
      expect(vector2).to.have.property('y', 200 * 30);
    });
  });
  describe('Matrix Transformation', () => {
    let transformationMatrix = new DOMMatrix([
      Math.sin(30) * 2,
      Math.cos(30) * 2,
      -Math.sin(30) * 1.5,
      Math.cos(30) * 1.5,
      100,
      100
    ]);
    let transformedPoint = transformationMatrix.transformPoint({ x: 63, y: 74 });

    it('should create a new transformed vector using a DOMMatrix', () => {
      let vector = new Vector(63, 74);
      let transformedVector = vector.transform(transformationMatrix);

      expect(transformedVector).to.not.equal(vector);
      expect(transformedVector.x).to.be.closeTo(transformedPoint.x, 0.001);
      expect(transformedVector.y).to.be.closeTo(transformedPoint.y, 0.001);
    });

    it('should transform in-place using a DOMMatrix', () => {
      let vector = new Vector(63, 74);
      let transformedVector = vector.transformInPlace(transformationMatrix);

      expect(transformedVector).to.be.equal(vector);
      expect(transformedVector.x).to.be.closeTo(transformedPoint.x, 0.001);
      expect(transformedVector.y).to.be.closeTo(transformedPoint.y, 0.001);
    });
  });
  describe('Maximum of two co-ords', () => {
    it('should return maximum of two co-ords', () => {
      let vector = new Vector(127.383, 127.738);

      expect(vector.max()).to.be.equal(vector.y);
    });
  });
  describe('Clone', () => {
    it('should create a clone', () => {
      let vector = new Vector(100, 200);
      let clonedVector = vector.clone();

      expect(clonedVector).to.not.equal(vector);
      expect(clonedVector.x).to.be.equal(vector.x);
      expect(clonedVector.y).to.be.equal(vector.y);
    });
  });
  describe('Clamp', () => {
    it('should clamp co-ords within given bounds', () => {
      let vector = new Vector(126.734, 192.427);
      vector.clamp(126.800, 128, 191.427, 192);

      expect(vector.x).to.be.closeTo(126.800, 0.001);
      expect(vector.y).to.be.closeTo(192, 0.001);
    });
  });
  describe('Static Functions', () => {
    it('should calculate distance given two vectors', () => {
      let vector1 = new Vector(727, 168);
      let vector2 = new Vector(342, 572);
      let distance = Vector.Distance(vector1, vector2);

      expect(distance).to.be.closeTo(
        Math.sqrt(Math.pow(vector2.x - vector1.x, 2) + Math.pow(vector2.y - vector1.y, 2)),
        0.000001
      );
    });

    it('should calculate distance given two pair of co-ords', () => {
      let distance = Vector.Distance(727, 168, 342, 572);

      expect(distance).to.be.closeTo(
        Math.sqrt(Math.pow(342 - 727, 2) + Math.pow(572 - 168, 2)),
        0.000001
      );
    });

    it('should calculate midpoint given two vectors', () => {
      let vector1 = new Vector(727, 168);
      let vector2 = new Vector(342, 572);
      let midpoint = Vector.Midpoint(vector1, vector2);

      let distanceVector1ToMidpoint = Math.sqrt(Math.pow(midpoint.x - vector1.x, 2) + Math.pow(midpoint.y - vector1.y, 2));
      let distanceVector2ToMidpoint = Math.sqrt(Math.pow(vector2.x - midpoint.x, 2) + Math.pow(vector2.y - midpoint.y, 2));

      expect(distanceVector1ToMidpoint).to.be.closeTo(distanceVector2ToMidpoint, 0.000001);
    });

    it('should create a zero vector', () => {
      let zeroVector = Vector.Zero();

      expect(zeroVector).to.have.property('x', 0);
      expect(zeroVector).to.have.property('y', 0);
    });

    it('should create a random vector within bounds', () => {
      let randomVector = Vector.Random(10, 20, 100, 150);

      expect(randomVector.x).to.be.within(10, 20);
      expect(randomVector.y).to.be.within(100, 150);
    });
  });
  describe('Serialization and De-serialization', () => {
    it('should serialize', () => {
      let vector = new Vector(273.737, 926.821);
      let serializedVector = vector.serialize();

      expect(serializedVector).to.deep.equal({
        x: 273.737,
        y: 926.821
      });
    });

    it('should de-serialize', () => {
      let vector = new Vector(93.727, 197.75);
      let deSerializedVector = Vector.deSerialize(vector.serialize());

      expect(deSerializedVector).to.not.equal(vector);
      expect(vector.x).to.be.equal(deSerializedVector.x);
      expect(vector.y).to.be.equal(deSerializedVector.y);
    })
  });
});
