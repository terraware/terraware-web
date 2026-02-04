import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { Entity } from '@playcanvas/react';
import { Script } from '@playcanvas/react/components';
import { useApp } from '@playcanvas/react/hooks';
import { Gizmo, Entity as PcEntity, TranslateGizmo } from 'playcanvas';
import { Annotation as PcAnnotation } from 'playcanvas/scripts/esm/annotations.mjs';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';

import { useCameraPosition } from 'src/hooks/useCameraPosition';

import './annotation-styles.css';

export interface AnnotationProps {
  position: [number, number, number];
  title: string;
  bodyText?: string;
  label?: string;
  cameraPosition?: [number, number, number];
  visible?: boolean;
  isEdit?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onPositionChange?: (position: [number, number, number]) => void;
}

/**
 * A 3D annotation component that displays a hotspot in the scene.
 * When clicked, displays annotation text and moves the camera.
 * In edit mode, shows a translate gizmo when selected.
 *
 * @param props.position - The world position of the annotation
 * @param props.index - The index of the annotation, used as a unique identifier
 * @param props.title - The title displayed in the annotation
 * @param props.bodyText - Optional description displayed in the annotation
 * @param props.label - Optional label displayed on the hotspot
 * @param props.cameraPosition - Optional camera position to move to when clicked. If undefined, camera stays at current position
 * @param props.visible - Optional flag to show/hide the annotation. Defaults to true
 * @param props.isEdit - Optional flag for edit mode. Defaults to false
 * @param props.isSelected - Optional flag indicating if this annotation is selected. Defaults to false
 * @param props.onSelect - Optional callback when annotation is clicked in edit mode
 * @param props.onPositionChange - Optional callback when annotation position changes
 */
const Annotation = (props: AnnotationProps & { index: number }) => {
  const {
    position,
    cameraPosition,
    bodyText,
    visible = true,
    isEdit = false,
    isSelected = false,
    onSelect,
    onPositionChange,
    index,
    ...annotationProps
  } = props;
  const app = useApp();
  const { setCamera } = useCameraPosition();
  const gizmoRef = useRef<TranslateGizmo | null>(null);
  const layerRef = useRef<any>(null);

  // Use refs to always call the latest callback values
  const isEditRef = useRef(isEdit);
  const onSelectRef = useRef(onSelect);
  const positionRef = useRef(position);
  const cameraPositionRef = useRef(cameraPosition);

  useEffect(() => {
    isEditRef.current = isEdit;
    onSelectRef.current = onSelect;
    positionRef.current = position;
    cameraPositionRef.current = cameraPosition;
  }, [isEdit, onSelect, position, cameraPosition]);

  // Create a stable callback that reads from refs, because this is read from TfAnnotationManager when the annotation is added to the scene
  const handleClick = useCallback(() => {
    if (isEditRef.current) {
      onSelectRef.current?.();
    } else {
      setCamera(positionRef.current, cameraPositionRef.current);
    }
  }, [setCamera]);

  const entityName = useMemo(() => `annotation-${index}`, [index]);

  useEffect(() => {
    const shouldShowGizmo = isEdit && isSelected && visible;

    const cleanupGizmo = () => {
      if (gizmoRef.current) {
        try {
          gizmoRef.current.detach();
          gizmoRef.current.destroy();
        } catch (error) {
          // Ignore cleanup errors
        }
        gizmoRef.current = null;
      }

      if (layerRef.current && app.scene?.layers) {
        try {
          const layer = app.scene.layers.getLayerByName('Gizmo');
          if (layer) {
            app.scene.layers.remove(layerRef.current);
          }
        } catch (error) {
          // Ignore cleanup errors
        }
        layerRef.current = null;
      }
    };

    if (!shouldShowGizmo) {
      cleanupGizmo();
      return;
    }

    const setupGizmo = () => {
      const annotationEntity = app.root.findByName(entityName) as PcEntity | null;
      const cameraEntity = app.root.findByName('camera') as PcEntity | null;
      const cameraComponent = cameraEntity?.camera;
      const cameraControls = cameraEntity?.script?.get(CameraControls.scriptName) as any;

      if (!annotationEntity || !cameraComponent) {
        return false;
      }

      if (!gizmoRef.current) {
        if (!layerRef.current) {
          layerRef.current = Gizmo.createLayer(app);
        }

        const gizmo = new TranslateGizmo(cameraComponent, layerRef.current);
        gizmo.size = 0.75;
        gizmo.snapIncrement = 0.01;
        gizmo.coordSpace = 'world';

        gizmo.on('transform:start', () => {
          if (cameraControls) {
            cameraControls.enabled = false;
          }
        });

        gizmo.on('transform:end', () => {
          if (cameraControls) {
            cameraControls.enabled = true;
          }

          if (onPositionChange) {
            const pos = annotationEntity.getPosition();
            onPositionChange([pos.x, pos.y, pos.z]);
          }
        });

        gizmo.attach([annotationEntity]);
        gizmoRef.current = gizmo;
      }

      return true;
    };

    const intervalId = setInterval(() => {
      if (setupGizmo()) {
        clearInterval(intervalId);
      }
    }, 100);

    return () => {
      clearInterval(intervalId);
      cleanupGizmo();
    };
  }, [app, isEdit, isSelected, visible, onPositionChange, entityName]);

  return (
    <>
      <Entity name={entityName} position={position}>
        <Script
          script={PcAnnotation}
          {...annotationProps}
          text={bodyText}
          visible={visible}
          onClickCallback={handleClick}
        />
      </Entity>
    </>
  );
};

export default Annotation;
