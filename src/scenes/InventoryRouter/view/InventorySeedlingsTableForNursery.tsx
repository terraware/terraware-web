import React, { type JSX, useCallback, useMemo } from 'react';

import { TableColumnType } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import InventorySeedlingsTable, {
  InventorySeedlingsTableProps,
} from 'src/scenes/InventoryRouter/view/InventorySeedlingsTable';

interface InventorySeedlingsTableForNurseryProps
  extends Omit<InventorySeedlingsTableProps, 'columns' | 'isSelectionBulkWithdrawable'> {
  nurseryId: number;
}

export default function InventorySeedlingsTableForNursery(props: InventorySeedlingsTableForNurseryProps): JSX.Element {
  const facilityId = props.nurseryId;
  const { strings } = useLocalization();

  const columns = useMemo(
    (): TableColumnType[] => [
      { key: 'batchNumber', name: strings.SEEDLING_BATCH, type: 'string' },
      { key: 'species_scientificName', name: strings.SPECIES, type: 'string' },
      { key: 'species_commonName', name: strings.COMMON_NAME, type: 'string' },
      { key: 'project_name', name: strings.PROJECT, type: 'string' },
      {
        key: 'germinatingQuantity',
        name: strings.GERMINATION_ESTABLISHMENT,
        type: 'number' as const,
        tooltipTitle: strings.TOOLTIP_GERMINATION_ESTABLISHMENT_QUANTITY,
      },
      {
        key: 'activeGrowthQuantity',
        name: strings.ACTIVE_GROWTH,
        type: 'number' as const,
        tooltipTitle: strings.TOOLTIP_ACTIVE_GROWTH_QUANTITY,
      },
      {
        key: 'hardeningOffQuantity',
        name: strings.HARDENING_OFF,
        type: 'number' as const,
        tooltipTitle: strings.TOOLTIP_HARDENING_OFF_QUANTITY,
      },
      {
        key: 'readyQuantity',
        name: strings.READY_TO_PLANT,
        type: 'number' as const,
        tooltipTitle: strings.TOOLTIP_READY_TO_PLANT_QUANTITY,
      },
      {
        key: 'totalQuantity',
        name: strings.TOTAL,
        type: 'number',
        tooltipTitle: strings.TOOLTIP_TOTAL_QUANTITY,
      },
      { key: 'totalQuantityWithdrawn', name: strings.WITHDRAWN, type: 'string', alignment: 'right' },
      { key: 'readyByDate', name: strings.EST_READY_DATE, type: 'date' },
      { key: 'addedDate', name: strings.DATE_ADDED, type: 'date' },
      { key: 'withdraw', name: '', type: 'string' },
      { key: 'quantitiesMenu', name: '', type: 'string' },
    ],
    [strings]
  );

  const isSelectionBulkWithdrawable = useCallback(() => true, []);

  return (
    <InventorySeedlingsTable
      {...props}
      facilityId={facilityId}
      columns={columns}
      isSelectionBulkWithdrawable={isSelectionBulkWithdrawable}
    />
  );
}
