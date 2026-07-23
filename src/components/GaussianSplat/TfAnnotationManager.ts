import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Icon, IconName } from '@terraware/web-components';
import { FILTER_LINEAR, PIXELFORMAT_RGBA8, Texture } from 'playcanvas';
import { AnnotationManager as PcAnnotationManager } from 'playcanvas/scripts/esm/annotations.mjs';

import { AnnotationIconType } from './Annotation';

// Maps each annotation icon type to a @terraware/web-components icon.
const ANNOTATION_ICONS: Record<AnnotationIconType, IconName> = {
  text: 'iconDocument',
  image: 'iconPhoto',
  video: 'iconVideo',
};

// Pixel dimensions of the (square) hotspot texture canvas at rest.
const HOTSPOT_TEXTURE_SIZE = 64;

// How much larger the hotspot appears while hovered.
const HOTSPOT_HOVER_SCALE = 1.3;

// Transparent margin (in texture pixels) added around the circle on hover so
// the baked drop shadow has room to render without being clipped. Must be at
// least HOTSPOT_SHADOW_BLUR (+ the vertical offset) to avoid clipping.
const HOTSPOT_SHADOW_PADDING = 20;

// Blur radius of the baked hover drop shadow, in texture pixels.
const HOTSPOT_SHADOW_BLUR = 16;

