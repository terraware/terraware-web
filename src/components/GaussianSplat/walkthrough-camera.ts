import { Quat, Script, Vec3, math } from 'playcanvas';

/**
 * First-person walkthrough camera for Gaussian Splat scenes.
 *
 * - Pointer drag (mouse or touch) rotates the camera (pitch + yaw) with damping
 *   matching PlayCanvas CameraControls' rotateDamping=0.98.
 * - WASD / arrow keys move along the XZ plane using yaw-only direction, so
 *   movement is always horizontal regardless of where the camera is pointing.
 * - Mouse wheel moves forward/backward along the XZ plane.
 * - Y position is clamped between boundsMin.y and boundsMax.y; set them equal
 *   to lock vertical position entirely.
 * - Exposes reset() and focusPoint to stay compatible with useCameraPosition.
 */

const _quat = new Quat();
const _flatForward = new Vec3();
const _flatRight = new Vec3();

/** Frame-rate-independent damping lerp rate — matches PlayCanvas CameraControls. */
const dampRate = (damping: number, dt: number) => 1 - Math.pow(damping, dt * 1000);

export class WalkthroughCamera extends Script {
  static scriptName = 'walkthroughCamera';

  /** @attribute */
  moveSpeed = 0.3;

  /** @attribute */
  moveFastSpeed = 0.5;

  /** @attribute */
  moveSlowSpeed = 0.15;

  /** @attribute */
  lookSensitivity = 0.1;

  /** @attribute */
  rotateDamping = 0.98;

  /** @attribute */
  pitchMin = -85;

  /** @attribute */
  pitchMax = 85;

  /** @attribute */
  scrollSpeed = 0.001;

  /** @attribute */
  boundsMin = new Vec3(-10, 0, -10);

  /** @attribute */
  boundsMax = new Vec3(10, 0, 10);

  // Current (damped) angles applied to the entity each frame.
  private _pitch = 0;
  private _yaw = 0;

  // Target angles — updated immediately on pointer move, entity lerps toward them.
  private _targetPitch = 0;
  private _targetYaw = 0;

  private _isDragging = false;
  private _lastX = 0;
  private _lastY = 0;
  private _scrollDelta = 0;
  private _keys: Partial<Record<string, boolean>> = {};
  private _removeListeners: (() => void)[] = [];

  initialize() {
    // Start horizontal; reset() will set the correct pose once splat data loads.
    this._pitch = 0;
    this._yaw = 0;
    this._targetPitch = 0;
    this._targetYaw = 0;

    const canvas = this.app.graphicsDevice.canvas;

    const onPointerDown = (e: PointerEvent) => {
      this._isDragging = true;
      this._lastX = e.clientX;
      this._lastY = e.clientY;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        // ignore — canvas may not be focusable yet
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!this._isDragging) {
        return;
      }
      const dx = e.clientX - this._lastX;
      const dy = e.clientY - this._lastY;
      this._lastX = e.clientX;
      this._lastY = e.clientY;
      this._targetYaw -= dx * this.lookSensitivity;
      this._targetPitch = math.clamp(
        this._targetPitch + dy * this.lookSensitivity,
        this.pitchMin,
        this.pitchMax
      );
    };

    const onPointerUp = (e: PointerEvent) => {
      this._isDragging = false;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      this._scrollDelta += e.deltaY;
    };

    const onContextMenu = (e: Event) => e.preventDefault();

    const onKeyDown = (e: KeyboardEvent) => {
      this._keys[e.code] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      this._keys[e.code] = false;
    };
    const onBlur = () => {
      this._keys = {};
      this._isDragging = false;
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    this._removeListeners = [
      () => canvas.removeEventListener('pointerdown', onPointerDown),
      () => canvas.removeEventListener('pointermove', onPointerMove),
      () => canvas.removeEventListener('pointerup', onPointerUp),
      () => canvas.removeEventListener('pointercancel', onPointerUp),
      () => canvas.removeEventListener('wheel', onWheel),
      () => canvas.removeEventListener('contextmenu', onContextMenu),
      () => window.removeEventListener('keydown', onKeyDown),
      () => window.removeEventListener('keyup', onKeyUp),
      () => window.removeEventListener('blur', onBlur),
    ];
  }

