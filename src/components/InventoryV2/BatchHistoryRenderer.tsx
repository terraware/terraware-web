import React from 'react';
import { makeStyles } from '@mui/styles';
import CellRenderer, { TableRowType } from '../common/table/TableCellRenderer';
import { RendererProps } from '../common/table/types';
import { Theme } from '@mui/material';
import Link from 'src/components/common/Link';
import { getDateDisplayValue } from '@terraware/web-components/utils';
import strings from 'src/strings';
import { BatchHistoryItemForTable } from './BatchHistory';
import { APP_PATHS } from 'src/constants';

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    color: theme.palette.TwClrBaseGreen500,
    fontWeight: 600,
    textDecoration: 'none',
  },
  text: {
    fontSize: '14px',
  },
}));

export const getEventType = (batchHistoryItem: BatchHistoryItemForTable) => {
  if (batchHistoryItem.type === 'DetailsEdited' || batchHistoryItem.type === 'QuantityEdited') {
    return `${batchHistoryItem.modifiedFields.join(', ')} ${strings.CHANGE}`;
  }
  if (batchHistoryItem.type === 'IncomingWithdrawal') {
    return strings.NURSERY_TRANSFER;
  }
  if (batchHistoryItem.type === 'OutgoingWithdrawal') {
    return `${strings.WITHDRAWAL} - ${batchHistoryItem.purpose}`;
  }
  return batchHistoryItem.type;
};

export default function BatchHistoryRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const classes = useStyles();

  const { column, row, value, index, onRowClick } = props;

  const rowClick = (event?: React.SyntheticEvent) => {
    if (onRowClick) {
      onRowClick();
    }
  };

  if (column.key === 'createdTime' && onRowClick && typeof value === 'string') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={
          <Link onClick={rowClick} className={classes.link}>
            {getDateDisplayValue(value)}
          </Link>
        }
        row={row}
      />
    );
  }

  if (column.key === 'type') {
    if (row.type === 'OutgoingWithdrawal') {
      return (
        <CellRenderer
          index={index}
          column={column}
          value={
            <Link
              to={APP_PATHS.NURSERY_WITHDRAWALS_DETAILS.replace(':withdrawalId', row.withdrawalId)}
              className={classes.link}
            >
              {getEventType(row as BatchHistoryItemForTable)}
            </Link>
          }
          row={row}
        />
      );
    }
    return (
      <CellRenderer index={index} column={column} value={getEventType(row as BatchHistoryItemForTable)} row={row} />
    );
  }

  return <CellRenderer {...props} />;
}
