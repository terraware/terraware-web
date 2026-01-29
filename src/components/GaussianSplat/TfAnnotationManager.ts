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
   * Update loop to attach click handlers to annotations and manage visibility.
   */
  update() {
    const annotationResources = (this as any)._annotationResources;
    if (!annotationResources) {
      return;
    }

    // Attach click handlers and update visibility for all annotations
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

        // Update visibility based on visible property
        const isVisible = annotation.visible !== undefined ? annotation.visible : true;

        // Set display on hotspot DOM
        if (resources.hotspotDom) {
          resources.hotspotDom.style.display = isVisible ? 'block' : 'none';
        }

        // Disable/enable the entity itself to prevent raycasting and rendering
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
   * Override to handle React components in annotation text.
   * Creates a portal container for React content instead of using textContent.
   * Also respects the visible property.
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
   * Override position update to adjust for canvas offset when using document.body.
   * Also respects the visible property to hide/show annotations.
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
   * Also scales the hotspot DOM element to match and respects visibility.
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

      // Ensure visibility is respected
      const isVisible = annotation.visible !== undefined ? annotation.visible : true;
      resources.hotspotDom.style.display = isVisible ? 'block' : 'none';
    }
  }
}