  /**
   * Position the camera at `position` looking toward `focus`.
   * Compatible with the useCameraPosition hook's reset() call.
   */
  reset(focus: Vec3, position: Vec3) {
    this.entity.setPosition(position);

    const dx = focus.x - position.x;
    const dy = focus.y - position.y;
    const dz = focus.z - position.z;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (len > 0) {
      // PlayCanvas forward is -Z, so yaw = atan2(dx, -dz).
      this._yaw = Math.atan2(dx, -dz) * (180 / Math.PI);
      this._pitch = Math.atan2(-dy, Math.sqrt(dx * dx + dz * dz)) * (180 / Math.PI);
      this._pitch = math.clamp(this._pitch, this.pitchMin, this.pitchMax);
    }

    // Snap targets so there's no damped drift from the previous pose.
    this._targetPitch = this._pitch;
    this._targetYaw = this._yaw;

    this.entity.setEulerAngles(this._pitch, this._yaw, 0);
  }

  /**
   * Returns the point directly in front of the camera.
   * Compatible with the useCameraPosition hook's focusPoint read.
   */
  get focusPoint(): Vec3 {
    const pos = this.entity.getPosition();
    _quat.setFromEulerAngles(this._pitch, this._yaw, 0);
    _quat.transformVector(Vec3.FORWARD, _flatForward);
    return new Vec3(pos.x + _flatForward.x, pos.y + _flatForward.y, pos.z + _flatForward.z);
  }

  update(dt: number) {
    // Lerp current angles toward targets using the same damping as CameraControls.
    const r = dampRate(this.rotateDamping, dt);
    this._pitch += (this._targetPitch - this._pitch) * r;
    this._yaw += (this._targetYaw - this._yaw) * r;
    this._pitch = math.clamp(this._pitch, this.pitchMin, this.pitchMax);

    this.entity.setEulerAngles(this._pitch, this._yaw, 0);

    const fast = this._keys.ShiftLeft || this._keys.ShiftRight;
    const slow = this._keys.ControlLeft || this._keys.ControlRight;
    const speed = (fast ? this.moveFastSpeed : slow ? this.moveSlowSpeed : this.moveSpeed) * dt;

    const fwd =
      (this._keys.KeyW || this._keys.ArrowUp ? 1 : 0) -
      (this._keys.KeyS || this._keys.ArrowDown ? 1 : 0);
    const strafe =
      (this._keys.KeyD || this._keys.ArrowRight ? 1 : 0) -
      (this._keys.KeyA || this._keys.ArrowLeft ? 1 : 0);

    const scrollFwd = -this._scrollDelta * this.scrollSpeed;
    this._scrollDelta = 0;

    const pos = this.entity.getPosition();
    let nx = pos.x;
    let nz = pos.z;

    if (fwd !== 0 || strafe !== 0 || scrollFwd !== 0) {
      // Use yaw-only rotation so movement is always horizontal.
      _quat.setFromEulerAngles(0, this._yaw, 0);
      _quat.transformVector(Vec3.FORWARD, _flatForward);
      _quat.transformVector(Vec3.RIGHT, _flatRight);

      nx += _flatForward.x * (fwd * speed + scrollFwd) + _flatRight.x * strafe * speed;
      nz += _flatForward.z * (fwd * speed + scrollFwd) + _flatRight.z * strafe * speed;
    }

    this.entity.setPosition(
      math.clamp(nx, this.boundsMin.x, this.boundsMax.x),
      math.clamp(pos.y, this.boundsMin.y, this.boundsMax.y),
      math.clamp(nz, this.boundsMin.z, this.boundsMax.z)
    );
  }

  destroy() {
    this._removeListeners.forEach((fn) => fn());
    this._removeListeners = [];
  }
}
