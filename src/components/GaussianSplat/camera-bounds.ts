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

    const pos = this.entity.getPosition();
    const clampedX = math.clamp(pos.x, this.boundsMin.x, this.boundsMax.x);
    const clampedY = math.clamp(pos.y, this.boundsMin.y, this.boundsMax.y);
    const clampedZ = math.clamp(pos.z, this.boundsMin.z, this.boundsMax.z);

    if (clampedX === pos.x && clampedY === pos.y && clampedZ === pos.z) {
      return;
    }

    // Shift the focus point by the same delta to preserve camera orientation.
    const focus: Vec3 = controls.focusPoint;
    const newFocus = new Vec3(focus.x + (clampedX - pos.x), focus.y + (clampedY - pos.y), focus.z + (clampedZ - pos.z));

    // Move the entity to the clamped position first — the focusPoint setter
    // reads entity position internally to recompute the pose.
    this.entity.setPosition(clampedX, clampedY, clampedZ);

    // Update CameraControls' internal pose so the clamped position persists
    // into the next frame (otherwise update() overwrites it from _pose).
    controls.focusPoint = newFocus;
  }
}
