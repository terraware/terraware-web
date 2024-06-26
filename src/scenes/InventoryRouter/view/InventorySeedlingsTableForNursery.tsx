import React, { useCallback } from 'react';

import { TableColumnType } from '@terraware/web-components';

import InventorySeedlingsTable, {
  InventorySeedlingsTableProps,
} from 'src/scenes/InventoryRouter/view/InventorySeedlingsTable';
import { NurseryBatchService } from 'src/services';
import strings from 'src/strings';
import { FieldNodePayload, SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import { parseSearchTerm } from 'src/utils/search';

interface InventorySeedlingsTableForNurseryProps
  extends Omit<
    InventorySeedlingsTableProps,
    'columns' | 'isSelectionBulkWithdrawable' | 'getFuzzySearchFields' | 'getBatchesSearch' | 'getBatchesExport'
  > {
  nurseryId: number;
}

const columns = (): TableColumnType[] => [
  { key: 'batchNumber', name: strings.SEEDLING_BATCH, type: 'string' },
  { key: 'project_name', name: strings.PROJECT, type: 'string' },
  { key: 'species_scientificName', name: strings.SPECIES, type: 'string' },
  {
    key: 'germinatingQuantity',
    name: strings.GERMINATING,
    type: 'number',
    tooltipTitle: strings.TOOLTIP_GERMINATING_QUANTITY,
  },
  {
    key: 'notReadyQuantity',
    name: strings.NOT_READY,
    type: 'number',
    tooltipTitle: strings.TOOLTIP_NOT_READY_QUANTITY,
  },
  {
    key: 'readyQuantity',
    name: strings.READY,
    type: 'number',
    tooltipTitle: strings.TOOLTIP_READY_QUANTITY,
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
];

export default function InventorySeedlingsTableForNursery(props: InventorySeedlingsTableForNurseryProps): JSX.Element {
  const facilityId = props.nurseryId;

  const getFuzzySearchFields = useCallback((debouncedSearchTerm: string): FieldNodePayload[] => {
    const { type, values } = parseSearchTerm(debouncedSearchTerm);
    return [
      {
        operation: 'field',
        field: 'species_scientificName',
        type,
        values,
      },
    ];
  }, []);

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

  const isSelectionBulkWithdrawable = useCallback(() => true, []);

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
