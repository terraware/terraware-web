import React, { useCallback } from 'react';
import { TableColumnType } from '@terraware/web-components';
import strings from 'src/strings';
import { FieldNodePayload, SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import { NurseryBatchService } from 'src/services';
import InventorySeedlingsTable, { InventorySeedlingsTableProps } from './InventorySeedlingsTable';

interface InventorySeedlingsTableForNurseryProps
  extends Omit<
    InventorySeedlingsTableProps,
    'columns' | 'isSelectionBulkWithdrawable' | 'getFuzzySearchFields' | 'getBatchesSearch' | 'getBatchesExport'
  > {
  nurseryId: number;
}

const columns = (): TableColumnType[] => [
  { key: 'batchNumber', name: strings.SEEDLING_BATCH, type: 'string' },
  { key: 'species_scientificName', name: strings.SPECIES, type: 'string' },
  { key: 'germinatingQuantity', name: strings.GERMINATING, type: 'string' },
  { key: 'readyQuantity', name: strings.READY, type: 'string' },
  { key: 'notReadyQuantity', name: strings.NOT_READY, type: 'string' },
  { key: 'totalQuantity', name: strings.TOTAL, type: 'string' },
  { key: 'totalQuantityWithdrawn', name: strings.WITHDRAWN, type: 'string' },
  { key: 'readyByDate', name: strings.EST_READY_DATE, type: 'date' },
  { key: 'addedDate', name: strings.DATE_ADDED, type: 'date' },
  { key: 'withdraw', name: '', type: 'string' },
  { key: 'quantitiesMenu', name: '', type: 'string' },
];

export default function InventorySeedlingsTableForNursery(props: InventorySeedlingsTableForNurseryProps): JSX.Element {
  const facilityId = props.nurseryId;

  const getFuzzySearchFields = useCallback(
    (debouncedSearchTerm: string): FieldNodePayload[] => [
      {
        operation: 'field',
        field: 'species_scientificName',
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
      const searchResponse: SearchResponseElement[] | null = await NurseryBatchService.getBatchesForNursery(
        orgId,
        originId,
        searchFields,
        searchSortOrder
      );
      return searchResponse?.map((sr: SearchResponseElement): SearchResponseElement => ({ ...sr, facilityId })) || null;
    },
    [facilityId]
  );

  const isSelectionBulkWithdrawable = useCallback((selectedRows: SearchResponseElement[]) => {
    return selectedRows.some((row) => Number(row['totalQuantity(raw)']) > 0);
  }, []);

  return (
    <InventorySeedlingsTable
      {...props}
      facilityId={facilityId}
      columns={columns}
      isSelectionBulkWithdrawable={isSelectionBulkWithdrawable}
      getFuzzySearchFields={getFuzzySearchFields}
      getBatchesSearch={getBatchesSearch}
    />
  );
}
