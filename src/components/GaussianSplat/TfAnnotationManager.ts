import { FILTER_LINEAR, PIXELFORMAT_RGBA8, Texture } from 'playcanvas';
import { AnnotationManager as PcAnnotationManager } from 'playcanvas/scripts/esm/annotations.mjs';

/**
 * Extended AnnotationManager that adds max size clamping for annotations
 * and fixes positioning when canvas is not at document origin.
 */
export class TfAnnotationManager extends PcAnnotationManager {
  static scriptName = 'tfAnnotationManager';

  private _maxWorldSize = 1.0;
  private _customParentDom: HTMLElement | null = null;
  private _clickHandlersAttached = new Set<any>();
  private _hotspotBackgroundColor = '#2C8658';

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
   * Background color for the hotspot texture canvas (the circle fill color).
   * This is a hex color string (e.g., '#2C8658') that's drawn on the texture canvas.
   * Note: This is different from hotspotColor and hoverColor, which are PlayCanvas Color objects
   * used for the material's emissive property.
   *
   * @attribute
   * @title Hotspot Background Color
   * @type {string}
   * @default '#2C8658'
   */
  set hotspotBackgroundColor(value: string) {
    this._hotspotBackgroundColor = value;
  }

  get hotspotBackgroundColor() {
    return this._hotspotBackgroundColor;
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
   * Update loop to attach click handlers to annotations and manage visibility.
   */
  update() {
    const annotationResources = (this as any)._annotationResources;
    if (!annotationResources) {
      return;
    }

    // Attach click handlers and manage visibility for all annotations
    annotationResources.forEach((resources: any, annotation: any) => {
      if (resources && resources.hotspotDom) {
        // Attach click handler if not already attached
        if (!this._clickHandlersAttached.has(annotation)) {
          const callback = annotation.onClickCallback;

          if (callback) {
            this._clickHandlersAttached.add(annotation);

            resources.hotspotDom.addEventListener('pointerdown', () => {
              callback();
            });
          }
        }

        // Disable/enable the entity itself based on visibility
        const isVisible = annotation.visible !== undefined ? annotation.visible : true;
        if (annotation.entity) {
          annotation.entity.enabled = isVisible;
        }

        // Hide tooltip if the active annotation is hidden
        if ((this as any)._activeAnnotation === annotation && !isVisible) {
          (this as any)._tooltipDom.style.visibility = 'hidden';
          (this as any)._tooltipDom.style.opacity = '0';
          (this as any)._activeAnnotation = null;
        }
      }
    });
  }

  /**
   * Override to handle React components in annotation text and respect visibility.
   * Creates a portal container for React content instead of using textContent.
   * @private
   */
  _showTooltip(annotation: any) {
    // Don't show tooltip if annotation is not visible
    const isVisible = annotation.visible !== undefined ? annotation.visible : true;
    if (!isVisible) {
      return;
    }

    (this as any)._activeAnnotation = annotation;
    (this as any)._tooltipDom.style.visibility = 'visible';
    (this as any)._tooltipDom.style.opacity = '1';
    (this as any)._titleDom.textContent = annotation.title;

    // Handle React content vs string text
    if (annotation.textContentRef?.current) {
      // Clear and set up React portal container for React components
      const textDom = (this as any)._textDom;
      textDom.innerHTML = '';

      const reactContainer = document.createElement('div');
      reactContainer.setAttribute('data-react-portal-container', 'true');
      reactContainer.style.width = '100%';
      reactContainer.style.height = '100%';
      textDom.appendChild(reactContainer);

      // Notify the annotation component about the container
      if (annotation.setTextContainer) {
        annotation.setTextContainer(reactContainer);
      }
    } else {
      // Standard string text
      (this as any)._textDom.textContent = annotation.text;
    }

    annotation.fire('show', annotation);
  }

  /**
   * Override to handle React components in annotation text.
   * Ensures portal container exists for React content.
   * @private
   */
  _onTextChange(annotation: any, text: string) {
    if ((this as any)._activeAnnotation === annotation) {
      // Handle React content vs string text
      if (annotation.textContentRef?.current) {
        // For React content, the portal will handle updates
        // Just make sure container exists
        const textDom = (this as any)._textDom;
        if (!textDom.querySelector('[data-react-portal-container]')) {
          textDom.innerHTML = '';

          const reactContainer = document.createElement('div');
          reactContainer.setAttribute('data-react-portal-container', 'true');
          reactContainer.style.width = '100%';
          reactContainer.style.height = '100%';
          textDom.appendChild(reactContainer);

          if (annotation.setTextContainer) {
            annotation.setTextContainer(reactContainer);
          }
        }
      } else {
        // Standard string text
        (this as any)._textDom.textContent = text;
      }
    }
  }

  /**
   * Override position update to adjust for canvas offset and respect visibility.
   * @private
   */
  _updateAnnotationPositions(annotation: any, resources: any, screenPos: any) {
    const canvas = this.app.graphicsDevice.canvas;
    const rect = canvas.getBoundingClientRect();

    // If using a custom parent (positioned container), use raw screen coordinates
    // Otherwise, adjust for canvas position in document
    const offsetX = this._customParentDom ? 0 : rect.left + window.scrollX;
    const offsetY = this._customParentDom ? 0 : rect.top + window.scrollY;

    // Check if annotation is visible (defaults to true if not specified)
    const isVisible = annotation.visible !== undefined ? annotation.visible : true;
    resources.hotspotDom.style.display = isVisible ? 'block' : 'none';
    resources.hotspotDom.style.left = `${screenPos.x + offsetX}px`;
    resources.hotspotDom.style.top = `${screenPos.y + offsetY}px`;

    if ((this as any)._activeAnnotation === annotation) {
      (this as any)._tooltipDom.style.display = isVisible ? 'block' : 'none';
      (this as any)._tooltipDom.style.left = `${screenPos.x + offsetX}px`;
      (this as any)._tooltipDom.style.top = `${screenPos.y + offsetY}px`;
    }
  }

  /**
   * Override the scale update to clamp the world size to a maximum value.
   * Also scales the hotspot DOM element to match.
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
    const unclamped = ((this as any)._hotspotSize / screenHeight) * ((2 * distance) / projMatrix.data[5]);

    // Clamp to maximum world size
    const worldSize = Math.min(unclamped, this._maxWorldSize);

    annotation.entity.setLocalScale(worldSize, worldSize, worldSize);

    // Scale the hotspot DOM element proportionally when clamped
    const resources = (this as any)._annotationResources.get(annotation);
    if (resources && resources.hotspotDom) {
      const scaleFactor = worldSize / unclamped;
      const baseSize = (this as any)._hotspotSize + 5; // Match the +5 from the stylesheet
      const scaledSize = baseSize * scaleFactor;
      resources.hotspotDom.style.width = `${scaledSize}px`;
      resources.hotspotDom.style.height = `${scaledSize}px`;
    }
  }

  /**
   * Override to create hotspot texture with custom background color.
   * @private
   */
  _createHotspotTexture(label: string, size = 64, borderWidth = 6) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas 2d context');
    }

    // First clear with stroke color at zero alpha
    ctx.fillStyle = 'white';
    ctx.globalAlpha = 0;
    ctx.fillRect(0, 0, size, size);
    ctx.globalAlpha = 1.0;

    // Draw circle with custom background color
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 4;

    // Draw main circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = this._hotspotBackgroundColor; // this is the only line different from playcanvas in this method
    ctx.fill();

    // Draw border
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = 'white';
    ctx.stroke();

    // Draw text
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.fillText(label, Math.floor(canvas.width / 2), Math.floor(canvas.height / 2) + 1);

    // Get pixel data
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;

    // Set the color channel of semitransparent pixels to white so the blending at
    // the edges is correct
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (a < 255) {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
      }
    }

    // Create and return the texture
    return new Texture(this.app.graphicsDevice, {
      width: size,
      height: size,
      format: PIXELFORMAT_RGBA8,
      magFilter: FILTER_LINEAR,
      minFilter: FILTER_LINEAR,
      mipmaps: false,
      levels: [new Uint8Array(data.buffer)],
    });
  }
}
