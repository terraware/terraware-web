import { XrNavigation as PcXrNavigation } from 'playcanvas/scripts/esm/xr-navigation.mjs';

/**
 * Extended XrNavigation that fixes the bug where tryTeleport doesn't respect
 * the enableTeleport flag setting.
 */
export class TfXrNavigation extends PcXrNavigation {
  static scriptName = 'tfXrNavigation';

  /**
   * Override tryTeleport to respect the enableTeleport flag.
   * The base implementation is always called from handleSelectEnd,
   * but we only want to teleport when enableTeleport is true.
   */
  tryTeleport(inputSource: any) {
    // Only proceed with teleportation if enableTeleport is true
    if (!this.enableTeleport) {
      return;
    }

    // Call the parent implementation
    super.tryTeleport(inputSource);
  }
}
