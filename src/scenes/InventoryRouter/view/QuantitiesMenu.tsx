import React, { type JSX } from 'react';

import TableRowPopupMenu from 'src/components/common/table/TableRowPopupMenu';
import strings from 'src/strings';

import { ModalValuesType } from './BatchesCellRenderer';

export type QuantitiesMenuProps = {
  setModalValues: React.Dispatch<React.SetStateAction<ModalValuesType>>;
  batch: any;
};

export default function QuantitiesMenu(props: QuantitiesMenuProps): JSX.Element {
  const { setModalValues, batch } = props;

  const openChangeQuantityHandler = (type: string) => {
    setModalValues({
      openChangeQuantityModal: true,
      type,
      batch,
    });
  };

  const menuItems = [
    {
      label: strings.CHANGE_GERMINATION_ESTABLISHMENT_STATUS,
      disabled: Number(batch.germinatingQuantity) === 0,
      onClick: () => openChangeQuantityHandler('germinating'),
    },
    {
      label: strings.CHANGE_ACTIVE_GROWTH_STATUS,
      disabled: Number(batch.activeGrowthQuantity) === 0,
      onClick: () => openChangeQuantityHandler('active-growth'),
    },
    {
      label: strings.CHANGE_HARDENING_OFF_STATUS,
      disabled: Number(batch.hardeningOffQuantity) === 0,
      onClick: () => openChangeQuantityHandler('hardening-off'),
    },
  ];

  return <TableRowPopupMenu menuItems={menuItems} />;
}
