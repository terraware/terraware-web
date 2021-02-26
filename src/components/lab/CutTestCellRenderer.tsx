import React from 'react';
import CellRenderer, { TableRowType } from '../common/table/TableCellRenderer';
import { RendererProps } from '../common/table/types';

export default function cellRenderer(
  props: RendererProps<TableRowType>
): JSX.Element {
  const { column, row, index } = props;
  if (
    typeof row['compromisedSeeds'] === 'number' &&
    typeof row['emptySeeds'] === 'number' &&
    typeof row['filledSeeds'] === 'number'
  ) {
    if (
      column.key === 'compromisedSeeds' ||
      column.key === 'emptySeeds' ||
      column.key === 'filledSeeds'
    ) {
      const total =
        row['compromisedSeeds'] + row['emptySeeds'] + row['filledSeeds'];
      return (
        <CellRenderer
          index={index}
          column={column}
          value={`${row[column.key]} (${Math.round(
            (row[column.key] / total) * 100
          )}%)`}
          row={row}
        />
      );
    }
    return <CellRenderer {...props} />;
  }
  return <CellRenderer {...props} />;
}
