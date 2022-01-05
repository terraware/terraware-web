import React from 'react';
import CellRenderer, { TableRowType } from '../common/table/TableCellRenderer';
import { RendererProps } from '../common/table/types';

export default function ProjectsCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, value, index } = props;
  if (column.key === 'types' && Array.isArray(value)) {
    return <CellRenderer index={index} column={column} value={value.join(', ')} row={row} />;
  }

  return <CellRenderer {...props} />;
}
