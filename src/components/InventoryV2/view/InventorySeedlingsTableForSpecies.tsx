import React, { useCallback } from 'react';
import { TableColumnType } from '@terraware/web-components';
import strings from 'src/strings';
import { FieldNodePayload, SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import { NurseryBatchService } from 'src/services';
import isEnabled from 'src/features';
import InventorySeedlingsTable, {
  InventorySeedlingsTableProps,
} from 'src/components/InventoryV2/view/InventorySeedlingsTable';

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
  { key: 'germinatingQuantity', name: strings.GERMINATING, type: 'string' },
  { key: 'notReadyQuantity', name: strings.NOT_READY, type: 'string' },
  { key: 'readyQuantity', name: strings.READY, type: 'string' },
  { key: 'totalQuantity', name: strings.TOTAL, type: 'string' },
  { key: 'totalQuantityWithdrawn', name: strings.WITHDRAWN, type: 'string' },
  { key: 'facility_name', name: strings.NURSERY, type: 'string' },
  { key: 'readyByDate', name: strings.EST_READY_DATE, type: 'string' },
  { key: 'addedDate', name: strings.DATE_ADDED, type: 'string' },
  { key: 'withdraw', name: '', type: 'string' },
  { key: 'quantitiesMenu', name: '', type: 'string' },
];

export default function InventorySeedlingsTableForSpecies(props: InventorySeedlingsTableForSpeciesProps): JSX.Element {
  const featureFlagProjects = isEnabled('Projects');

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
    const initialNurseryId = selectedRows[0].facilityId;
    const otherNursery = selectedRows.some((row) => `${row.facilityId}` !== `${initialNurseryId}`);
    return !otherNursery;
  };

  const selectionHasWithdrawableQuantities = (selectedRows: SearchResponseElement[]) => {
    return selectedRows.some((row) => Number(row['totalQuantity(raw)']) > 0);
  };

  const isSelectionBulkWithdrawable = useCallback((selectedRows: SearchResponseElement[]) => {
    return areAllFromSameNursery(selectedRows) && selectionHasWithdrawableQuantities(selectedRows);
  }, []);

  return (
    <InventorySeedlingsTable
      {...props}
      columns={() => (featureFlagProjects ? columns() : columns().filter((column) => column.key !== 'project_name'))}
      isSelectionBulkWithdrawable={isSelectionBulkWithdrawable}
      getFuzzySearchFields={getFuzzySearchFields}
      getBatchesSearch={getBatchesSearch}
      getBatchesExport={getBatchesExport}
    />
  );
}
