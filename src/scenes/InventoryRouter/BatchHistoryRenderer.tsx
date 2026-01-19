import React, { type JSX } from 'react';

import { useTheme } from '@mui/material';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { purposeLabel } from 'src/types/Batch';

import CellRenderer, { TableRowType } from '../../components/common/table/TableCellRenderer';
import { RendererProps } from '../../components/common/table/types';
import { BatchHistoryItemForTable } from './BatchHistory';

export const getEventType = (batchHistoryItem: BatchHistoryItemForTable) => {
  if (
    batchHistoryItem.type === 'DetailsEdited' ||
    batchHistoryItem.type === 'QuantityEdited' ||
    batchHistoryItem.type === 'StatusChanged'
  ) {
    return `${batchHistoryItem.modifiedFields.join(', ')} ${strings.CHANGE}`;
  }
  if (batchHistoryItem.type === 'IncomingWithdrawal') {
    return strings.NURSERY_TRANSFER;
  }
  if (batchHistoryItem.type === 'OutgoingWithdrawal') {
    return `${strings.WITHDRAWAL} - ${purposeLabel(batchHistoryItem.purpose)}`;
  }
  return batchHistoryItem.type;
};

export default function BatchHistoryRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const theme = useTheme();

  const { column, row, value, index, onRowClick } = props;

  const linkStyles = {
    color: theme.palette.TwClrBaseGreen500,
    fontWeight: 600,
    textDecoration: 'none',
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
          <Link fontSize='16px' onClick={rowClick} style={linkStyles}>
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
              fontSize='16px'
              to={APP_PATHS.NURSERY_WITHDRAWALS_DETAILS.replace(':withdrawalId', row.withdrawalId)}
              style={linkStyles}
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
