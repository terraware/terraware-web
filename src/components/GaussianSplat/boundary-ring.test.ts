import { Vec3 } from 'playcanvas';

import { boundaryRingMesh } from './boundary-ring';

const FLAT = [new Vec3(0, 0, 0), new Vec3(1, 0, 0), new Vec3(0, 0, 1)];

const toVertices = (positions: number[]): [number, number, number][] => {
  const out: [number, number, number][] = [];
  for (let i = 0; i < positions.length; i += 3) {
    out.push([positions[i], positions[i + 1], positions[i + 2]]);
  }
  return out;
};

describe('boundaryRingMesh', () => {
  it('produces four vertices and six indices per dash', () => {
    const geom = boundaryRingMesh({ center: new Vec3(0, 0, 0), radius: 5, width: 0.1, groundPlane: FLAT, dashCount: 16 });
    expect(geom.positions).toHaveLength(16 * 4 * 3);
    expect(geom.indices).toHaveLength(16 * 6);
  });

  it('places every vertex at the inner or outer radius from center in XZ', () => {
    const center = new Vec3(2, 0, -3);
    const radius = 4;
    const width = 0.2;
    const inner = radius - width / 2;
    const outer = radius + width / 2;
    const geom = boundaryRingMesh({ center, radius, width, groundPlane: FLAT, dashCount: 32 });
    for (const [x, , z] of toVertices(geom.positions)) {
      const d = Math.sqrt((x - center.x) ** 2 + (z - center.z) ** 2);
      const atInner = Math.abs(d - inner) < 1e-6;
      const atOuter = Math.abs(d - outer) < 1e-6;
      expect(atInner || atOuter).toBe(true);
    }
  });

  it('lifts every vertex onto a tilted ground plane (y = z)', () => {
    const tilted = [new Vec3(0, 0, 0), new Vec3(1, 0, 0), new Vec3(0, 1, 1)];
    const geom = boundaryRingMesh({ center: new Vec3(0, 0, 0), radius: 3, width: 0.1, groundPlane: tilted, dashCount: 8 });
    for (const [, y, z] of toVertices(geom.positions)) {
      expect(y).toBeCloseTo(z);
    }
  });

  it('references only in-range vertices from the index buffer', () => {
    const geom = boundaryRingMesh({ center: new Vec3(0, 0, 0), radius: 5, width: 0.1, groundPlane: FLAT, dashCount: 8 });
    const vertexCount = geom.positions.length / 3;
    for (const idx of geom.indices) {
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(vertexCount);
    }
  });

  it('returns empty geometry for a non-positive radius', () => {
    const geom = boundaryRingMesh({ center: new Vec3(0, 0, 0), radius: 0, width: 0.1, groundPlane: FLAT });
    expect(geom.positions).toHaveLength(0);
    expect(geom.indices).toHaveLength(0);
  });

  it('returns empty geometry for a non-positive width', () => {
    const geom = boundaryRingMesh({ center: new Vec3(0, 0, 0), radius: 5, width: 0, groundPlane: FLAT });
    expect(geom.positions).toHaveLength(0);
  });

  it('returns empty geometry for a non-positive dashCount', () => {
    const geom = boundaryRingMesh({ center: new Vec3(0, 0, 0), radius: 5, width: 0.1, groundPlane: FLAT, dashCount: 0 });
    expect(geom.positions).toHaveLength(0);
  });

  it('returns empty geometry for an invalid ground plane', () => {
    const collinear = [new Vec3(0, 0, 0), new Vec3(1, 0, 0), new Vec3(2, 0, 0)];
    const geom = boundaryRingMesh({ center: new Vec3(0, 0, 0), radius: 5, width: 0.1, groundPlane: collinear });
    expect(geom.positions).toHaveLength(0);
  });
});
