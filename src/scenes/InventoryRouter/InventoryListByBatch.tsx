import React, { useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress, Container } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import EmptyStatePage from 'src/components/emptyStatePages/EmptyStatePage';
import { DEFAULT_SEARCH_DEBOUNCE_MS } from 'src/constants';
import { useOrganizationSpecies } from 'src/hooks/useOrganizationSpecies';
import { useLocalization, useOrganization } from 'src/providers';
import { ListAllBatchesApiArg, useLazyListAllBatchesQuery } from 'src/queries/search/batches';
import { isBatchEmpty } from 'src/scenes/InventoryRouter/FilterUtils';
import { InventoryFiltersUnion } from 'src/scenes/InventoryRouter/InventoryFilter';
import InventoryTable from 'src/scenes/InventoryRouter/InventoryTable';
import { BatchInventoryResult, InventoryResultWithBatchNumber } from 'src/scenes/InventoryRouter/InventoryV2View';
import { SearchSortOrder } from 'src/types/Search';
import useDebounce from 'src/utils/useDebounce';
import useForm from 'src/utils/useForm';

export default function InventoryListByBatch() {
  const { activeLocale, strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const { findSpeciesById } = useOrganizationSpecies();

  const [filters, setFilters] = useForm<InventoryFiltersUnion>({});
  const [showResults, setShowResults] = useState(false);
  const [temporalSearchValue, setTemporalSearchValue] = useState('');

  const debouncedSearchTerm = useDebounce(temporalSearchValue, DEFAULT_SEARCH_DEBOUNCE_MS);

  const columns = useMemo(
    (): TableColumnType[] => [
      { key: 'batchNumber', name: strings.BATCH_NUMBER, type: 'string', tooltipTitle: strings.TOOLTIP_BATCH_NUMBER },
      { key: 'project_name', name: strings.PROJECT, type: 'string' },
      {
        key: 'species_scientificName_noLink',
        name: strings.SPECIES,
        type: 'string',
        tooltipTitle: strings.TOOLTIP_SCIENTIFIC_NAME,
      },
      {
        key: 'species_commonName',
        name: strings.COMMON_NAME,
        type: 'string',
      },
      {
        key: 'facility_name_noLink',
        name: strings.NURSERY,
        type: 'string',
      },
      {
        key: 'subLocations',
        name: strings.SUB_LOCATIONS,
        type: 'string',
      },
      {
        key: 'germinatingQuantity(raw)',
        name: strings.GERMINATION_ESTABLISHMENT,
        type: 'number' as const,
        tooltipTitle: strings.TOOLTIP_GERMINATION_ESTABLISHMENT_QUANTITY,
      },
      {
        key: 'activeGrowthQuantity(raw)',
        name: strings.ACTIVE_GROWTH,
        type: 'number' as const,
        tooltipTitle: strings.TOOLTIP_ACTIVE_GROWTH_QUANTITY,
      },
      {
        key: 'hardeningOffQuantity(raw)',
        name: strings.HARDENING_OFF,
        type: 'number' as const,
        tooltipTitle: strings.TOOLTIP_HARDENING_OFF_QUANTITY,
      },
      {
        key: 'readyQuantity(raw)',
        name: strings.READY_TO_PLANT,
        type: 'number' as const,
        tooltipTitle: strings.TOOLTIP_READY_TO_PLANT_QUANTITY,
      },
      {
        key: 'totalQuantity(raw)',
        name: strings.TOTAL,
        type: 'number' as const,
        tooltipTitle: strings.TOOLTIP_TOTAL_QUANTITY,
      },
      { key: 'quantitiesMenu', name: '', type: 'string' },
    ],
    [strings]
  );

  const searchArgs = useMemo(
    (): ListAllBatchesApiArg => ({
      organizationId: selectedOrganization?.id ?? -1,
      sortOrder: { field: 'batchNumber', direction: 'Ascending' } as SearchSortOrder,
      nurseryIds: filters.facilityIds,
      subLocationIds: filters.subLocationsIds,
      projectIds: filters.projectIds,
      query: debouncedSearchTerm,
    }),
    [debouncedSearchTerm, filters.facilityIds, filters.projectIds, filters.subLocationsIds, selectedOrganization]
  );

  // `data` rather than `currentData` so the table keeps showing the previous rows while a filter
  // change refetches, rather than blanking out on every keystroke.
  const [listAllBatches, { data: batchResults }] = useLazyListAllBatchesQuery();

  useEffect(() => {
    if (selectedOrganization && activeLocale) {
      void listAllBatches(searchArgs, true);
    }
  }, [activeLocale, listAllBatches, searchArgs, selectedOrganization]);

  const results = useMemo(
    () =>
      batchResults?.map((result) => {
        const resultTyped = {
          ...result,
          subLocations: ((result.subLocations as { subLocation_name: string }[]) ?? [])
            .map((subLocation) => subLocation.subLocation_name)
            .join('\r'),
        } as BatchInventoryResult;

        const orgSpecies = findSpeciesById(Number(resultTyped.species_id));

        return {
          ...resultTyped,
          batchId: resultTyped.id,
          species_scientificName_noLink: orgSpecies?.scientificName ?? resultTyped.species_scientificName,
          species_commonName: orgSpecies?.commonName ?? resultTyped.species_commonName,
          facility_name_noLink: resultTyped.facility_name,
        } as InventoryResultWithBatchNumber;
      }),
    [batchResults, findSpeciesById]
  );

  const searchResults = useMemo(() => {
    const showEmptyBatches = (filters.showEmptyBatches || [])[0] === 'true';
    return results?.filter((result) => showEmptyBatches || !isBatchEmpty(result));
  }, [filters.showEmptyBatches, results]);

  const isUnfiltered = !debouncedSearchTerm && !filters.facilityIds?.length && !filters.projectIds?.length;

  // Sticky: once an unfiltered search has found batches the table stays up, so narrowing the
  // filters down to nothing shows an empty table rather than the onboarding page.
  useEffect(() => {
    if (results && isUnfiltered) {
      setShowResults(results.length > 0);
    }
  }, [isUnfiltered, results]);

  return (
    <Card flushMobile>
      {showResults ? (
        <InventoryTable
          results={searchResults || []}
          temporalSearchValue={temporalSearchValue}
          setTemporalSearchValue={setTemporalSearchValue}
          filters={filters}
          setFilters={setFilters}
          columns={columns}
          origin='Batches'
          allowSelectionProjectAssign
          emptyTableMessage={
            !debouncedSearchTerm && !filters.facilityIds?.length && !filters.projectIds?.length
              ? strings.NO_BATCHES_WITH_INVENTORY_MESSAGE
              : ''
          }
        />
      ) : searchResults === undefined ? (
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Container maxWidth={false} sx={{ padding: '32px 0' }}>
          <EmptyStatePage pageName='Inventory' />
        </Container>
      )}
    </Card>
  );
}
