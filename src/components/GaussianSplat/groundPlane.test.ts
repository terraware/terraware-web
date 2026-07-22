import { Vec3 } from 'playcanvas';

import { computeGroundPlane, yOnPlane } from './groundPlane';

describe('computeGroundPlane', () => {
  it('returns an up normal for a flat horizontal plane', () => {
    const plane = computeGroundPlane([new Vec3(0, 5, 0), new Vec3(1, 5, 0), new Vec3(0, 5, 1)]);
    expect(plane).not.toBeNull();
    expect(plane!.normal.x).toBeCloseTo(0);
    expect(plane!.normal.y).toBeCloseTo(1);
    expect(plane!.normal.z).toBeCloseTo(0);
    expect(plane!.point.y).toBeCloseTo(5);
  });

  it('flips a downward-facing normal so normal.y >= 0', () => {
    const plane = computeGroundPlane([new Vec3(0, 0, 0), new Vec3(0, 0, 1), new Vec3(1, 0, 0)]);
    expect(plane).not.toBeNull();
    expect(plane!.normal.y).toBeCloseTo(1);
  });

  it('computes a unit normal for a plane tilted 45deg about X (y = z)', () => {
    const plane = computeGroundPlane([new Vec3(0, 0, 0), new Vec3(1, 0, 0), new Vec3(0, 1, 1)]);
    expect(plane).not.toBeNull();
    const n = plane!.normal;
    expect(Math.sqrt(n.x * n.x + n.y * n.y + n.z * n.z)).toBeCloseTo(1);
    expect(n.x).toBeCloseTo(0);
    expect(n.y).toBeCloseTo(Math.SQRT1_2);
    expect(n.z).toBeCloseTo(-Math.SQRT1_2);
  });

  it('returns null for fewer than 3 points', () => {
    expect(computeGroundPlane([new Vec3(0, 0, 0), new Vec3(1, 0, 0)])).toBeNull();
  });

  it('returns null for collinear points', () => {
    expect(computeGroundPlane([new Vec3(0, 0, 0), new Vec3(1, 0, 0), new Vec3(2, 0, 0)])).toBeNull();
  });
});

describe('yOnPlane', () => {
  it('returns the constant height on a flat plane', () => {
    expect(yOnPlane(3, 7, new Vec3(0, 1, 0), new Vec3(0, 5, 0), -1)).toBeCloseTo(5);
  });

  it('interpolates height on a plane where y = z', () => {
    const n = new Vec3(0, Math.SQRT1_2, -Math.SQRT1_2);
    expect(yOnPlane(0, 2, n, new Vec3(0, 0, 0), 0)).toBeCloseTo(2);
    expect(yOnPlane(10, -3, n, new Vec3(0, 0, 0), 0)).toBeCloseTo(-3);
  });

  it('returns the fallback when the normal is (near) horizontal', () => {
    expect(yOnPlane(1, 1, new Vec3(1, 0, 0), new Vec3(0, 9, 0), 42)).toBe(42);
  });
});
