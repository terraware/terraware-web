import React from 'react';

import { RenderElementProps } from 'slate-react';

export default function TextChunk(props: RenderElementProps): React.ReactElement {
  return <span {...props.attributes}>{props.children}</span>;
}
