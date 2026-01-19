import React from 'react';

import { RenderElementProps } from 'slate-react';

export default function TextChunk(props: RenderElementProps): React.ReactElement<any> {
  return <span {...props.attributes}>{props.children}</span>;
}
