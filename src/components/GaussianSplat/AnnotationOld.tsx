import React, { useCallback, useEffect, useRef } from 'react';

import {
  Application,
  BlendState,
  CULLFACE_NONE,
  CameraComponent,
  Color,
  Entity,
  FILTER_LINEAR,
  Layer,
  Mesh,
  MeshInstance,
  PIXELFORMAT_RGBA8,
  PlaneGeometry,
  StandardMaterial,
  Texture,
  Vec3,
} from 'playcanvas';

interface AnnotationOldProps {
  app: Application;
  entity: Entity;
  title: string;
  text: string;
  cameraPos?: Vec3;
}

let layerNormal: Layer | null = null;
let materialNormal: StandardMaterial | null = null;
let mesh: Mesh | null = null;
let activeTooltip: HTMLDivElement | null = null;
let styleSheetInjected = false;

const canvas = document.getElementsByTagName('canvas')[0];

const scrollPassthrough = (evt: WheelEvent) => {
  evt.preventDefault();
  const syntheticEvent = new WheelEvent(evt.type, {
    bubbles: true,
    cancelable: true,
    view: window,
    deltaX: evt.deltaX,
    deltaY: evt.deltaY,
    deltaZ: evt.deltaZ,
    deltaMode: evt.deltaMode,
    clientX: evt.clientX,
    clientY: evt.clientY,
    screenX: evt.screenX,
    screenY: evt.screenY,
  });
  canvas.dispatchEvent(syntheticEvent);
};

const pointerPassthrough = (evt: PointerEvent) => {
  evt.preventDefault();
  canvas.dispatchEvent(
    new PointerEvent(evt.type, {
      bubbles: true,
      cancelable: true,
      pointerId: evt.pointerId,
      clientX: evt.clientX,
      clientY: evt.clientY,
      screenX: evt.screenX,
      screenY: evt.screenY,
      pointerType: evt.pointerType,
      isPrimary: evt.isPrimary,
    })
  );
};

const pointerEventsToForward = ['pointerdown', 'pointermove', 'pointerup', 'pointercancel'];

