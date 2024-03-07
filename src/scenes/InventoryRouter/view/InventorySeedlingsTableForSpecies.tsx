import React, { useCallback } from 'react';

import { TableColumnType } from '@terraware/web-components';

import InventorySeedlingsTable, {
  InventorySeedlingsTableProps,
} from 'src/scenes/InventoryRouter/view/InventorySeedlingsTable';
import { NurseryBatchService } from 'src/services';
import strings from 'src/strings';
import { FieldNodePayload, SearchResponseElement, SearchSortOrder } from 'src/types/Search';

interface InventorySeedlingsTableForSpeciesProps
  extends Omit<
    InventorySeedlingsTableProps,
    'columns' | 'isSelectionBulkWithdrawable' | 'getFuzzySearchFields' | 'getBatchesSearch' | 'getBatchesExport'
  > {
  speciesId: number;
}

const columns = (): TableColumnType[] => [
  { key: 'batchNumber', name: strings.SEEDLING_BATCH, type: 'string' },
  { key: 'project_name', name: strings.PROJECT, type: 'string' },
  {
    key: 'germinatingQuantity',
    name: strings.GERMINATING,
    type: 'string',
    tooltipTitle: strings.TOOLTIP_GERMINATING_QUANTITY,
  },
  {
    key: 'notReadyQuantity',
    name: strings.NOT_READY,
    type: 'string',
    tooltipTitle: strings.TOOLTIP_NOT_READY_QUANTITY,
  },
  { key: 'readyQuantity', name: strings.READY, type: 'string', tooltipTitle: strings.TOOLTIP_READY_QUANTITY },
  { key: 'totalQuantity', name: strings.TOTAL, type: 'string', tooltipTitle: strings.TOOLTIP_TOTAL_QUANTITY },
  { key: 'totalQuantityWithdrawn', name: strings.WITHDRAWN, type: 'string' },
  { key: 'facility_name', name: strings.NURSERY, type: 'string' },
  { key: 'readyByDate', name: strings.EST_READY_DATE, type: 'string' },
  { key: 'addedDate', name: strings.DATE_ADDED, type: 'string' },
  { key: 'withdraw', name: '', type: 'string' },
  { key: 'quantitiesMenu', name: '', type: 'string' },
];

export default function InventorySeedlingsTableForSpecies(props: InventorySeedlingsTableForSpeciesProps): JSX.Element {
  const speciesId = props.speciesId;

  const getFuzzySearchFields = useCallback(
    (debouncedSearchTerm: string): FieldNodePayload[] => [
      {
        operation: 'field',
        field: 'facility_name',
        type: 'Fuzzy',
        values: [debouncedSearchTerm],
      },
    ],
    []
  );

  const getBatchesSearch = useCallback(
    async (
      orgId: number,
      originId: number,
      searchFields: FieldNodePayload[],
      searchSortOrder: SearchSortOrder | undefined
    ): Promise<SearchResponseElement[] | null> => {
      const searchResponse: SearchResponseElement[] | null = await NurseryBatchService.getBatchesForSpeciesById(
        orgId,
        originId,
        searchFields,
        searchSortOrder
      );
      return (
        searchResponse?.map(
          (sr: SearchResponseElement): SearchResponseElement => ({
            ...sr,
            facilityId: sr.facility_id,
            species_id: speciesId,
          })
        ) || null
      );
    },
    [speciesId]
  );

  const getBatchesExport = useCallback(
    (
      orgId: number,
      originId: number,
      searchFields: FieldNodePayload[],
      searchSortOrder: SearchSortOrder | undefined
    ): Promise<SearchResponseElement[] | null> =>
      NurseryBatchService.exportBatchesForSpeciesById(orgId, originId, searchFields, searchSortOrder),
    []
  );

  const areAllFromSameNursery = (selectedRows: SearchResponseElement[]) => {
    if (!selectedRows.length) {
      return false;
    }
    const initialNurseryId = selectedRows[0].facilityId;
    const otherNursery = selectedRows.some((row) => `${row.facilityId}` !== `${initialNurseryId}`);
    return !otherNursery;
  };

  const isSelectionBulkWithdrawable = useCallback(
    (selectedRows: SearchResponseElement[]) => areAllFromSameNursery(selectedRows),
    []
  );

  return (
    <InventorySeedlingsTable
      {...props}
      columns={columns}
      isSelectionBulkWithdrawable={isSelectionBulkWithdrawable}
      getFuzzySearchFields={getFuzzySearchFields}
      getBatchesSearch={getBatchesSearch}
      getBatchesExport={getBatchesExport}
    />
  );
}
