import { Vec3 } from 'playcanvas';

export type GroundPlane = { normal: Vec3; point: Vec3 };

/** Compute Y on the plane defined by `normal` passing through `point` at world XZ coords (x, z). */
export const yOnPlane = (x: number, z: number, normal: Vec3, point: Vec3, fallback: number): number => {
  if (Math.abs(normal.y) < 1e-6) {
    return fallback;
  }
  return point.y - (normal.x * (x - point.x) + normal.z * (z - point.z)) / normal.y;
};

/**
 * Derive a ground plane from 3 world-space points.
 * Returns a normalized normal (flipped so normal.y >= 0) and a point on the plane,
 * or null when fewer than 3 points are supplied or they are degenerate/collinear.
 */
export const computeGroundPlane = (points: Vec3[]): GroundPlane | null => {
  if (points.length < 3) {
    return null;
  }
  const p0 = points[0];
  const p1 = points[1];
  const p2 = points[2];
  const v1x = p1.x - p0.x;
  const v1y = p1.y - p0.y;
  const v1z = p1.z - p0.z;
  const v2x = p2.x - p0.x;
  const v2y = p2.y - p0.y;
  const v2z = p2.z - p0.z;
  let nx = v1y * v2z - v1z * v2y;
  let ny = v1z * v2x - v1x * v2z;
  let nz = v1x * v2y - v1y * v2x;
  const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
  if (len < 1e-10) {
    return null;
  }
  nx /= len;
  ny /= len;
  nz /= len;
  if (ny < 0) {
    nx = -nx;
    ny = -ny;
    nz = -nz;
  }
  return { normal: new Vec3(nx, ny, nz), point: new Vec3(p0.x, p0.y, p0.z) };
};
