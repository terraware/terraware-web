import React from 'react';

import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';

export default function EventsCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, index, value } = props;

  if (column.key === 'projects') {
    const valueToRender = Array.isArray(value) ? value.join(',') : value;
    return <CellRenderer index={index} column={column} value={valueToRender} row={row} />;
  }

  return <CellRenderer {...props} />;
}
