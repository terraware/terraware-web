import { Script, Vec3, math } from 'playcanvas';

/**
 * Restricts camera movement to an AABB by clamping the CameraControls focus
 * point every frame. Attach this to the same entity as CameraControls.
 *
 * Runs in postUpdate so it executes after CameraControls.update() each frame.
 */
export class CameraBoundsScript extends Script {
  static scriptName = 'cameraBoundsScript';

  boundsMin = new Vec3(-5, -5, -5);
  boundsMax = new Vec3(5, 5, 5);

  postUpdate() {
    // @ts-expect-error - cameraControls is added dynamically to the entity's script
    const controls = this.entity.script?.cameraControls;
    if (!controls) {
      return;
    }

    const focus: Vec3 = controls.focusPoint;
    const clampedX = math.clamp(focus.x, this.boundsMin.x, this.boundsMax.x);
    const clampedY = math.clamp(focus.y, this.boundsMin.y, this.boundsMax.y);
    const clampedZ = math.clamp(focus.z, this.boundsMin.z, this.boundsMax.z);

    if (clampedX !== focus.x || clampedY !== focus.y || clampedZ !== focus.z) {
      controls.focusPoint = new Vec3(clampedX, clampedY, clampedZ);
    }
  }
}
