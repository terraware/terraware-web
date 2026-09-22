import React, { type JSX } from 'react';

import { Typography, useTheme } from '@mui/material';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { purposeLabel } from 'src/types/Batch';

import CellRenderer, { TableRowType } from '../../components/common/table/TableCellRenderer';
import { RendererProps } from '../../components/common/table/types';
import { BatchHistoryItemForTable } from './BatchHistory';

const accessionAttributionOf = (
  item: BatchHistoryItemForTable
): { id: number; accessionNumber: string } | undefined => {
  if (item.type === 'AddedFromAccession') {
    return { id: item.accessionId, accessionNumber: item.accessionNumber };
  }
  if (item.fromAccessionId !== undefined) {
    return { id: item.fromAccessionId, accessionNumber: item.fromAccessionNumber ?? '' };
  }
  return undefined;
};

export const getEventType = (batchHistoryItem: BatchHistoryItemForTable) => {
  const accession = accessionAttributionOf(batchHistoryItem);
  if (accession) {
    return strings.formatString(strings.BATCH_QUANTITY_UPDATED_FROM_ACCESSION, accession.accessionNumber).toString();
  }
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

const EventTypeCell = ({ row }: { row: BatchHistoryItemForTable }): JSX.Element => {
  const notes = row.type === 'QuantityEdited' ? row.notes : undefined;

  const accession = accessionAttributionOf(row);
  if (accession) {
    return (
      <>
        {strings.formatString(
          strings.BATCH_QUANTITY_UPDATED_FROM_ACCESSION,
          <Link fontSize='16px' to={APP_PATHS.ACCESSIONS2_ITEM.replace(':accessionId', `${accession.id}`)}>
            {accession.accessionNumber}
          </Link>
        )}
      </>
    );
  }

  return (
    <>
      {getEventType(row)}
      {notes && (
        <Typography fontSize='14px' fontWeight={300}>
          {notes}
        </Typography>
      )}
    </>
  );
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
    const eventCellSx = { width: '100%', maxWidth: 0, '& > .MuiTypography-root': { maxWidth: '100%' } };
    if (row.type === 'OutgoingWithdrawal') {
      return (
        <CellRenderer
          index={index}
          column={column}
          sx={eventCellSx}
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
      <CellRenderer
        index={index}
        column={column}
        sx={eventCellSx}
        value={<EventTypeCell row={row as BatchHistoryItemForTable} />}
        row={row}
      />
    );
  }

  return <CellRenderer {...props} />;
}
