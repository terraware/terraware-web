import React, { type JSX, useCallback, useMemo } from 'react';

import { TableColumnType } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import { useLazyListBatchesForNurseryQuery } from 'src/queries/search/batches';
import InventorySeedlingsTable, {
  InventorySeedlingsTableProps,
} from 'src/scenes/InventoryRouter/view/InventorySeedlingsTable';
import { FieldNodePayload, SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import { parseSearchTerm } from 'src/utils/search';

interface InventorySeedlingsTableForNurseryProps
  extends Omit<
    InventorySeedlingsTableProps,
    'columns' | 'isSelectionBulkWithdrawable' | 'getFuzzySearchFields' | 'getBatchesSearch'
  > {
  nurseryId: number;
}

export default function InventorySeedlingsTableForNursery(props: InventorySeedlingsTableForNurseryProps): JSX.Element {
  const [listBatchesForNursery] = useLazyListBatchesForNurseryQuery();
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
      const searchResponse = await listBatchesForNursery({
        organizationId: orgId,
        nurseryId: originId,
        searchFields,
        sortOrder: searchSortOrder,
      }).unwrap();
      return searchResponse.map((sr): SearchResponseElement => ({ ...sr, facilityId }));
    },
    [facilityId, listBatchesForNursery]
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
