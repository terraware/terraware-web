import React, { type JSX, useState } from 'react';

import { Typography } from '@mui/material';
import { Button } from '@terraware/web-components';

import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import strings from 'src/strings';
import { Batch } from 'src/types/Batch';

import ChangeQuantityModal from './ChangeQuantityModal';
import QuantitiesMenu from './QuantitiesMenu';

export type ModalValuesType = {
  type: string;
  openChangeQuantityModal: boolean;
};

export default function BatchesCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, value, index, onRowClick } = props;
  const [modalValues, setModalValues] = useState({ type: 'germinating', openChangeQuantityModal: false });

  const textStyles = {
    fontSize: '14px',
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const rowClick = (event?: React.SyntheticEvent) => {
    if (onRowClick) {
      onRowClick();
    }
  };

  const createLinkToBatch = (iValue: React.ReactNode | unknown[]) => {
    return (
      <Link fontSize='16px' onClick={rowClick}>
        {iValue as React.ReactNode}
      </Link>
    );
  };

  const createText = (iValue: React.ReactNode | unknown[]) => {
    return <Typography sx={textStyles}>{iValue as React.ReactNode}</Typography>;
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
              disabled={Number(row.totalQuantity) + Number(row.germinatingQuantity) === 0}
              style={textStyles}
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
