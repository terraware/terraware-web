import { makeStyles } from '@mui/styles';
import React, { useState } from 'react';
import { Link, Typography } from '@mui/material';
import { Button } from '@terraware/web-components';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import strings from 'src/strings';
import stopPropagation from 'src/utils/stopPropagationEvent';
import ChangeQuantityModal from './ChangeQuantityModal';
import { Batch } from 'src/api/types/batch';
import QuantitiesMenu from './QuantitiesMenu';

const useStyles = makeStyles(() => ({
  link: {
    color: '#0067C8',
  },
  text: {
    fontSize: '14px',
  },
}));

export type ModalValuesType = {
  type: string;
  openChangeQuantityModal: boolean;
};

export default function BatchesCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const classes = useStyles();
  const { column, row, value, index, onRowClick } = props;
  const [modalValues, setModalValues] = useState({ type: 'germinating', openChangeQuantityModal: false });

  const rowClick = (event?: React.SyntheticEvent) => {
    if (onRowClick) {
      if (event) {
        stopPropagation(event);
      }
      onRowClick();
    }
  };

  const createLinkToBatch = (iValue: React.ReactNode | unknown[]) => {
    return (
      <Link component='button' className={classes.link + ' ' + classes.text} onClick={rowClick}>
        {iValue}
      </Link>
    );
  };

  const createText = (iValue: React.ReactNode | unknown[]) => {
    return <Typography className={classes.text}>{iValue}</Typography>;
  };

  if (column.key === 'withdraw') {
    return (
      <>
        <CellRenderer
          index={index}
          column={column}
          row={row}
          value={
            <Button
              id='withdraw-batch'
              label={strings.WITHDRAW}
              onClick={rowClick}
              size='small'
              priority='secondary'
              className={classes.text}
            />
          }
        />
      </>
    );
  }

  if (column.key === 'batchNumber') {
    return <CellRenderer {...props} value={createLinkToBatch(value)} />;
  }

  if (column.key === 'quantitiesMenu') {
    return (
      <CellRenderer
        index={index}
        column={column}
        row={row}
        value={
          <>
            <ChangeQuantityModal
              open={modalValues.openChangeQuantityModal}
              onClose={() => setModalValues({ openChangeQuantityModal: false, type: 'germinating' })}
              modalValues={modalValues}
              row={row as Batch}
              reload={onRowClick}
            />
            <QuantitiesMenu setModalValues={setModalValues} />
          </>
        }
      />
    );
  }

  return <CellRenderer {...props} value={createText(value)} />;
}
