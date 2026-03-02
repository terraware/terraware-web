import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress, Container } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import EmptyStatePage from 'src/components/emptyStatePages/EmptyStatePage';
import { DEFAULT_SEARCH_DEBOUNCE_MS } from 'src/constants';
import { useLocalization, useOrganization } from 'src/providers';
import { isNurseryEmpty } from 'src/scenes/InventoryRouter/FilterUtils';
import { InventoryFiltersUnion } from 'src/scenes/InventoryRouter/InventoryFilter';
import InventoryTable from 'src/scenes/InventoryRouter/InventoryTable';
import { FacilitySpeciesInventoryResult } from 'src/scenes/InventoryRouter/InventoryV2View';
import { NurseryBatchService } from 'src/services';
import NurseryInventoryService from 'src/services/NurseryInventoryService';
import { SearchResponseElement } from 'src/types/Search';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import useDebounce from 'src/utils/useDebounce';
import useForm from 'src/utils/useForm';

export default function InventoryListByNursery() {
  const { activeLocale, strings } = useLocalization();
  const { selectedOrganization } = useOrganization();

  const [filters, setFilters] = useForm<InventoryFiltersUnion>({});
  const [searchResults, setSearchResults] = useState<SearchResponseElement[] | null>(null);
  const [showResults, setShowResults] = useState(false);
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

  const onApplyFilters = useCallback(async () => {
    if (selectedOrganization && activeLocale) {
      const requestId = Math.random().toString();
      setRequestId('searchInventory', requestId);

      const showEmptyNurseries = (filters.showEmptyNurseries || [])[0] === 'true';

      const allBatchesResult = await NurseryBatchService.getAllBatches(selectedOrganization.id);

      const apiSearchResults = await NurseryInventoryService.searchInventoryByNursery({
        organizationId: selectedOrganization.id,
        query: debouncedSearchTerm,
        facilityIds: filters.facilityIds,
        speciesIds: filters.speciesIds,
      });

      const updatedResult = apiSearchResults?.map((result) => {
        const resultTyped = result as FacilitySpeciesInventoryResult;
        const speciesNames =
          resultTyped.facilityInventories?.filter((fi) => fi.species_id)?.map((inv) => inv.species_scientificName) ||
          [];
        const batchIds =
          resultTyped.facilityInventories
            ?.filter((fi) => fi.species_id)
            ?.flatMap((inv) => inv.batches.map((batch) => batch.id)) || [];
        return { ...resultTyped, facilityInventories: speciesNames.join('\r'), batchIds };
      });

      const filteredResult = updatedResult?.filter((result) => showEmptyNurseries || !isNurseryEmpty(result));

      if (updatedResult) {
        if (getRequestId('searchInventory') === requestId) {
          setShowResults((allBatchesResult?.length || 0) > 0);
          setSearchResults(filteredResult || []);
        }
      }
    }
  }, [
    activeLocale,
    debouncedSearchTerm,
    filters.facilityIds,
    filters.showEmptyNurseries,
    filters.speciesIds,
    selectedOrganization,
  ]);

  const reloadData = useCallback(() => void onApplyFilters(), [onApplyFilters]);

  useEffect(() => {
    void onApplyFilters();
  }, [filters, onApplyFilters]);

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
      ) : searchResults === null ? (
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
          <EmptyStatePage pageName='Inventory' reloadData={reloadData} />
        </Container>
      )}
    </Card>
  );
}
