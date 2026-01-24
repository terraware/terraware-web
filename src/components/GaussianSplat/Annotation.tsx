import React, { useCallback } from 'react';

import { Entity } from '@playcanvas/react';
import { Script } from '@playcanvas/react/components';
import { Annotation as PcAnnotation } from 'playcanvas/scripts/esm/annotations.mjs';

import { useCameraPosition } from 'src/hooks/useCameraPosition';

import './annotation-styles.css';

interface AnnotationProps {
  position: [number, number, number];
  title: string;
  text?: string;
  label?: string | number;
  cameraPosition?: [number, number, number];
}

/**
 * A 3D annotation component that displays a hotspot and tooltip in the scene.
 * When clicked, the camera will move to look at the annotation.
 *
 * @param props.position - The world position of the annotation
 * @param props.title - The title displayed in the tooltip
 * @param props.text - Optional description text displayed in the tooltip
 * @param props.label - Optional label displayed on the hotspot
 * @param props.cameraPosition - Optional camera position to move to when clicked. If undefined, camera stays at current position
 */
const Annotation = (props: AnnotationProps) => {
  const { position, cameraPosition, ...annotationProps } = props;
  const { setCamera } = useCameraPosition();

  const handleClick = useCallback(() => {
    setCamera(position, cameraPosition);
  }, [position, cameraPosition, setCamera]);

  return (
    <Entity name={`annotation${props.label}`} position={position}>
      <Script script={PcAnnotation} {...annotationProps} onClickCallback={handleClick} />
    </Entity>
  );
};

export default Annotation;
