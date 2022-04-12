import React from 'react';
import CellRenderer, { TableRowType } from '../common/table/TableCellRenderer';
import { RendererProps } from '../common/table/types';

export default function AccountCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, value, index } = props;
  if (column.key === 'projects' && Array.isArray(value)) {
    return <CellRenderer index={index} column={column} value={value.length} row={row} />;
  }

  return <CellRenderer {...props} />;
}
