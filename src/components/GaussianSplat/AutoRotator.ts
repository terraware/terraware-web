import { Quat, Script, Vec3 } from 'playcanvas';

/**
 * Auto-rotator script that works with CameraControls.
 * Automatically rotates the camera after a period of inactivity by modifying
 * the CameraControls' internal pose angles.
 *
 * This follows the same pattern as the deprecated @playcanvas/react auto-rotator,
 * but works with CameraControls instead of OrbitControls.
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
   * Vertical oscillation speed. Set to 0 to disable pitch animation.
   *
   * @attribute
   * @title Pitch Speed
   */
  pitchSpeed = 0;

  /**
   * Amount of pitch oscillation in degrees.
   *
   * @attribute
   * @title Pitch Amount
   */
  pitchAmount = 1;

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
   * Handle user input events to reset the auto-rotation timer.
   * @private
   */
  private handleUserInput() {
    this.timer = 0;
    this.isCurrentlyRotating = false;
    this.hasStartedRotating = true;
  }

  /**
   * Initialize the script by finding the camera and its controls.
   */
  initialize() {
    // Bind event handlers
    this.onPointerDown = this.handleUserInput.bind(this);
    this.onKeyDown = this.handleUserInput.bind(this);

    // Add event listeners to detect user input
    if (this.app.graphicsDevice.canvas) {
      this.app.graphicsDevice.canvas.addEventListener('pointerdown', this.onPointerDown);
    }
    window.addEventListener('keydown', this.onKeyDown);

    // Find the camera child entity
    this.cameraEntity = this.entity.findByName('camera');
    if (this.cameraEntity) {
      // Find the CameraControls script on the camera entity
      this.cameraControls = this.cameraEntity.script?.cameraControls;
    }
  }

  /**
   * Update loop that handles auto-rotation logic.
   * Uses postUpdate to run AFTER CameraControls has updated.
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

    // Only check for angle changes after the first rotation has started AND we're not currently rotating
    // During the initial startDelay period, let CameraControls settle without resetting the timer
    // While actively rotating, don't check for angle changes (to avoid detecting our own rotation)
    if (this.hasStartedRotating && !this.isCurrentlyRotating && this.pitch !== null && this.yaw !== null) {
      // Check if angles changed significantly (user moved camera)
      const pitchDiff = Math.abs(this.pitch - currentPitch);
      const yawDiff = Math.abs(this.yaw - currentYaw);
      const angleThreshold = 0.1; // Ignore changes smaller than 0.1 degrees

      if (pitchDiff > angleThreshold || yawDiff > angleThreshold) {
        // Camera was moved by the user, reset timer and store new angles
        this.pitch = currentPitch;
        this.yaw = currentYaw;
        this.timer = 0;
        this.isCurrentlyRotating = false;
        this.hasStartedRotating = true;
        return;
      }
    }

    // Camera is still (or we're in the initial grace period), increment timer
    this.timer += dt;

    // Determine which delay to use
    const currentDelay = this.hasStartedRotating ? this.restartDelay : this.startDelay;

    // Start auto-rotation after delay
    if (this.timer >= currentDelay) {
      // Mark that we're currently rotating
      this.isCurrentlyRotating = true;

      // Animate the camera
      const time = this.timer - currentDelay;
      const fadeIn = this.smoothStep(time / this.startFadeInTime);

      // Calculate rotation delta
      const yawDelta = dt * fadeIn * this.speed;

      // Get the current focus point (what the camera is looking at)
      const focusPoint = pose.getFocus(new Vec3());

      // Get current camera position
      const currentPos = pose.position.clone();

      // Calculate offset from focus to camera
      const offset = new Vec3();
      offset.sub2(currentPos, focusPoint);

      // Rotate the offset around the Y-axis
      const rotationQuat = new Quat();
      rotationQuat.setFromAxisAngle(Vec3.UP, yawDelta);
      const rotatedOffset = new Vec3();
      rotationQuat.transformVector(offset, rotatedOffset);

      // Calculate new camera position
      const newPos = new Vec3();
      newPos.add2(focusPoint, rotatedOffset);

      // Update pose to look from new position to focus point
      pose.look(newPos, focusPoint);

      // Update the controller's internal state by calling attach()
      // This ensures the controller maintains our rotation
      if (this.cameraControls._controller && this.cameraControls._controller.attach) {
        this.cameraControls._controller.attach(pose, false);
      }

      // Update the camera entity to match the modified pose
      this.cameraEntity.setPosition(pose.position);
      this.cameraEntity.setEulerAngles(pose.angles);

      // Update our stored angles AFTER everything is applied
      // This prevents detecting our own rotation as user input on the next frame
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
