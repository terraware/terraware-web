import React from 'react';

import { RenderElementProps } from 'slate-react';

export default function TextChunk(props: RenderElementProps): React.ReactElement {
  // I'm not sure what this type is for `child`, it seems to be `any` in the slate types unfortunately
  return (
    <span {...props.attributes}>
      {props.children.map((child: any, index: number) => {
        const style: React.CSSProperties = {};

        if (child?.props?.text?.bold) {
          style.fontWeight = 600;
        }

        return (
          <span key={index} style={style}>
            {child}
          </span>
        );
      })}
    </span>
  );
}
