import { TableCell, Typography } from '@material-ui/core';
import React from 'react';
import { AccessionWithdrawal } from 'src/api/types/accessions';
import strings from 'src/strings';
import CellRenderer, { CellDateRenderer } from '../../common/table/TableCellRenderer';
import { RendererProps } from '../../common/table/types';
import getDateDisplayValue from 'src/utils/date';

export default function WithdrawalCellRenderer(props: RendererProps<AccessionWithdrawal>): JSX.Element {
  const { column, value, row, index } = props;
  if (column.key === 'quantity') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={row.withdrawnQuantity ? `${row.withdrawnQuantity?.quantity} ${row.withdrawnQuantity?.units}` : 0}
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
            {getDateDisplayValue(value)}
          </Typography>
        </TableCell>
      );
    }

    return <CellDateRenderer id={id} value={value} />;
  }
  if (column.key === 'seedsRemaining') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={`${row.remainingQuantity?.quantity} ${row.remainingQuantity?.units}`}
        row={row}
      />
    );
  }

  return <CellRenderer {...props} />;
}
