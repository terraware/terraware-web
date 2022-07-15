import { TableCell, Typography } from '@material-ui/core';
import React from 'react';
import { ViabilityTest } from 'src/api/types/tests';
import strings from 'src/strings';
import CellRenderer, { CellDateRenderer } from '../../common/table/TableCellRenderer';
import { RendererProps } from '../../common/table/types';
import getDateDisplayValue from 'src/utils/date';

export default function NurseryCellRenderer(props: RendererProps<ViabilityTest>): JSX.Element {
  const { column, row, value, index } = props;
  if (column.key === 'recordingDate') {
    if (row.testResults) {
      return <CellRenderer index={index} column={column} value={row.testResults[0][column.key]} row={row} />;
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
  if (column.key === 'seedsGerminated') {
    if (row.testResults) {
      return <CellRenderer index={index} column={column} value={`${row.testResults[0][column.key]} Seeds`} row={row} />;
    }
  }
  if (column.key === 'seedsSown') {
    const valueStr = value ? `${value} Seeds` : '';
    return <CellRenderer index={index} column={column} value={valueStr} row={row} />;
  }
  if (column.key === 'viability') {
    const id = `row${index}-${column.key}`;
    if (row.testResults && row.testResults[0].seedsGerminated && row.seedsSown) {
      return (
        <TableCell id={id} align='left'>
          <Typography component='p' variant='body1'>
            {`${((row.testResults[0].seedsGerminated / row.seedsSown) * 100).toFixed(1)}%`}
          </Typography>
          <Typography component='p' variant='body2' color='textSecondary'>
            {strings.AUTOCALCULATED.toLowerCase()}
          </Typography>
        </TableCell>
      );
    }
  }

  return <CellRenderer {...props} />;
}