const injectStyles = () => {
  if (styleSheetInjected) {
    return;
  }

  const css = `
    .pc-annotation {
      display: none;
      position: absolute;
      background-color: rgba(0, 0, 0, 0.6);
      color: white;
      padding: 16px;
      border-radius: 8px;
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
      max-width: 200px;
      word-wrap: break-word;
      overflow-x: visible;
      white-space: normal;
      width: fit-content;
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
    }

    .pc-annotation-title {
      font-weight: bold;
      margin-bottom: 4px;
    }

    .pc-annotation-hotspot {
      display: none;
      position: absolute;
      width: 30px;
      height: 30px;
      opacity: 0;
      cursor: pointer;
      transform: translate(-50%, -50%);
    }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
  styleSheetInjected = true;
};

const createHotspotTexture = (
  app: Application,
  alpha = 0.8,
  size = 64,
  fillColor = '#000000',
  strokeColor = '#5bb6bb',
  borderWidth = 10
): Texture => {
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = size;
  textureCanvas.height = size;
  const ctx = textureCanvas.getContext('2d')!;

  ctx.fillStyle = strokeColor;
  ctx.globalAlpha = 0;
  ctx.fillRect(0, 0, size, size);
  ctx.globalAlpha = alpha - 0.3;

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - borderWidth;

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = fillColor;
  ctx.fill();

  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.lineWidth = borderWidth;
  ctx.strokeStyle = strokeColor;
  ctx.stroke();

  const texture = new Texture(app.graphicsDevice, {
    width: size,
    height: size,
    format: PIXELFORMAT_RGBA8,
    magFilter: FILTER_LINEAR,
    minFilter: FILTER_LINEAR,
    mipmaps: false,
  });
  texture.setSource(textureCanvas);

  return texture;
};

const createHotspotMaterial = (
  texture: Texture,
  { opacity = 1, depthTest = true, depthWrite = true } = {}
): StandardMaterial => {
  const material = new StandardMaterial();

  material.diffuse = Color.BLACK;
  material.emissive = Color.WHITE;
  material.emissiveMap = texture;
  material.opacityMap = texture;

  material.opacity = opacity;
  material.alphaTest = 0.01;
  material.blendState = BlendState.ALPHABLEND;

  material.depthTest = depthTest;
  material.depthWrite = depthWrite;

  material.cull = CULLFACE_NONE;
  material.useLighting = false;

  material.update();
  return material;
};

const AnnotationOld: React.FC<AnnotationOldProps> = ({ app, entity, title, text, cameraPos }) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hotspotRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<CameraComponent | null>(null);
  const hotspotEntityRef = useRef<Entity | null>(null);
  const animationFrameRef = useRef<number>();

  const showTooltip = (tooltip: HTMLDivElement) => {
    tooltip.style.display = 'block';
    tooltip.style.opacity = '1';
  };

  const hideTooltip = useCallback((tooltip: HTMLDivElement) => {
    tooltip.style.opacity = '0';
    setTimeout(() => {
      if (tooltip.style.opacity === '0') {
        tooltip.style.display = 'none';
      }
    }, 200);
  }, []);

  const calculateScreenSpaceScale = useCallback(
    (camera: CameraComponent): number => {
      const DESIRED_PIXEL_SIZE = 12;

      const camPos = camera.entity.getPosition();
      const toAnnotation = entity.getPosition().sub(camPos);
      const distance = toAnnotation.length();

      const projMatrix = camera.projectionMatrix;
      const screenHeight = app.graphicsDevice.height;

      const worldSize = (DESIRED_PIXEL_SIZE / screenHeight) * ((2 * distance) / projMatrix.data[5]);

      return Math.max(worldSize * window.devicePixelRatio, 0.012);
    },
    [app, entity]
  );

  const updateAnnotation = useCallback(() => {
    const camera = cameraRef.current;
    const tooltip = tooltipRef.current;
    const hotspot = hotspotRef.current;
    const hotspotEntity = hotspotEntityRef.current;

    if (!camera || !tooltip || !hotspot || !hotspotEntity) {
      return;
    }

    const position = entity.getPosition();
    const screenPos = camera.worldToScreen(position);

    if (screenPos.z <= 0) {
      hotspot.style.display = 'none';
      if (tooltip.style.display !== 'none') {
        hideTooltip(tooltip);
        if (activeTooltip === tooltip) {
          activeTooltip = null;
        }
      }
      return;
    }

    hotspot.style.display = 'block';
    hotspot.style.left = `${screenPos.x}px`;
    hotspot.style.top = `${screenPos.y}px`;

    if (tooltip.style.display === 'block') {
      tooltip.style.left = `${screenPos.x - tooltip.scrollWidth / 2}px`;

      if (tooltip.scrollHeight + screenPos.y > window.innerHeight) {
        tooltip.style.top = `${screenPos.y - tooltip.scrollHeight}px`;
      } else {
        tooltip.style.top = `${screenPos.y}px`;
      }
    }

    const cameraPosition = camera.entity.getPosition();
    const hotspotPosition = hotspotEntity.getPosition();

    // Calculate direction from hotspot to camera
    const direction = new Vec3();
    direction.sub2(cameraPosition, hotspotPosition).normalize();

    // Set rotation to face camera
    const up = new Vec3(0, 1, 0);
    hotspotEntity.lookAt(hotspotPosition.add(direction), up);

    // Rotate 180 degrees around Y to flip the plane to face outward
    hotspotEntity.rotateLocal(0, 180, 0);

    const scale = calculateScreenSpaceScale(camera);
    hotspotEntity.setLocalScale(scale, scale, scale);

    animationFrameRef.current = requestAnimationFrame(updateAnnotation);
  }, [entity, calculateScreenSpaceScale, hideTooltip]);

  useEffect(() => {
    injectStyles();

    const tooltip = tooltipRef.current!;
    const hotspot = hotspotRef.current!;

    const camera = app.root.findComponent('camera') as CameraComponent;
    cameraRef.current = camera;

    if (!layerNormal) {
      const worldLayer = app.scene.layers.getLayerByName('World')!;
      const idx = app.scene.layers.getTransparentIndex(worldLayer);

      layerNormal = new Layer({ name: 'HotspotNormal' });
      app.scene.layers.insert(layerNormal, idx + 1);

      camera.layers = [...camera.layers, layerNormal.id];

      const textureNormal = createHotspotTexture(app, 0.9);
      materialNormal = createHotspotMaterial(textureNormal, {
        opacity: 1,
        depthTest: true,
        depthWrite: true,
      });

      mesh = Mesh.fromGeometry(app.graphicsDevice, new PlaneGeometry());
    }

    const meshInstance = new MeshInstance(mesh!, materialNormal!);
    const hotspotEntity = new Entity();
    hotspotEntity.addComponent('render', {
      layers: [layerNormal.id],
      meshInstances: [meshInstance],
    });
    entity.addChild(hotspotEntity);
    hotspotEntityRef.current = hotspotEntity;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      pointerEventsToForward.forEach((eventName) => {
        tooltip.addEventListener(eventName, pointerPassthrough as EventListener);
        hotspot.addEventListener(eventName, pointerPassthrough as EventListener);
      });
    } else {
      tooltip.addEventListener('wheel', scrollPassthrough as EventListener);
      hotspot.addEventListener('wheel', scrollPassthrough as EventListener);
    }

    const handleHotspotClick = (e: Event) => {
      e.stopPropagation();

      if (activeTooltip && activeTooltip !== tooltip) {
        hideTooltip(activeTooltip);
      }

      if (activeTooltip === tooltip) {
        hideTooltip(tooltip);
        activeTooltip = null;
      } else {
        activeTooltip = tooltip;
        if (cameraPos) {
          app.fire('annotation-focus', cameraPos, entity.getPosition());
          setTimeout(() => showTooltip(tooltip), 400);
        } else {
          showTooltip(tooltip);
        }
      }
    };

    const handleDocumentClick = (evt: MouseEvent) => {
      if (activeTooltip && !tooltip.contains(evt.target as Node)) {
        hideTooltip(activeTooltip);
        activeTooltip = null;
      }
    };

    hotspot.addEventListener('click', handleHotspotClick);
    document.addEventListener('click', handleDocumentClick);

    animationFrameRef.current = requestAnimationFrame(updateAnnotation);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      tooltip.remove();
      hotspot.remove();

      if (activeTooltip === tooltip) {
        activeTooltip = null;
      }

      if (hotspotEntity) {
        hotspotEntity.destroy();
      }

      hotspot.removeEventListener('click', handleHotspotClick);
      document.removeEventListener('click', handleDocumentClick);

      if (isMobile) {
        pointerEventsToForward.forEach((eventName) => {
          tooltip.removeEventListener(eventName, pointerPassthrough as EventListener);
          hotspot.removeEventListener(eventName, pointerPassthrough as EventListener);
        });
      } else {
        tooltip.removeEventListener('wheel', scrollPassthrough as EventListener);
        hotspot.removeEventListener('wheel', scrollPassthrough as EventListener);
      }
    };
  }, [app, entity, title, text, cameraPos, updateAnnotation, hideTooltip]);

  return (
    <>
      <div ref={tooltipRef} className='pc-annotation'>
        <div className='pc-annotation-title'>{title}</div>
        <div dangerouslySetInnerHTML={{ __html: text }} />
      </div>
      <div ref={hotspotRef} className='pc-annotation-hotspot' />
    </>
  );
};

export default AnnotationOld;
