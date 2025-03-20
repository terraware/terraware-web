import React from 'react';

import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';

export default function ReportsTargetsCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, value, index } = props;

  if (column.key === 'name') {
    return <CellRenderer column={column} value={value} row={row} index={index} />;
  }

  return <CellRenderer {...props} />;
}
