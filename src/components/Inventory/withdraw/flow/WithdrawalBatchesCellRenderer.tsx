import React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { Box, Typography, useTheme } from '@mui/material';
import { APP_PATHS } from 'src/constants';
import { CellRenderer, RendererProps, TableRowType } from '@terraware/web-components';
import TextField from '@terraware/web-components/components/Textfield/Textfield';

const useStyles = makeStyles(() => ({
  text: {
    fontSize: '14px',
    '& > p': {
      fontSize: '14px',
    },
  },
}));

export default function WithdrawalBatchesCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const classes = useStyles();
  const theme = useTheme();
  const { column, row, value, index, onRowClick } = props;

  const createLinkToBatchDetail = (iValue: React.ReactNode | unknown[]) => {
    return (
      <Link
        to={`${APP_PATHS.INVENTORY_ITEM.replace(':speciesId', row.speciesId.toString())}?batch=${iValue}`}
        style={{ color: theme.palette.TwClrTxtBrand }}
        className={classes.text}
      >
        {iValue}
      </Link>
    );
  };

  const createNotReadyInput = (iValue: React.ReactNode | unknown[]) => {
    if (onRowClick) {
      return (
        <Box display='flex' alignItems='center'>
          <TextField
            id='notReadyQuantityWithdrawn'
            type='text'
            onChange={(id, value) => onRowClick(value as string)}
            value={row.notReadyQuantityWithdrawn}
            label={''}
          />
          <Typography paddingLeft={1}>/ {row.notReadyQuantity} </Typography>
        </Box>
      );
    }
  };

  const createReadyInput = (iValue: React.ReactNode | unknown[]) => {
    if (onRowClick) {
      return (
        <Box display='flex' alignItems='center'>
          <TextField
            id='readyQuantityWithdrawn'
            type='text'
            onChange={(id, value) => onRowClick(value as string)}
            value={row.readyQuantityWithdrawn}
            label={''}
          />
          <Typography paddingLeft={1}>/ {row.readyQuantity} </Typography>
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
        className={classes.text}
      />
    );
  }

  if (column.key === 'readyQuantityWithdrawn') {
    return (
      <CellRenderer index={index} column={column} value={createReadyInput(value)} row={row} className={classes.text} />
    );
  }

  if (column.key === 'notReadyQuantityWithdrawn') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={createNotReadyInput(value)}
        row={row}
        className={classes.text}
      />
    );
  }

  if (column.key === 'totalQuantity') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={+row.readyQuantity + +row.notReadyQuantity}
        row={row}
        className={classes.text}
      />
    );
  }

  if (column.key === 'totalWithdraw') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={+row.readyQuantityWithdrawn + +row.notReadyQuantityWithdrawn}
        row={row}
        className={classes.text}
      />
    );
  }

  return <CellRenderer {...props} className={classes.text} />;
}
