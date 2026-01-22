import React, { type JSX } from 'react';

import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';

export default function SystemMetricsRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, index } = props;

  if (column.key === 'name') {
    return <CellRenderer column={column} value={row.metric} row={row} index={index} />;
  }

  return <CellRenderer {...props} />;
}
