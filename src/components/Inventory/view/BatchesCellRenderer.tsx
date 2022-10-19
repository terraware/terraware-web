import { makeStyles } from '@mui/styles';
import React from 'react';
import { Link, Typography } from '@mui/material';
import { Button } from '@terraware/web-components';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import strings from 'src/strings';

const useStyles = makeStyles(() => ({
  link: {
    color: '#0067C8',
  },
  text: {
    fontSize: '14px',
  },
}));

export default function BatchesCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const classes = useStyles();
  const { column, row, value, index } = props;
  const editable = (column as any).editable;

  const withdraw = () => {
    // TODO
    if (!editable) {
      return;
    }
    return;
  };

  const editBatch = () => {
    // TODO
    if (!editable) {
      return;
    }
    return;
  };

  const createLinkToBatch = (iValue: React.ReactNode | unknown[]) => {
    return (
      <Link component='button' className={classes.link + ' ' + classes.text} onClick={editBatch}>
        {iValue}
      </Link>
    );
  };

  const createText = (iValue: React.ReactNode | unknown[]) => {
    return <Typography className={classes.text}>{iValue}</Typography>;
  };

  if (column.key === 'withdraw') {
    return (
      <CellRenderer
        index={index}
        column={column}
        row={row}
        value={
          <Button
            id='withdraw-batch'
            label={strings.WITHDRAW}
            onClick={withdraw}
            size='small'
            priority='secondary'
            className={classes.text}
            disabled={!editable}
          />
        }
      />
    );
  }

  if (column.key === 'batchNumber') {
    return <CellRenderer {...props} value={createLinkToBatch(value)} />;
  }

  return <CellRenderer {...props} value={createText(value)} />;
}
