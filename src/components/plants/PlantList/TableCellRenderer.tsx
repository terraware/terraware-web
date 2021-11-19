import React from 'react';
import strings from 'src/strings';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';

export default function AllPlantsCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, index } = props;
  if (column.key === 'species') {
    return <CellRenderer index={index} column={column} value={row[column.key] ?? strings.OTHER} row={row} />;
  }

  return <CellRenderer {...props} />;
}
