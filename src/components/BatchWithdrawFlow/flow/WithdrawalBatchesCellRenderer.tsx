import React, { type JSX } from 'react';

import { Box, Typography } from '@mui/material';
import { RendererProps, TableRowType, Textfield } from '@terraware/web-components';

import Link from 'src/components/common/Link';
import CellRenderer from 'src/components/common/table/TableCellRenderer';
import { APP_PATHS } from 'src/constants';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

export default function WithdrawalBatchesCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const numberFormatter = useNumberFormatter();
  const { column, row, value, index, onRowClick } = props;

  const inputStyles = {
    maxWidth: '108px',
    '& label': {
      whiteSpace: 'break-spaces',
      textAlign: 'left',
    },
  };

  const textStyles = {
    fontSize: '16px',
    '& > p': {
      fontSize: '16px',
      overflow: 'visible',
    },
  };

  const cellStyles = {
    '&.MuiTableCell-root': {
      height: '76px',
    },
  };

  const createLinkToBatchDetail = (iValue: React.ReactNode | unknown[]) => {
    return (
      <Link
        fontSize='16px'
        to={`${APP_PATHS.INVENTORY_ITEM_FOR_SPECIES.replace(':speciesId', row.speciesId.toString())}?batch=${iValue as string}`}
        target='_blank'
      >
        {iValue as React.ReactNode}
      </Link>
    );
  };

  const createQuantityInput = (id: string, valueProperty: string) => {
    if (onRowClick) {
      return (
        <Box display='flex' alignItems={row.error[id] ? 'start' : 'center'} justifyContent='end'>
          <Textfield
            id={id}
            type='number'
            onChange={(newValue) => onRowClick(newValue as string)}
            value={row[id]}
            label={''}
            errorText={row.error[id]}
            sx={inputStyles}
            min={0}
          />
          <Typography paddingLeft={1} paddingTop={row.error[id] ? '10px' : 0}>
            / {row[valueProperty]}
          </Typography>
        </Box>
      );
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const createReadyOutplantInput = (iValue: React.ReactNode | unknown[]) => {
    if (onRowClick) {
      return (
        <Box display='flex' alignItems={row.error.readyQuantityWithdrawn ? 'start' : 'center'} justifyContent='end'>
          <Textfield
            id='readyQuantityWithdrawn'
            type='number'
            onChange={(newValue) => onRowClick(newValue as string)}
            value={row.readyQuantityWithdrawn}
            label={''}
            errorText={row.error.readyQuantityWithdrawn}
            sx={inputStyles}
            min={0}
          />
        </Box>
      );
    }
  };

  if (column.key === 'batchNumber') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={createLinkToBatchDetail(value)}
        row={row}
        sx={[textStyles, cellStyles]}
      />
    );
  }

  if (column.key === 'germinatingQuantityWithdrawn') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={createQuantityInput('germinatingQuantityWithdrawn', 'germinatingQuantity')}
        row={row}
        sx={[textStyles, cellStyles]}
      />
    );
  }

  if (column.key === 'readyQuantityWithdrawn') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={createQuantityInput('readyQuantityWithdrawn', 'readyQuantity')}
        row={row}
        sx={[textStyles, cellStyles]}
      />
    );
  }

  if (column.key === 'activeGrowthQuantityWithdrawn') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={createQuantityInput('activeGrowthQuantityWithdrawn', 'activeGrowthQuantity')}
        row={row}
        sx={[textStyles, cellStyles]}
      />
    );
  }

  if (column.key === 'hardeningOffQuantityWithdrawn') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={createQuantityInput('hardeningOffQuantityWithdrawn', 'hardeningOffQuantity')}
        row={row}
        sx={[textStyles, cellStyles]}
      />
    );
  }

  if (column.key === 'totalQuantity') {
    return <CellRenderer index={index} column={column} row={row} value={row.totalQuantity} sx={textStyles} />;
  }

  if (column.key === 'totalWithdraw') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={numberFormatter.format(
          +row.readyQuantityWithdrawn +
            +row.activeGrowthQuantityWithdrawn +
            +row.hardeningOffQuantityWithdrawn +
            +row.germinatingQuantityWithdrawn
        )}
        row={row}
        sx={textStyles}
      />
    );
  }

  if (column.key === 'outplantReadyQuantityWithdrawn') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={createReadyOutplantInput(value)}
        row={row}
        sx={[textStyles, cellStyles]}
      />
    );
  }

  return <CellRenderer {...props} sx={textStyles} />;
}
