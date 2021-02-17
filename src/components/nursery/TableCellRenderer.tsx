import React from 'react';
import { GerminationTest } from '../../api/types/tests';
import CellRenderer from '../common/table/TableCellRenderer';
import { RendererProps } from '../common/table/types';

export default function NurseryCellRenderer(
  props: RendererProps<GerminationTest>
): JSX.Element {
  const { column, row } = props;
  if (column.key === 'recordingDate' || column.key === 'seedsGerminated') {
    if (row.germinations) {
      return (
        <CellRenderer
          column={column}
          value={row.germinations[0][column.key]}
          row={row}
        />
      );
    }
  }
  return <CellRenderer {...props} />;
}
