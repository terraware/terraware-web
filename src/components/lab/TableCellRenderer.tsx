import { TableCell, Typography } from '@material-ui/core';
import moment from 'moment';
import React from 'react';
import strings from '../../strings';
import CellRenderer, {
  CellDateRenderer,
  TableRowType,
} from '../common/table/TableCellRenderer';
import { RendererProps } from '../common/table/types';

export default function LabCellRenderer(
  props: RendererProps<TableRowType>
): JSX.Element {
  const { column, row, value, index } = props;
  if (column.key === 'seedsGerminated') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={`${row[column.key]} ${strings.SEEDS_GERMINATED_LC}`}
        row={row}
      />
    );
  }
  if (column.type === 'date' && typeof value === 'string' && value) {
    const id = `row${index}-${column.key}`;
    const date = new Date(value);
    if (date > new Date()) {
      return (
        <TableCell id={id} align='left'>
          <Typography component='p' variant='body1'>
            {strings.SCHEDULED_FOR}
          </Typography>
          <Typography component='p' variant='body1'>
            {moment(value).format('L')}
          </Typography>
        </TableCell>
      );
    }
    return <CellDateRenderer id={id} value={value} />;
  }
  return <CellRenderer {...props} />;
}
