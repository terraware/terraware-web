import React, { useCallback, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Entity } from '@playcanvas/react';
import { Script } from '@playcanvas/react/components';
import { Annotation as PcAnnotation } from 'playcanvas/scripts/esm/annotations.mjs';

import { useCameraPosition } from 'src/hooks/useCameraPosition';

import './annotation-styles.css';

export interface AnnotationProps {
  position: [number, number, number];
  title: string;
  bodyText?: string | React.ReactNode;
  label?: string | number;
  cameraPosition?: [number, number, number];
  visible?: boolean;
}

/**
 * A 3D annotation component that displays a hotspot in the scene.
 * When clicked, displays annotation text and moves the camera.
 *
 * @param props.position - The world position of the annotation
 * @param props.title - The title displayed in the annotation
 * @param props.bodyText - Optional description (string or React component) displayed in the annotation
 * @param props.label - Optional label displayed on the hotspot
 * @param props.cameraPosition - Optional camera position to move to when clicked. If undefined, camera stays at current position
 * @param props.visible - Optional flag to show/hide the annotation. Defaults to true
 */
const Annotation = (props: AnnotationProps) => {
  const { position, cameraPosition, bodyText, visible = true, ...annotationProps } = props;
  const { setCamera } = useCameraPosition();
  const [textContainer, setTextContainer] = useState<HTMLElement | null>(null);
  const textContentRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(() => {
    setCamera(position, cameraPosition);
  }, [position, cameraPosition, setCamera]);

  const handleSetTextContainer = useCallback((container: HTMLElement) => {
    setTextContainer(container);
  }, []);

  const isReactContent = useMemo(() => bodyText !== undefined && typeof bodyText !== 'string', [bodyText]);
  const textProp = useMemo(() => (isReactContent ? undefined : bodyText), [isReactContent, bodyText]);

  return (
    <>
      <Entity name={`annotation${props.label}`} position={position}>
        <Script
          script={PcAnnotation}
          {...annotationProps}
          text={textProp}
          visible={visible}
          onClickCallback={handleClick}
          textContentRef={isReactContent ? textContentRef : undefined}
          setTextContainer={isReactContent ? handleSetTextContainer : undefined}
        />
      </Entity>
      {/* Hidden container for React text content */}
      {isReactContent && (
        <div ref={textContentRef} style={{ display: 'none' }} data-react-text-content='true'>
          {bodyText}
        </div>
      )}
      {/* Portal the React content into the annotation text DOM when available */}
      {isReactContent && textContainer && createPortal(bodyText, textContainer)}
    </>
  );
};

export default Annotation;
