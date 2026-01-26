import React, { useCallback, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Entity } from '@playcanvas/react';
import { Script } from '@playcanvas/react/components';
import { Annotation as PcAnnotation } from 'playcanvas/scripts/esm/annotations.mjs';

import { useCameraPosition } from 'src/hooks/useCameraPosition';

import './annotation-styles.css';

interface AnnotationProps {
  position: [number, number, number];
  title: string;
  text?: string | React.ReactNode;
  label?: string | number;
  cameraPosition?: [number, number, number];
}

/**
 * A 3D annotation component that displays a hotspot in the scene.
 * When clicked, displays annotation text and moves the camera.
 *
 * @param props.position - The world position of the annotation
 * @param props.title - The title displayed in the annotation
 * @param props.text - Optional description (string or React component) displayed in the annotation
 * @param props.label - Optional label displayed on the hotspot
 * @param props.cameraPosition - Optional camera position to move to when clicked. If undefined, camera stays at current position
 */
const Annotation = (props: AnnotationProps) => {
  const { position, cameraPosition, text, ...annotationProps } = props;
  const { setCamera } = useCameraPosition();
  const [textContainer, setTextContainer] = useState<HTMLElement | null>(null);
  const textContentRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(() => {
    setCamera(position, cameraPosition);
  }, [position, cameraPosition, setCamera]);

  const handleSetTextContainer = useCallback((container: HTMLElement) => {
    setTextContainer(container);
  }, []);

  const isReactContent = useMemo(() => text !== undefined && typeof text !== 'string', [text]);
  const textProp = useMemo(() => (isReactContent ? undefined : text), [isReactContent, text]);

  return (
    <>
      <Entity name={`annotation${props.label}`} position={position}>
        <Script
          script={PcAnnotation}
          {...annotationProps}
          text={textProp}
          onClickCallback={handleClick}
          textContentRef={isReactContent ? textContentRef : undefined}
          setTextContainer={isReactContent ? handleSetTextContainer : undefined}
        />
      </Entity>
      {/* Hidden container for React text content */}
      {isReactContent && (
        <div ref={textContentRef} style={{ display: 'none' }} data-react-text-content='true'>
          {text}
        </div>
      )}
      {/* Portal the React content into the annotation text DOM when available */}
      {isReactContent && textContainer && createPortal(text, textContainer)}
    </>
  );
};

export default Annotation;