// Color (and opacity) of the baked hover drop shadow.
const HOTSPOT_SHADOW_COLOR = 'rgba(0, 0, 0, 0.2)';

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
  private _iconImages = new Map<AnnotationIconType, HTMLImageElement>();

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

    this._loadIconImages();
  }

  /**
   * Renders each web-components icon to an SVG image once. When an image finishes
   * loading, any annotations already using that icon are redrawn.
   * @private
   */
  _loadIconImages() {
    const fillColor = (this as any)._hotspotColor?.toString() ?? '#ffffff';

    (Object.keys(ANNOTATION_ICONS) as AnnotationIconType[]).forEach((iconType) => {
      const name = ANNOTATION_ICONS[iconType];
      const markup = renderToStaticMarkup(createElement(Icon, { name, fillColor })).replace(
        /^<svg/,
        '<svg width="128" height="128"'
      );

      const image = new Image();
      image.onload = () => this._refreshIcon(iconType);
      image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
      this._iconImages.set(iconType, image);
    });
  }

  /**
   * Redraws the texture for all annotations using the given icon, once its image
   * has loaded.
   * @private
   */
  _refreshIcon(iconType: AnnotationIconType) {
    const annotationResources = (this as any)._annotationResources;
    if (!annotationResources) {
      return;
    }

    annotationResources.forEach((_resources: any, annotation: any) => {
      if ((annotation.icon ?? 'menu') === iconType) {
        this._applyAnnotationIcon(annotation, (this as any)._hoverAnnotation === annotation);
      }
    });
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

            resources.hotspotDom.addEventListener('pointerdown', (e: PointerEvent) => {
              callback(e.clientX, e.clientY);
            });
          }
        }

        // Disable/enable the entity itself based on visibility
        const isVisible = annotation.enabled !== undefined ? annotation.enabled : true;

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
   * Override annotation registration to draw the media icon onto the hotspot
   * texture once the annotation (and its icon) is available.
   * @private
   */
  _registerAnnotation(annotation: any) {
    super._registerAnnotation(annotation);
    this._applyAnnotationIcon(annotation);
  }

  /**
   * Recreates the hotspot texture with the appropriate media icon drawn on it.
   * When `hovered` is true the texture includes a baked drop shadow.
   * @private
   */
  _applyAnnotationIcon(annotation: any, hovered = false) {
    const resources = (this as any)._annotationResources.get(annotation);
    if (!resources) {
      return;
    }

    const icon: AnnotationIconType = annotation.icon ?? 'menu';

    resources.texture.destroy();
    resources.texture = this._createHotspotTexture(annotation.label, HOTSPOT_TEXTURE_SIZE, 6, icon, hovered);
    resources.materials.forEach((material: any) => {
      material.emissiveMap = resources.texture;
      material.opacityMap = resources.texture;
      material.update();
    });
  }

  /**
   * Draws the icon image onto the hotspot texture canvas, scaled to fit the
   * circle. Does nothing if the image has not finished loading yet; the
   * annotation is redrawn once it has (see `_refreshIcon`).
   * @private
   */
  _drawIcon(ctx: CanvasRenderingContext2D, icon: AnnotationIconType, size: number, padding = 0) {
    const image = this._iconImages.get(icon);
    if (!image || !image.complete || image.naturalWidth === 0) {
      return;
    }

    const iconSize = size * 0.5;
    const offset = padding + (size - iconSize) / 2;
    ctx.drawImage(image, offset, offset, iconSize, iconSize);
  }

  /**
   * Keep the media icon drawn on the hotspot texture. The label text itself
   * is not rendered on the hotspot, so we simply redraw with the icon.
   * @private
   */
  _onLabelChange(annotation: any) {
    this._applyAnnotationIcon(annotation, (this as any)._hoverAnnotation === annotation);
  }

  /**
   * The hotspot colors are baked into the texture in `_createHotspotTexture`,
   * so the material emissive is kept white to let those colors render as drawn.
   * @private
   */
  _createHotspotMaterial(texture: any, options?: any) {
    const material = super._createHotspotMaterial(texture, options);
    material.emissive.set(1, 1, 1);
    material.update();
    return material;
  }

  _setAnnotationHover(annotation: any, hover: boolean) {
    // Grow hotspot and add shadow on hover
    this._applyAnnotationIcon(annotation, hover);
  }

  _updateAllAnnotationColors() {
    // No-op: hotspot colors are baked into the texture (see _createHotspotMaterial).
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _showTooltip(_annotation: any) {
    // No-op: AnnotationPanel handles all annotation UI, this removes default behavior
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _onTextChange(_annotation: any, _text: string) {
    // No-op: AnnotationPanel handles all annotation UI, this removes default behavior
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
    const isVisible = annotation.enabled !== undefined ? annotation.enabled : true;
    resources.hotspotDom.style.display = isVisible ? 'block' : 'none';
    resources.hotspotDom.style.left = `${screenPos.x + offsetX}px`;
    resources.hotspotDom.style.top = `${screenPos.y + offsetY}px`;

    if ((this as any)._activeAnnotation === annotation) {
      (this as any)._tooltipDom.style.display = isVisible ? 'block' : 'none';
      (this as any)._tooltipDom.style.left = `${screenPos.x + offsetX}px`;
      (this as any)._tooltipDom.style.top = `${screenPos.y + offsetY}px`;
    }

    if (annotation.onScreenPositionUpdateCallback) {
      // Rendered hotspot diameter (px), set by _updateAnnotationRotationAndScale.
      // Parsed from the style rather than measured to avoid forcing a reflow.
      const hotspotSize = parseFloat(resources.hotspotDom.style.width) || undefined;
      annotation.onScreenPositionUpdateCallback(screenPos.x + offsetX, screenPos.y + offsetY, hotspotSize);
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

    const hovered = (this as any)._hoverAnnotation === annotation;
    const hoverScale = hovered ? HOTSPOT_HOVER_SCALE : 1;

    // The hover texture is enlarged to fit the drop shadow (see
    // `_createHotspotTexture`), which would otherwise shrink the circle to
    // `HOTSPOT_TEXTURE_SIZE / paddedSize`. Scaling the entity by the inverse
    // cancels that out, leaving a clean `HOTSPOT_HOVER_SCALE` net growth.
    const paddingFactor = hovered ? (HOTSPOT_TEXTURE_SIZE + 2 * HOTSPOT_SHADOW_PADDING) / HOTSPOT_TEXTURE_SIZE : 1;
    const entityScale = worldSize * hoverScale * paddingFactor;

    annotation.entity.setLocalScale(entityScale, entityScale, entityScale);

    // Scale the hotspot DOM element proportionally when clamped. It tracks the
    // visible circle, so it grows by `hoverScale` only (not the padding factor).
    const resources = (this as any)._annotationResources.get(annotation);
    if (resources && resources.hotspotDom) {
      const scaleFactor = worldSize / unclamped;
      const baseSize = (this as any)._hotspotSize + 5; // Match the +5 from the stylesheet
      const scaledSize = baseSize * scaleFactor * hoverScale;
      resources.hotspotDom.style.width = `${scaledSize}px`;
      resources.hotspotDom.style.height = `${scaledSize}px`;
    }
  }

  /**
   * Override to create hotspot texture with custom background color.
   * @private
   */
  _createHotspotTexture(
    label: string,
    size = HOTSPOT_TEXTURE_SIZE,
    borderWidth = 6,
    icon?: AnnotationIconType,
    hovered = false
  ) {
    // On hover, pad the canvas so the baked drop shadow has room to render
    // without being clipped. The circle itself keeps the same pixel size in
    // both states; the entity scale compensates for the larger texture.
    const padding = hovered ? HOTSPOT_SHADOW_PADDING : 0;
    const canvasSize = size + 2 * padding;

    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas 2d context');
    }

    // First clear with stroke color at zero alpha
    ctx.fillStyle = 'white';
    ctx.globalAlpha = 0;
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    ctx.globalAlpha = 1.0;

    // Draw circle with custom background color
    const centerX = padding + size / 2;
    const centerY = padding + size / 2;
    const radius = size / 2 - 4;

    // The icon fill and border share the hotspot color
    const foregroundColor = (this as any)._hotspotColor?.toString() ?? '#ffffff';

    // Draw main circle, casting a drop shadow when hovered
    if (hovered) {
      ctx.shadowColor = HOTSPOT_SHADOW_COLOR;
      ctx.shadowBlur = HOTSPOT_SHADOW_BLUR;
      ctx.shadowOffsetY = 2;
    }
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = this._hotspotBackgroundColor;
    ctx.fill();

    // Reset the shadow so only the disc casts it (not the border or icon)
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Draw border
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = foregroundColor;
    ctx.stroke();

    // Draw the media icon inside the circle
    if (icon) {
      this._drawIcon(ctx, icon, size, padding);
    }

    // Get pixel data
    const imageData = ctx.getImageData(0, 0, canvasSize, canvasSize);
    const data = imageData.data;

    // Create and return the texture
    return new Texture(this.app.graphicsDevice, {
      width: canvasSize,
      height: canvasSize,
      format: PIXELFORMAT_RGBA8,
      magFilter: FILTER_LINEAR,
      minFilter: FILTER_LINEAR,
      mipmaps: false,
      levels: [new Uint8Array(data.buffer)],
    });
  }
}
