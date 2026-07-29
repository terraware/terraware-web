import React, { useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress, Container } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import EmptyStatePage from 'src/components/emptyStatePages/EmptyStatePage';
import { DEFAULT_SEARCH_DEBOUNCE_MS } from 'src/constants';
import { useOrganizationSpecies } from 'src/hooks/useOrganizationSpecies';
import { useLocalization, useOrganization } from 'src/providers';
import { useLazyListAllBatchesQuery } from 'src/queries/search/batches';
import {
  SearchInventoryByNurseryApiArg,
  useLazySearchInventoryByNurseryQuery,
} from 'src/queries/search/nurseryInventory';
import { isNurseryEmpty } from 'src/scenes/InventoryRouter/FilterUtils';
import { InventoryFiltersUnion } from 'src/scenes/InventoryRouter/InventoryFilter';
import InventoryTable from 'src/scenes/InventoryRouter/InventoryTable';
import { FacilitySpeciesInventoryResult } from 'src/scenes/InventoryRouter/InventoryV2View';
import useDebounce from 'src/utils/useDebounce';
import useForm from 'src/utils/useForm';

export default function InventoryListByNursery() {
  const { activeLocale, strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const { findSpeciesById } = useOrganizationSpecies();

  const [filters, setFilters] = useForm<InventoryFiltersUnion>({});
  const [temporalSearchValue, setTemporalSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(temporalSearchValue, DEFAULT_SEARCH_DEBOUNCE_MS);

  const columns = useMemo(
    (): TableColumnType[] => [
      { key: 'facility_name', name: strings.NURSERY, type: 'string' },
      {
        key: 'facilityInventories',
        name: strings.SPECIES,
        type: 'string',
        tooltipTitle: strings.TOOLTIP_SCIENTIFIC_NAME,
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
    ],
    [strings]
  );

  // Whether the org has any inventory at all, which decides between the table and the onboarding page
  const [listAllBatches, { data: allBatches }] = useLazyListAllBatchesQuery();

  useEffect(() => {
    if (selectedOrganization && activeLocale) {
      void listAllBatches({ organizationId: selectedOrganization.id }, true);
    }
  }, [activeLocale, listAllBatches, selectedOrganization]);

  const searchArgs = useMemo(
    (): SearchInventoryByNurseryApiArg => ({
      organizationId: selectedOrganization?.id ?? -1,
      query: debouncedSearchTerm,
      facilityIds: filters.facilityIds,
      speciesIds: filters.speciesIds,
    }),
    [debouncedSearchTerm, filters.facilityIds, filters.speciesIds, selectedOrganization]
  );

  // `data` rather than `currentData` so the table keeps showing the previous rows while a filter
  // change refetches, rather than blanking out on every keystroke.
  const [searchInventoryByNursery, { data: apiSearchResults }] = useLazySearchInventoryByNurseryQuery();

  useEffect(() => {
    if (selectedOrganization && activeLocale) {
      void searchInventoryByNursery(searchArgs, true);
    }
  }, [activeLocale, searchArgs, searchInventoryByNursery, selectedOrganization]);

  const searchResults = useMemo(() => {
    if (!apiSearchResults) {
      return undefined;
    }

    const showEmptyNurseries = (filters.showEmptyNurseries || [])[0] === 'true';

    return apiSearchResults
      .map((result) => {
        const resultTyped = result as FacilitySpeciesInventoryResult;
        const speciesNames =
          resultTyped.facilityInventories
            ?.filter((fi) => fi.species_id)
            ?.map((inv) => findSpeciesById(Number(inv.species_id))?.scientificName ?? inv.species_scientificName) || [];
        const batchIds =
          resultTyped.facilityInventories
            ?.filter((fi) => fi.species_id)
            ?.flatMap((inv) => inv.batches.map((batch) => batch.id)) || [];
        return { ...resultTyped, facilityInventories: speciesNames.join('\r'), batchIds };
      })
      .filter((result) => showEmptyNurseries || !isNurseryEmpty(result));
  }, [apiSearchResults, filters.showEmptyNurseries, findSpeciesById]);

  const showResults = (allBatches?.length ?? 0) > 0;

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
          origin='Nursery'
          emptyTableMessage={
            !debouncedSearchTerm && !filters.facilityIds?.length && !filters.speciesIds?.length
              ? strings.NO_BATCHES_WITH_INVENTORY
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
