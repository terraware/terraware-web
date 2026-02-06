import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress, Container, Typography, useTheme } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import EmptyStatePage from 'src/components/emptyStatePages/EmptyStatePage';
import { DEFAULT_SEARCH_DEBOUNCE_MS } from 'src/constants';
import { useLocalization, useOrganization } from 'src/providers';
import { InventoryFiltersType } from 'src/scenes/InventoryRouter/InventoryFilter';
import InventoryTable from 'src/scenes/InventoryRouter/InventoryTable';
import { FacilitySpeciesInventoryResult } from 'src/scenes/InventoryRouter/InventoryV2View';
import { NurseryBatchService } from 'src/services';
import NurseryInventoryService, { BE_SORTED_FIELDS, SearchInventoryParams } from 'src/services/NurseryInventoryService';
import { SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import useDebounce from 'src/utils/useDebounce';
import useForm from 'src/utils/useForm';

type InventoryListByNurseryProps = {
  setReportData: (data: SearchInventoryParams) => void;
};

export default function InventoryListByNursery({ setReportData }: InventoryListByNurseryProps) {
  const { strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();

  const [filters, setFilters] = useForm<InventoryFiltersType>({});
  const [searchResults, setSearchResults] = useState<SearchResponseElement[] | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOrder | undefined>({
    field: 'facility_name',
    direction: 'Ascending',
  });
  const [temporalSearchValue, setTemporalSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(temporalSearchValue, DEFAULT_SEARCH_DEBOUNCE_MS);

  const onSearchSortOrder = useCallback(
    (order: SearchSortOrder) => {
      const isClientSorted = BE_SORTED_FIELDS.indexOf(order.field) === -1;
      setSearchSortOrder(isClientSorted ? undefined : order);
    },
    [setSearchSortOrder]
  );

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
    ],
    [strings]
  );

  const onApplyFilters = useCallback(async () => {
    if (selectedOrganization) {
      const requestId = Math.random().toString();
      setRequestId('searchInventory', requestId);

      setReportData({
        organizationId: selectedOrganization.id,
        query: debouncedSearchTerm,
        facilityIds: filters.facilityIds,
        speciesIds: filters.speciesIds,
        searchSortOrder,
      });

      const allBatchesResult = await NurseryBatchService.getAllBatches(selectedOrganization.id, searchSortOrder);

      const apiSearchResults = await NurseryInventoryService.searchInventoryByNursery({
        organizationId: selectedOrganization.id,
        query: debouncedSearchTerm,
        facilityIds: filters.facilityIds,
        speciesIds: filters.speciesIds,
        searchSortOrder,
      });

      const updatedResult = apiSearchResults?.map((result) => {
        const resultTyped = result as FacilitySpeciesInventoryResult;
        const speciesNames =
          resultTyped.facilityInventories?.filter((fi) => fi.species_id)?.map((inv) => inv.species_scientificName) ||
          [];
        const batchIds = resultTyped.facilityInventories
          ?.filter((fi) => fi.species_id)
          .flatMap((inv) => inv.batches.map((batch) => batch.id));
        return { ...resultTyped, facilityInventories: speciesNames.join('\r'), batchIds };
      });

      if (updatedResult) {
        if (getRequestId('searchInventory') === requestId) {
          setShowResults((allBatchesResult?.length || 0) > 0);
          setSearchResults(updatedResult);
        }
      }
    }
  }, [filters, debouncedSearchTerm, selectedOrganization, searchSortOrder, setReportData]);

  const reloadData = useCallback(() => void onApplyFilters(), [onApplyFilters]);

  useEffect(() => {
    void onApplyFilters();
  }, [filters, onApplyFilters]);

  return (
    <Card flushMobile>
      <Typography
        sx={{
          fontSize: '20px',
          fontWeight: 600,
          color: theme.palette.TwClrTxt,
          marginBottom: theme.spacing(2),
        }}
      >
        {strings.BY_NURSERY}
      </Typography>
      {showResults ? (
        <InventoryTable
          results={searchResults || []}
          temporalSearchValue={temporalSearchValue}
          setTemporalSearchValue={setTemporalSearchValue}
          filters={filters}
          setFilters={setFilters}
          setSearchSortOrder={onSearchSortOrder}
          isPresorted={!!searchSortOrder}
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
