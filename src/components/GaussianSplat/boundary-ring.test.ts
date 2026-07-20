import { Vec3 } from 'playcanvas';

import { boundaryRingSegments } from './boundary-ring';

const FLAT = [new Vec3(0, 0, 0), new Vec3(1, 0, 0), new Vec3(0, 0, 1)];

describe('boundaryRingSegments', () => {
  it('produces one segment per dash', () => {
    const segments = boundaryRingSegments({ center: new Vec3(0, 0, 0), radius: 5, groundPlane: FLAT, dashCount: 16 });
    expect(segments).toHaveLength(16);
  });

  it('places every endpoint at the given radius from center in XZ', () => {
    const center = new Vec3(2, 0, -3);
    const radius = 4;
    const segments = boundaryRingSegments({ center, radius, groundPlane: FLAT, dashCount: 32 });
    for (const [p0, p1] of segments) {
      for (const p of [p0, p1]) {
        const dx = p.x - center.x;
        const dz = p.z - center.z;
        expect(Math.sqrt(dx * dx + dz * dz)).toBeCloseTo(radius);
      }
    }
  });

  it('lifts endpoints onto a tilted ground plane (y = z)', () => {
    const tilted = [new Vec3(0, 0, 0), new Vec3(1, 0, 0), new Vec3(0, 1, 1)];
    const segments = boundaryRingSegments({ center: new Vec3(0, 0, 0), radius: 3, groundPlane: tilted, dashCount: 8 });
    for (const [p0, p1] of segments) {
      expect(p0.y).toBeCloseTo(p0.z);
      expect(p1.y).toBeCloseTo(p1.z);
    }
  });

  it('returns no segments for a non-positive radius', () => {
    expect(boundaryRingSegments({ center: new Vec3(0, 0, 0), radius: 0, groundPlane: FLAT })).toHaveLength(0);
  });

  it('returns no segments for an invalid ground plane', () => {
    const collinear = [new Vec3(0, 0, 0), new Vec3(1, 0, 0), new Vec3(2, 0, 0)];
    expect(boundaryRingSegments({ center: new Vec3(0, 0, 0), radius: 5, groundPlane: collinear })).toHaveLength(0);
  });
});
