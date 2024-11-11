import React from 'react';

import { RenderElementProps } from 'slate-react';

export default function TextChunk(props: RenderElementProps): React.ReactElement {
  console.log(props.children);
  // I'm not sure what this type is, it seems to be `any` in the slate types unfortunately
  return props.children.map((child: any, index: number) => {
    const style: React.CSSProperties = {};

    if (child?.props?.text?.bold) {
      style.fontWeight = 600;
    }

    return (
      <span {...props.attributes} key={index} style={style}>
        {child}
      </span>
    );
  });
}
