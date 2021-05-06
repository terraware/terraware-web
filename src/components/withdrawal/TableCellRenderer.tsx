import { TableCell, Typography } from '@material-ui/core';
import moment from 'moment';
import React from 'react';
import { AccessionWithdrawal } from '../../api/types/accessions';
import strings from '../../strings';
import CellRenderer, {
  CellDateRenderer,
} from '../common/table/TableCellRenderer';
import { RendererProps } from '../common/table/types';

export default function WithdrawalCellRenderer(
  props: RendererProps<AccessionWithdrawal>
): JSX.Element {
  const { column, value, row, index } = props;
  if (column.key === 'quantity') {
    if (row.gramsWithdrawn) {
      return (
        <CellRenderer
          index={index}
          column={column}
          value={`${row.gramsWithdrawn}g`}
          row={row}
        />
      );
    } else if (row.seedsWithdrawn) {
      return (
        <CellRenderer
          index={index}
          column={column}
          value={`${row.seedsWithdrawn} seeds`}
          row={row}
        />
      );
    } else {
      return (
        <CellRenderer index={index} column={column} value={''} row={row} />
      );
    }
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
