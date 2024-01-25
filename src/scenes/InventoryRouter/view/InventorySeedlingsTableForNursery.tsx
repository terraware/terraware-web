import React, { useCallback } from 'react';
import { TableColumnType } from '@terraware/web-components';
import strings from 'src/strings';
import { FieldNodePayload, SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import { NurseryBatchService } from 'src/services';
import isEnabled from 'src/features';
import InventorySeedlingsTable, {
  InventorySeedlingsTableProps,
} from 'src/scenes/InventoryRouter/view/InventorySeedlingsTable';

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
  { key: 'readyByDate', name: strings.EST_READY_DATE, type: 'date' },
  { key: 'addedDate', name: strings.DATE_ADDED, type: 'date' },
  { key: 'withdraw', name: '', type: 'string' },
  { key: 'quantitiesMenu', name: '', type: 'string' },
];

export default function InventorySeedlingsTableForNursery(props: InventorySeedlingsTableForNurseryProps): JSX.Element {
  const facilityId = props.nurseryId;

  const featureFlagProjects = isEnabled('Projects');

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

  const isSelectionBulkWithdrawable = useCallback(() => true, []);

  return (
    <InventorySeedlingsTable
      {...props}
      facilityId={facilityId}
      columns={() => (featureFlagProjects ? columns() : columns().filter((column) => column.key !== 'project_name'))}
      isSelectionBulkWithdrawable={isSelectionBulkWithdrawable}
      getFuzzySearchFields={getFuzzySearchFields}
      getBatchesSearch={getBatchesSearch}
    />
  );
}
