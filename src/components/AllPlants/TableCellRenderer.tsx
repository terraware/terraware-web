import { TableCell } from '@material-ui/core';
import React from 'react';
import strings from '../../strings';
import CellRenderer, { TableRowType } from '../common/table/TableCellRenderer';
import { RendererProps } from '../common/table/types';

export default function AllPlantsCellRenderer(
  props: RendererProps<TableRowType>
): JSX.Element {
  const { column, row, index } = props;
  const id = `row${index}-${column.key}`;
  if (column.key === 'photo') {
    return (
      <TableCell id={id} align='left'>
        <img
          alt='Plant'
          src={row[column.key]}
          style={{ maxHeight: '24px', display: 'block' }}
          id='feature-image'
        />
      </TableCell>
    );
  }
  if (column.key === 'species') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={row[column.key] ?? strings.OTHER}
        row={row}
      />
    );
  }

  return <CellRenderer {...props} />;
}
