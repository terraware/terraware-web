import React, { useState } from 'react';

import { Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Button } from '@terraware/web-components';

import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import strings from 'src/strings';
import { Batch } from 'src/types/Batch';

import ChangeQuantityModal from './ChangeQuantityModal';
import QuantitiesMenu from './QuantitiesMenu';

const useStyles = makeStyles(() => ({
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
      onRowClick();
    }
  };

  const createLinkToBatch = (iValue: React.ReactNode | unknown[]) => {
    return <Link onClick={rowClick}>{iValue as React.ReactNode}</Link>;
  };

  const createText = (iValue: React.ReactNode | unknown[]) => {
    return <Typography className={classes.text}>{iValue as React.ReactNode}</Typography>;
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
              disabled={Number(row.totalQuantity) + Number(row.germinatingQuantity) === 0}
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
            {modalValues.openChangeQuantityModal && (
              <ChangeQuantityModal
                onClose={() => setModalValues({ openChangeQuantityModal: false, type: 'germinating' })}
                modalValues={modalValues}
                row={row as Batch}
                reload={onRowClick}
              />
            )}
            <QuantitiesMenu setModalValues={setModalValues} batch={row} />
          </>
        }
      />
    );
  }

  return <CellRenderer {...props} value={createText(value)} />;
}
