import React from 'react';
import CellRenderer, { TableRowType } from '../common/table/TableCellRenderer';
import { RendererProps } from '../common/table/types';

export default function LabCellRenderer(
  props: RendererProps<TableRowType>
): JSX.Element {
  const { column, row, index } = props;
  if (column.key === 'seedsGerminated') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={`${row[column.key]} seeds germinated`}
        row={row}
      />
    );
  }
  return <CellRenderer {...props} />;
}
