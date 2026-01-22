import { Vec3 } from 'playcanvas';
import { GsplatShaderEffect } from 'playcanvas/scripts/esm/gsplat/gsplat-shader-effect.mjs';

const shaderGLSL = /* glsl */ `
uniform vec3 uAabbMin;
uniform vec3 uAabbMax;
uniform float uFadeDistance;

void modifySplatCenter(inout vec3 center) {
    // No modifications needed
}

void modifySplatRotationScale(vec3 originalCenter, vec3 modifiedCenter, inout vec4 rotation, inout vec3 scale) {
    // Check if splat is inside AABB
    bool insideAABB = all(greaterThanEqual(modifiedCenter, uAabbMin)) && all(lessThanEqual(modifiedCenter, uAabbMax));

    if (insideAABB) {
        // Inside the box, no fade needed
        return;
    }

    // Calculate distance to AABB for splats outside
    vec3 distToMin = uAabbMin - modifiedCenter;
    vec3 distToMax = modifiedCenter - uAabbMax;

    // Get the maximum positive distance on each axis (how far outside we are)
    vec3 outsideDistance = max(distToMin, distToMax);
    outsideDistance = max(outsideDistance, vec3(0.0));

    // Use the maximum distance across all axes
    float maxOutsideDistance = max(max(outsideDistance.x, outsideDistance.y), outsideDistance.z);

    // Calculate fade factor: 1.0 at edge, 0.0 at fadeDistance away
    float fadeFactor = 1.0 - clamp(maxOutsideDistance / uFadeDistance, 0.0, 1.0);

    // Apply smooth fade using smoothstep for nicer transition
    fadeFactor = smoothstep(0.0, 1.0, fadeFactor);

    // Scale the splat based on fade factor
    scale *= fadeFactor;
}

void modifySplatColor(vec3 center, inout vec4 color) {
    // No color modification needed
}
`;

const shaderWGSL = /* wgsl */ `
uniform uAabbMin: vec3f;
uniform uAabbMax: vec3f;
uniform uFadeDistance: f32;

fn modifySplatCenter(center: ptr<function, vec3f>) {
    // No modifications needed
}

fn modifySplatRotationScale(originalCenter: vec3f, modifiedCenter: vec3f, rotation: ptr<function, vec4f>, scale: ptr<function, vec3f>) {
    // Check if splat is inside AABB
    let insideAABB = all(modifiedCenter >= uniform.uAabbMin) && all(modifiedCenter <= uniform.uAabbMax);

    if (insideAABB) {
        // Inside the box, no fade needed
        return;
    }

    // Calculate distance to AABB for splats outside
    let distToMin = uniform.uAabbMin - modifiedCenter;
    let distToMax = modifiedCenter - uniform.uAabbMax;

    // Get the maximum positive distance on each axis (how far outside we are)
    var outsideDistance = max(distToMin, distToMax);
    outsideDistance = max(outsideDistance, vec3f(0.0));

    // Use the maximum distance across all axes
    let maxOutsideDistance = max(max(outsideDistance.x, outsideDistance.y), outsideDistance.z);

    // Calculate fade factor: 1.0 at edge, 0.0 at fadeDistance away
    var fadeFactor = 1.0 - clamp(maxOutsideDistance / uniform.uFadeDistance, 0.0, 1.0);

    // Apply smooth fade using smoothstep for nicer transition
    fadeFactor = smoothstep(0.0, 1.0, fadeFactor);

    // Scale the splat based on fade factor
    *scale = (*scale) * fadeFactor;
}

fn modifySplatColor(center: vec3f, color: ptr<function, vec4f>) {
    // No color modification needed
}
`;

/**
 * Fade crop shader effect for gaussian splats.
 * Applies a smooth fade to splats outside the AABB based on distance.
 * Splats at the AABB edge are fully visible, and fade to invisible at fadeDistance away.
 */
export class GsplatFadeCropShaderEffect extends GsplatShaderEffect {
  static scriptName = 'gsplatFadeCropShaderEffect';

  _aabbMinArray = [0, 0, 0];
  _aabbMaxArray = [0, 0, 0];

  aabbMin = new Vec3(-0.5, -0.5, -0.5);
  aabbMax = new Vec3(0.5, 0.5, 0.5);
  fadeDistance = 0.5;

  getShaderGLSL() {
    return shaderGLSL;
  }

  getShaderWGSL() {
    return shaderWGSL;
  }

  updateEffect() {
    this._aabbMinArray[0] = this.aabbMin.x;
    this._aabbMinArray[1] = this.aabbMin.y;
    this._aabbMinArray[2] = this.aabbMin.z;
    this.setUniform('uAabbMin', this._aabbMinArray);

    this._aabbMaxArray[0] = this.aabbMax.x;
    this._aabbMaxArray[1] = this.aabbMax.y;
    this._aabbMaxArray[2] = this.aabbMax.z;
    this.setUniform('uAabbMax', this._aabbMaxArray);

    this.setUniform('uFadeDistance', this.fadeDistance);
  }
}
