import React from 'react';
import { Badge } from '@terraware/web-components';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';

export default function DeliverableCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, index } = props;

  if (column.key === 'status') {
    // TODO convert BE label value to locale specific string
    return <CellRenderer index={index} column={column} value={<Badge label={column.key} />} row={row} />;
  }

  return <CellRenderer {...props} />;
}
