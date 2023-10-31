import React from 'react';
import { makeStyles } from '@mui/styles';
import { Box, Typography } from '@mui/material';
import { APP_PATHS } from 'src/constants';
import { RendererProps, TableRowType } from '@terraware/web-components';
import { Textfield } from '@terraware/web-components';
import Link from 'src/components/common/Link';
import CellRenderer from 'src/components/common/table/TableCellRenderer';
import { useNumberFormatter } from 'src/utils/useNumber';
import { useUser } from 'src/providers';

const useStyles = makeStyles(() => ({
  text: {
    fontSize: '14px',
    '& > p': {
      fontSize: '14px',
      overflow: 'visible',
    },
  },
  input: {
    maxWidth: '108px',

    '& label': {
      whiteSpace: 'break-spaces',
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
        <Box display='flex' alignItems={row.error[id] ? 'start' : 'center'}>
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

  const createReadyOutplantInput = (iValue: React.ReactNode | unknown[]) => {
    if (onRowClick) {
      return (
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
        value={numberFormatter.format(+row.readyQuantityWithdrawn + +row.notReadyQuantityWithdrawn)}
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
