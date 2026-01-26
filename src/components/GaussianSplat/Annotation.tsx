import React from 'react';

import { Entity } from '@playcanvas/react';
import { Script } from '@playcanvas/react/components';
import { Annotation as PcAnnotation } from 'playcanvas/scripts/esm/annotations.mjs';

import './annotation-styles.css';

interface AnnotationProps {
  position: [number, number, number];
  title: string;
  text?: string;
  label?: string | number;
}

const Annotation = (props: AnnotationProps) => {
  const { position, ...annotationProps } = props;
  // todo add camera position which happens on click

  // todo fix the offset from the top left of the screen so that the hotspots are placed correctly

  return (
    <Entity name={`annotation${props.label}`} position={position}>
      <Script script={PcAnnotation} {...annotationProps} />
    </Entity>
  );
};

export default Annotation;
