import React from 'react';

import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';

export default function PlantMonitoringRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const textStyles = {
    fontSize: '16px',
    '& > p': {
      fontSize: '16px',
    },
  };

  return <CellRenderer {...props} sx={textStyles} />;
}
