import React, { type JSX, useCallback, useMemo } from 'react';

import { TableColumnType } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import InventorySeedlingsTable, {
  InventorySeedlingsTableProps,
} from 'src/scenes/InventoryRouter/view/InventorySeedlingsTable';
import { NurseryBatchService } from 'src/services';
import { FieldNodePayload, SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import { parseSearchTerm } from 'src/utils/search';

interface InventorySeedlingsTableForSpeciesProps
  extends Omit<
    InventorySeedlingsTableProps,
    'columns' | 'isSelectionBulkWithdrawable' | 'getFuzzySearchFields' | 'getBatchesSearch' | 'getBatchesExport'
  > {
  speciesId: number;
}

export default function InventorySeedlingsTableForSpecies(props: InventorySeedlingsTableForSpeciesProps): JSX.Element {
  const speciesId = props.speciesId;
  const { strings } = useLocalization();

  const columns = useMemo(
    (): TableColumnType[] => [
      { key: 'batchNumber', name: strings.SEEDLING_BATCH, type: 'string' },
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
      { key: 'totalQuantityWithdrawn', name: strings.WITHDRAWN, type: 'number' },
      { key: 'facility_name', name: strings.NURSERY, type: 'string' },
      { key: 'readyByDate', name: strings.EST_READY_DATE, type: 'string' },
      { key: 'addedDate', name: strings.DATE_ADDED, type: 'string' },
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
        field: 'facility_name',
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
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
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
