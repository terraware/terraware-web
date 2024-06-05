import React from 'react';

import { Box, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { RendererProps, TableRowType } from '@terraware/web-components';
import { Textfield } from '@terraware/web-components';

import Link from 'src/components/common/Link';
import CellRenderer from 'src/components/common/table/TableCellRenderer';
import { APP_PATHS } from 'src/constants';
import { useUser } from 'src/providers';
import { useNumberFormatter } from 'src/utils/useNumber';

const useStyles = makeStyles(() => ({
  quantityContainer: {
    '& .textfield .textfield-value input': {
      textAlign: 'right',
    },
  },
  text: {
    fontSize: '16px',
    '& > p': {
      fontSize: '16px',
      overflow: 'visible',
    },
  },
  input: {
    maxWidth: '108px',

    '& label': {
      whiteSpace: 'break-spaces',
      textAlign: 'left',
    },
  },
  cell: {
    '&.MuiTableCell-root': {
      height: '76px',
    },
  },
}));

export default function WithdrawalBatchesCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const classes = useStyles();
  const { user } = useUser();
  const numberFormatter = useNumberFormatter()(user?.locale);
  const { column, row, value, index, onRowClick } = props;

  const createLinkToBatchDetail = (iValue: React.ReactNode | unknown[]) => {
    return (
      <Link
        fontSize='16px'
        to={`${APP_PATHS.INVENTORY_ITEM_FOR_SPECIES.replace(':speciesId', row.speciesId.toString())}?batch=${iValue}`}
        target='_blank'
      >
        {iValue as React.ReactNode}
      </Link>
    );
  };

  const createQuantityInput = (id: string, valueProperty: string) => {
    if (onRowClick) {
      return (
        <Box
          display='flex'
          alignItems={row.error[id] ? 'start' : 'center'}
          justifyContent='end'
          className={classes.quantityContainer}
        >
          <Textfield
            id={id}
            type='number'
            onChange={(newValue) => onRowClick(newValue as string)}
            value={row[id]}
            label={''}
            errorText={row.error[id]}
            className={classes.input}
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
        <Box
          display='flex'
          alignItems={row.error.readyQuantityWithdrawn ? 'start' : 'center'}
          justifyContent='end'
          className={classes.quantityContainer}
        >
          <Textfield
            id='readyQuantityWithdrawn'
            type='number'
            onChange={(newValue) => onRowClick(newValue as string)}
            value={row.readyQuantityWithdrawn}
            label={''}
            errorText={row.error.readyQuantityWithdrawn}
            className={classes.input}
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
        className={`${classes.text} ${classes.cell}`}
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
        className={`${classes.text} ${classes.cell}`}
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
        className={`${classes.text} ${classes.cell}`}
      />
    );
  }

  if (column.key === 'notReadyQuantityWithdrawn') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={createQuantityInput('notReadyQuantityWithdrawn', 'notReadyQuantity')}
        row={row}
        className={`${classes.text} ${classes.cell}`}
      />
    );
  }

  if (column.key === 'totalQuantity') {
    return <CellRenderer index={index} column={column} row={row} value={row.totalQuantity} className={classes.text} />;
  }

  if (column.key === 'totalWithdraw') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={numberFormatter.format(
          +row.readyQuantityWithdrawn + +row.notReadyQuantityWithdrawn + +row.germinatingQuantityWithdrawn
        )}
        row={row}
        className={classes.text}
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
        className={`${classes.text} ${classes.cell}`}
      />
    );
  }

  return <CellRenderer {...props} className={classes.text} />;
}
