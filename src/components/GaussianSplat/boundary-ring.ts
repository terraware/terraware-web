import {
  CULLFACE_NONE,
  Color,
  LAYERID_IMMEDIATE,
  Mesh,
  MeshInstance,
  Script,
  StandardMaterial,
  Vec3,
} from 'playcanvas';

import { computeGroundPlane, yOnPlane } from 'src/components/GaussianSplat/groundPlane';

export type BoundaryRingGeometryParams = {
  center: Vec3;
  radius: number;
  groundPlane: Vec3[];
  /** Band width in world units (the ring spans radius ± width / 2). */
  width: number;
  dashCount?: number;
  dashRatio?: number;
};

/** Flat-array triangle geometry ready for `Mesh.setPositions` / `Mesh.setIndices`. */
export type BoundaryRingGeometry = { positions: number[]; indices: number[] };

/**
 * Triangle geometry for a dashed boundary ring laid flat on the ground plane. Each dash is a
 * short band (a quad = two triangles) sweeping from `radius - width / 2` to `radius + width / 2`;
 * every vertex is sampled on the circle in XZ and lifted onto the plane via `yOnPlane`.
 * Returns empty arrays when radius, width, or dashCount is non-positive, or the plane is invalid.
 */
export const boundaryRingMesh = ({
  center,
  radius,
  groundPlane,
  width,
  dashCount = 64,
  dashRatio = 0.5,
}: BoundaryRingGeometryParams): BoundaryRingGeometry => {
  const plane = computeGroundPlane(groundPlane);
  if (radius <= 0 || width <= 0 || dashCount <= 0 || !plane) {
    return { positions: [], indices: [] };
  }

  const innerR = radius - width / 2;
  const outerR = radius + width / 2;
  const step = (Math.PI * 2) / dashCount;
  const on = step * dashRatio;
  const positions: number[] = [];
  const indices: number[] = [];

  const pushVertex = (r: number, angle: number) => {
    const x = center.x + r * Math.cos(angle);
    const z = center.z + r * Math.sin(angle);
    positions.push(x, yOnPlane(x, z, plane.normal, plane.point, center.y), z);
  };

  for (let i = 0; i < dashCount; i++) {
    const a0 = i * step;
    const a1 = a0 + on;
    const base = i * 4;
    // Per dash: v0 inner@a0, v1 outer@a0, v2 inner@a1, v3 outer@a1.
    pushVertex(innerR, a0);
    pushVertex(outerR, a0);
    pushVertex(innerR, a1);
    pushVertex(outerR, a1);
    indices.push(base, base + 1, base + 3, base, base + 3, base + 2);
  }

  return { positions, indices };
};

/**
 * Draws a dashed boundary ring as a flat band mesh on the ground plane.
 *
 * Rendered as a thin triangle band whose width is a fraction of the radius (`widthRatio`).
 * center / radius / groundPlane are set imperatively by the BoundaryRing component (see BoundaryRing.tsx for why
 * they are not reactive Script props), which calls `rebuild()` after updating them.
 */
export class BoundaryRingScript extends Script {
  static scriptName = 'boundaryRing';

  center = new Vec3();
  radius = 0;
  groundPlane: Vec3[] = [];
  color = new Color(1, 1, 1);
  dashCount = 64;
  dashRatio = 0.5;
  /** Band width as a fraction of the radius. */
  widthRatio = 0.05;

  private _material?: StandardMaterial;
  private _mesh?: Mesh;

  initialize() {
    const material = new StandardMaterial();
    material.useLighting = false;
    material.emissive = this.color;
    material.cull = CULLFACE_NONE;
    material.update();
    this._material = material;
    this.rebuild();
  }

  rebuild() {
    this._clearMesh();

    const geometry = boundaryRingMesh({
      center: this.center,
      radius: this.radius,
      groundPlane: this.groundPlane,
      width: this.radius * this.widthRatio,
      dashCount: this.dashCount,
      dashRatio: this.dashRatio,
    });
    if (geometry.positions.length === 0 || !this._material) {
      return;
    }

    const mesh = new Mesh(this.app.graphicsDevice);
    mesh.setPositions(geometry.positions);
    mesh.setIndices(geometry.indices);
    mesh.update();
    this._mesh = mesh;

    const meshInstance = new MeshInstance(mesh, this._material);
    if (this.entity.render) {
      this.entity.render.meshInstances = [meshInstance];
    } else {
      // Render on the Immediate layer (drawn after the World layer where the splats render) so
      // the ring is not composited behind them.
      this.entity.addComponent('render', { meshInstances: [meshInstance], layers: [LAYERID_IMMEDIATE] });
    }
  }

  private _clearMesh() {
    if (this.entity.render) {
      this.entity.render.meshInstances = [];
    }
    if (this._mesh) {
      this._mesh.destroy();
      this._mesh = undefined;
    }
  }

  destroy() {
    this._clearMesh();
    this._material?.destroy();
    this._material = undefined;
  }
}
