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

/** Compute Y on the plane defined by `normal` passing through `point` at world XZ coords (x, z). */
const yOnPlane = (x: number, z: number, normal: Vec3, point: Vec3, fallback: number): number => {
  if (Math.abs(normal.y) < 1e-6) {
    return fallback;
  }
  return point.y - (normal.x * (x - point.x) + normal.z * (z - point.z)) / normal.y;
};

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
  boundsCenter = new Vec3(0, 0, 0);

  /** @attribute */
  boundsRadius = 10;

  /** @attribute */
  freeFly = false;

  /** @attribute */
  enableFly = true;

  /** @attribute */
  averageCameraHeight = 0;

  /**
   * Three world-space points defining the ground plane.
   * When provided, the camera Y position is derived from this plane during non-freeFly movement.
   *
   * Not a React prop — must be set directly on the script instance via useEffect. The @playcanvas/react
   * Script component is wrapped in memo() whose shallowEquals comparator returns early on the first prop
   * with a .equals() method (Vec3), so any prop listed after boundsCenter is never compared and the
   * component won't re-render when it changes. Set via:
   *   app.root.findByName('camera')?.script?.walkthroughCamera.groundPlane = points
   * Should be updated if shallowEquals is fixed (see https://github.com/playcanvas/react/pull/298)
   */
  groundPlane: Vec3[] = [];

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

  // Cached plane derived from groundPlane attribute. Computed once when 3 points become available.
  private _planeNormal = new Vec3(0, 1, 0);
  private _planePoint = new Vec3(0, 0, 0);
  private _hasGroundPlane = false;

  private _syncGroundPlane() {
    if (this._hasGroundPlane || this.groundPlane.length < 3) {
      return;
    }
    const p0 = this.groundPlane[0];
    const p1 = this.groundPlane[1];
    const p2 = this.groundPlane[2];
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
      return;
    }
    nx /= len;
    ny /= len;
    nz /= len;
    if (ny < 0) {
      nx = -nx;
      ny = -ny;
      nz = -nz;
    }
    this._planeNormal.set(nx, ny, nz);
    this._planePoint.set(p0.x, p0.y, p0.z);
    this._hasGroundPlane = true;
  }

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
      this._targetPitch = math.clamp(this._targetPitch - dy * this.lookSensitivity, this.pitchMin, this.pitchMax);
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
      // PlayCanvas uses right-handed CCW Y rotation: forward = (-sinθ, 0, -cosθ),
      // so to look toward (dx, 0, dz): θ = atan2(-dx, -dz).
      this._yaw = Math.atan2(-dx, -dz) * (180 / Math.PI);
      this._pitch = Math.atan2(-dy, Math.sqrt(dx * dx + dz * dz)) * (180 / Math.PI);
      this._pitch = math.clamp(this._pitch, this.pitchMin, this.pitchMax);
    }

    // Snap targets so there's no damped drift from the previous pose.
    this._targetPitch = this._pitch;
    this._targetYaw = this._yaw;

    this.entity.setEulerAngles(this._pitch, this._yaw, 0);
  }

  get currentYaw(): number {
    return this._targetYaw;
  }

  get currentPitch(): number {
    return this._targetPitch;
  }

  /**
   * Orbit the camera by `yawDelta` degrees around `boundsCenter`.
   * Called by AutoRotator
   */
  orbitStep(yawDelta: number) {
    this._syncGroundPlane();
    const pos = this.entity.getPosition();
    const dx = pos.x - this.boundsCenter.x;
    const dz = pos.z - this.boundsCenter.z;
    const radius = Math.sqrt(dx * dx + dz * dz) || this.boundsRadius * 0.5;
    const currentAngle = Math.atan2(dz, dx);
    const newAngle = currentAngle + (yawDelta * Math.PI) / 180;
    const nx = this.boundsCenter.x + radius * Math.cos(newAngle);
    const nz = this.boundsCenter.z + radius * Math.sin(newAngle);
    const ny = this._hasGroundPlane
      ? yOnPlane(nx, nz, this._planeNormal, this._planePoint, this.boundsCenter.y) + this.averageCameraHeight
      : this.boundsCenter.y;
    this.entity.setPosition(nx, ny, nz);

    const faceDx = this.boundsCenter.x - nx;
    const faceDz = this.boundsCenter.z - nz;
    this._yaw = Math.atan2(-faceDx, -faceDz) * (180 / Math.PI);
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
    this._syncGroundPlane();

    // Lerp current angles toward targets using the same damping as CameraControls.
    const r = dampRate(this.rotateDamping, dt);
    this._pitch += (this._targetPitch - this._pitch) * r;
    this._yaw += (this._targetYaw - this._yaw) * r;
    this._pitch = math.clamp(this._pitch, this.pitchMin, this.pitchMax);

    this.entity.setEulerAngles(this._pitch, this._yaw, 0);

    const pos = this.entity.getPosition();
    let nx = pos.x;
    let ny = pos.y;
    let nz = pos.z;

    if (this.enableFly) {
      const fast = this._keys.ShiftLeft || this._keys.ShiftRight;
      const slow = this._keys.ControlLeft || this._keys.ControlRight;
      const speed = (fast ? this.moveFastSpeed : slow ? this.moveSlowSpeed : this.moveSpeed) * dt;

      const fwd = (this._keys.KeyW || this._keys.ArrowUp ? 1 : 0) - (this._keys.KeyS || this._keys.ArrowDown ? 1 : 0);
      const strafe =
        (this._keys.KeyD || this._keys.ArrowRight ? 1 : 0) - (this._keys.KeyA || this._keys.ArrowLeft ? 1 : 0);

      const scrollFwd = -this._scrollDelta * this.scrollSpeed;

      if (fwd !== 0 || strafe !== 0 || scrollFwd !== 0) {
        // Use yaw-only rotation so movement is always horizontal.
        _quat.setFromEulerAngles(0, this._yaw, 0);
        _quat.transformVector(Vec3.FORWARD, _flatForward);
        _quat.transformVector(Vec3.RIGHT, _flatRight);

        nx += _flatForward.x * (fwd * speed + scrollFwd) + _flatRight.x * strafe * speed;
        nz += _flatForward.z * (fwd * speed + scrollFwd) + _flatRight.z * strafe * speed;
      }

      if (this.freeFly) {
        const up = (this._keys.KeyE ? 1 : 0) - (this._keys.KeyQ ? 1 : 0);
        if (up !== 0) {
          ny += up * speed;
        }
      }
    }

    this._scrollDelta = 0;

    if (!this.freeFly) {
      // Circular XZ clamp: project back onto the circle edge if outside.
      const cdx = nx - this.boundsCenter.x;
      const cdz = nz - this.boundsCenter.z;
      const dist = Math.sqrt(cdx * cdx + cdz * cdz);
      if (dist > this.boundsRadius) {
        const scale = this.boundsRadius / dist;
        nx = this.boundsCenter.x + cdx * scale;
        nz = this.boundsCenter.z + cdz * scale;
      }
    }

    const groundY = this._hasGroundPlane
      ? yOnPlane(nx, nz, this._planeNormal, this._planePoint, this.boundsCenter.y) + this.averageCameraHeight
      : this.boundsCenter.y;
    this.entity.setPosition(nx, this.freeFly ? ny : groundY, nz);
  }

  destroy() {
    this._removeListeners.forEach((fn) => fn());
    this._removeListeners = [];
  }
}
