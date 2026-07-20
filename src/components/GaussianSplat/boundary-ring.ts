import { Color, Script, Vec3 } from 'playcanvas';

import { computeGroundPlane, yOnPlane } from 'src/components/GaussianSplat/groundPlane';

export type BoundaryRingParams = {
  center: Vec3;
  radius: number;
  groundPlane: Vec3[];
  dashCount?: number;
  dashRatio?: number;
};

/**
 * Endpoint pairs of the "on" dashes of a boundary ring laid on the ground plane.
 * Each dash is one straight segment spanning `dashRatio` of the angular step between dashes;
 * both endpoints are sampled on the circle (center XZ + radius) and lifted onto the plane.
 * Returns an empty array when the radius is non-positive, dashCount is non-positive,
 * or the ground plane is invalid.
 */
export const boundaryRingSegments = ({
  center,
  radius,
  groundPlane,
  dashCount = 64,
  dashRatio = 0.5,
}: BoundaryRingParams): [Vec3, Vec3][] => {
  const plane = computeGroundPlane(groundPlane);
  if (radius <= 0 || dashCount <= 0 || !plane) {
    return [];
  }
  const segments: [Vec3, Vec3][] = [];
  const step = (Math.PI * 2) / dashCount;
  const on = step * dashRatio;
  for (let i = 0; i < dashCount; i++) {
    const a0 = i * step;
    const a1 = a0 + on;
    const x0 = center.x + radius * Math.cos(a0);
    const z0 = center.z + radius * Math.sin(a0);
    const x1 = center.x + radius * Math.cos(a1);
    const z1 = center.z + radius * Math.sin(a1);
    const p0 = new Vec3(x0, yOnPlane(x0, z0, plane.normal, plane.point, center.y), z0);
    const p1 = new Vec3(x1, yOnPlane(x1, z1, plane.normal, plane.point, center.y), z1);
    segments.push([p0, p1]);
  }
  return segments;
};

/**
 * Immediate-mode Script that draws a dashed boundary ring on the ground plane every frame.
 * center / radius / groundPlane are set imperatively by the BoundaryRing component
 * (see BoundaryRing.tsx for why they are not reactive Script props).
 */
export class BoundaryRingScript extends Script {
  static scriptName = 'boundaryRing';

  center = new Vec3();
  radius = 0;
  groundPlane: Vec3[] = [];
  color = new Color(1, 1, 1);
  dashCount = 64;
  dashRatio = 0.5;

  update() {
    if (this.radius <= 0 || this.groundPlane.length < 3) {
      return;
    }
    const segments = boundaryRingSegments({
      center: this.center,
      radius: this.radius,
      groundPlane: this.groundPlane,
      dashCount: this.dashCount,
      dashRatio: this.dashRatio,
    });
    for (const [p0, p1] of segments) {
      this.app.drawLine(p0, p1, this.color);
    }
  }
}
