import { AnnotationManager as PcAnnotationManager } from 'playcanvas/scripts/esm/annotations.mjs';

/**
 * Extended AnnotationManager that adds max size clamping for annotations
 * and fixes positioning when canvas is not at document origin.
 */
export class TfAnnotationManager extends PcAnnotationManager {
  static scriptName = 'tfAnnotationManager';

  private _maxWorldSize = 1.0;
  private _customParentDom: HTMLElement | null = null;

  /**
   * Maximum world-space size for annotations.
   * This prevents annotations from growing beyond this size regardless of camera distance.
   *
   * @attribute
   * @title Max World Size
   * @type {number}
   * @default 1.0
   */
  set maxWorldSize(value: number) {
    this._maxWorldSize = value;
  }

  get maxWorldSize() {
    return this._maxWorldSize;
  }

  /**
   * Initialize with custom parent DOM if needed.
   */
  initialize() {
    // Find a container div with data-annotation-container attribute
    const canvas = this.app.graphicsDevice.canvas;
    const container = canvas.parentElement?.querySelector('[data-annotation-container]') as HTMLElement;

    if (container) {
      this._customParentDom = container;
      (this as any)._parentDom = container;
    }

    // Call parent initialize
    super.initialize();
  }

  /**
   * Override position update to adjust for canvas offset when using document.body.
   * @private
   */
  _updateAnnotationPositions(annotation: any, resources: any, screenPos: any) {
    const canvas = this.app.graphicsDevice.canvas;
    const rect = canvas.getBoundingClientRect();

    // If using a custom parent (positioned container), use raw screen coordinates
    // Otherwise, adjust for canvas position in document
    const offsetX = this._customParentDom ? 0 : rect.left + window.scrollX;
    const offsetY = this._customParentDom ? 0 : rect.top + window.scrollY;

    resources.hotspotDom.style.display = 'block';
    resources.hotspotDom.style.left = `${screenPos.x + offsetX}px`;
    resources.hotspotDom.style.top = `${screenPos.y + offsetY}px`;

    if ((this as any)._activeAnnotation === annotation) {
      (this as any)._tooltipDom.style.left = `${screenPos.x + offsetX}px`;
      (this as any)._tooltipDom.style.top = `${screenPos.y + offsetY}px`;
    }
  }

  /**
   * Override the scale update to clamp the world size to a maximum value.
   * @private
   */
  _updateAnnotationRotationAndScale(annotation: any) {
    const cameraRotation = (this as any)._camera.getRotation();
    annotation.entity.setRotation(cameraRotation);
    annotation.entity.rotateLocal(90, 0, 0);

    const cameraPos = (this as any)._camera.getPosition();
    const distance = annotation.entity.getPosition().distance(cameraPos);
    const canvas = (this as any).app.graphicsDevice.canvas;
    const screenHeight = canvas.clientHeight;
    const projMatrix = (this as any)._camera.camera.projectionMatrix;

    // Calculate world size based on screen size and distance
    let worldSize = ((this as any)._hotspotSize / screenHeight) * ((2 * distance) / projMatrix.data[5]);

    // Clamp to maximum world size
    worldSize = Math.min(worldSize, this._maxWorldSize);

    annotation.entity.setLocalScale(worldSize, worldSize, worldSize);
  }
}
