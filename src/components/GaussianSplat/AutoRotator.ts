import { Quat, Script, Vec3 } from 'playcanvas';

/**
 * Auto-rotator script for PlayCanvas CameraControls.
 * Automatically orbits the camera around its focus point after a period of inactivity.
 */
export class AutoRotator extends Script {
  static scriptName = 'autoRotator';

  /**
   * Rotation speed in degrees per second when auto-rotating.
   *
   * @attribute
   * @title Speed
   */
  speed = 4;

  /**
   * Delay in seconds before auto-rotation starts after initialization.
   *
   * @attribute
   * @title Start Delay
   */
  startDelay = 5;

  /**
   * Delay in seconds before auto-rotation restarts after the camera stops moving.
   *
   * @attribute
   * @title Restart Delay
   */
  restartDelay = 2;

  /**
   * Duration in seconds to fade in the rotation speed.
   *
   * @attribute
   * @title Start Fade In Time
   */
  startFadeInTime = 5;

  /**
   * Internal timer tracking how long the camera has been idle.
   * @private
   */
  private timer = 0;

  /**
   * Flag to track if rotation has started at least once.
   * @private
   */
  private hasStartedRotating = false;

  /**
   * Flag to track if we're currently rotating.
   * @private
   */
  private isCurrentlyRotating = false;

  /**
   * Last known pitch angle for movement detection.
   * @private
   */
  private pitch: number | null = null;

  /**
   * Last known yaw angle for movement detection.
   * @private
   */
  private yaw: number | null = null;

  /**
   * Reference to the camera entity.
   * @private
   */
  private cameraEntity: any = null;

  /**
   * Reference to the CameraControls script.
   * @private
   */
  private cameraControls: any = null;

  /**
   * Bound event handlers for cleanup.
   * @private
   */
  private onPointerDown?: () => void;
  private onKeyDown?: () => void;

  /**
   * Handle user input events.
   * @private
   */
  private handleUserInput() {
    this.timer = 0;
    this.isCurrentlyRotating = false;
    this.hasStartedRotating = true;
  }

  /**
   * Initialize the script.
   */
  initialize() {
    this.onPointerDown = this.handleUserInput.bind(this);
    this.onKeyDown = this.handleUserInput.bind(this);

    if (this.app.graphicsDevice.canvas) {
      this.app.graphicsDevice.canvas.addEventListener('pointerdown', this.onPointerDown);
    }
    window.addEventListener('keydown', this.onKeyDown);

    this.cameraEntity = this.entity.findByName('camera');
    if (this.cameraEntity) {
      this.cameraControls = this.cameraEntity.script?.cameraControls;
    }
  }

  /**
   * Update loop that handles auto-rotation logic.
   * Runs after CameraControls updates.
   */
  postUpdate(dt: number) {
    if (!this.cameraControls || !this.cameraControls._pose) {
      return;
    }

    const pose = this.cameraControls._pose;
    const currentPitch = pose.angles.x;
    const currentYaw = pose.angles.y;

    // Initialize angles on first frame
    if (this.pitch === null || this.yaw === null) {
      this.pitch = currentPitch;
      this.yaw = currentYaw;
    }

    // Check for camera movement only after initial rotation has started and while not actively rotating
    if (this.hasStartedRotating && !this.isCurrentlyRotating && this.pitch !== null && this.yaw !== null) {
      const pitchDiff = Math.abs(this.pitch - currentPitch);
      const yawDiff = Math.abs(this.yaw - currentYaw);
      const angleThreshold = 0.1;

      if (pitchDiff > angleThreshold || yawDiff > angleThreshold) {
        this.pitch = currentPitch;
        this.yaw = currentYaw;
        this.timer = 0;
        this.isCurrentlyRotating = false;
        this.hasStartedRotating = true;
        return;
      }
    }

    this.timer += dt;

    // Determine which delay to use
    const currentDelay = this.hasStartedRotating ? this.restartDelay : this.startDelay;

    // Start auto-rotation after delay
    if (this.timer >= currentDelay) {
      this.isCurrentlyRotating = true;

      const time = this.timer - currentDelay;
      const fadeIn = this.smoothStep(time / this.startFadeInTime);
      const yawDelta = dt * fadeIn * this.speed;

      // Calculate orbit position around focus point
      const focusPoint = pose.getFocus(new Vec3());
      const offset = new Vec3().sub2(pose.position.clone(), focusPoint);

      const rotationQuat = new Quat().setFromAxisAngle(Vec3.UP, yawDelta);
      const rotatedOffset = new Vec3();
      rotationQuat.transformVector(offset, rotatedOffset);

      const newPos = new Vec3().add2(focusPoint, rotatedOffset);

      // Update pose and controller state
      pose.look(newPos, focusPoint);

      if (this.cameraControls._controller?.attach) {
        this.cameraControls._controller.attach(pose, false);
      }

      this.cameraEntity.setPosition(pose.position);
      this.cameraEntity.setEulerAngles(pose.angles);

      // Store current angles to avoid detecting our own rotation as user input
      this.pitch = pose.angles.x;
      this.yaw = pose.angles.y;
    }
  }

  /**
   * Smooth step interpolation function.
   *
   * @param {number} x - Input value.
   * @returns {number} - Smoothly interpolated value.
   * @private
   */
  private smoothStep(x: number): number {
    if (x <= 0) {
      return 0;
    }
    if (x >= 1) {
      return 1;
    }
    return Math.sin((x - 0.5) * Math.PI) * 0.5 + 0.5;
  }

  /**
   * Clean up event listeners when the script is destroyed.
   */
  destroy() {
    if (this.app.graphicsDevice.canvas && this.onPointerDown) {
      this.app.graphicsDevice.canvas.removeEventListener('pointerdown', this.onPointerDown);
    }
    if (this.onKeyDown) {
      window.removeEventListener('keydown', this.onKeyDown);
    }
  }
}
