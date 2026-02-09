import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress, Container, Typography, useTheme } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import EmptyStatePage from 'src/components/emptyStatePages/EmptyStatePage';
import { DEFAULT_SEARCH_DEBOUNCE_MS } from 'src/constants';
import { useLocalization, useOrganization } from 'src/providers';
import { isSpeciesEmpty } from 'src/scenes/InventoryRouter/FilterUtils';
import { InventoryFiltersUnion } from 'src/scenes/InventoryRouter/InventoryFilter';
import InventoryTable from 'src/scenes/InventoryRouter/InventoryTable';
import { SpeciesInventoryResult } from 'src/scenes/InventoryRouter/InventoryV2View';
import NurseryInventoryService, { BE_SORTED_FIELDS, SearchInventoryParams } from 'src/services/NurseryInventoryService';
import { SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import useDebounce from 'src/utils/useDebounce';
import useForm from 'src/utils/useForm';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

type InventoryListBySpeciesProps = {
  setReportData: (data: SearchInventoryParams) => void;
};

export default function InventoryListBySpecies({ setReportData }: InventoryListBySpeciesProps) {
  const { strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const numberFormatter = useNumberFormatter();
  const theme = useTheme();

  const [filters, setFilters] = useForm<InventoryFiltersUnion>({});
  const [searchResults, setSearchResults] = useState<SearchResponseElement[] | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [temporalSearchValue, setTemporalSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(temporalSearchValue, DEFAULT_SEARCH_DEBOUNCE_MS);
  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOrder | undefined>({
    field: 'scientificName',
    direction: 'Ascending',
  });

  const columns = useMemo(
    (): TableColumnType[] => [
      {
        key: 'scientificName',
        name: strings.SPECIES,
        type: 'string',
        tooltipTitle: strings.TOOLTIP_SCIENTIFIC_NAME,
      },
      {
        key: 'commonName',
        name: strings.COMMON_NAME,
        type: 'string',
        tooltipTitle: strings.TOOLTIP_COMMON_NAME,
      },
      { key: 'facilityInventories', name: strings.NURSERIES, type: 'string' },
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

  const onSearchSortOrder = useCallback(
    (order: SearchSortOrder) => {
      const isClientSorted = BE_SORTED_FIELDS.indexOf(order.field) === -1;
      setSearchSortOrder(isClientSorted ? undefined : order);
    },
    [setSearchSortOrder]
  );

  const onApplyFilters = useCallback(async () => {
    if (selectedOrganization) {
      const requestId = Math.random().toString();
      setRequestId('searchInventory', requestId);

      const showEmptySpecies = (filters.showEmptySpecies || [])[0] === 'true';

      setReportData({
        organizationId: selectedOrganization.id,
        query: debouncedSearchTerm,
        facilityIds: filters.facilityIds,
        searchSortOrder,
      });

      const apiSearchResults = await NurseryInventoryService.searchSpeciesInventory({
        organizationId: selectedOrganization.id,
        query: debouncedSearchTerm,
        facilityIds: filters.facilityIds,
        searchSortOrder,
      });

      const updatedResult = apiSearchResults?.map((result) => {
        const resultTyped = result as SpeciesInventoryResult;
        const facilityInventoriesNames =
          resultTyped.inventory?.facilityInventories?.map((nursery) => nursery.facility_name) || [];

        return {
          id: resultTyped.id,
          scientificName: resultTyped.scientificName,
          commonName: resultTyped.commonName,
          germinatingQuantity: resultTyped.inventory
            ? numberFormatter.format(Number(resultTyped.inventory['germinatingQuantity(raw)']))
            : '0',
          hardeningOffQuantity: resultTyped.inventory
            ? numberFormatter.format(Number(resultTyped.inventory['hardeningOffQuantity(raw)']))
            : '0',
          activeGrowthQuantity: resultTyped.inventory
            ? numberFormatter.format(Number(resultTyped.inventory['activeGrowthQuantity(raw)']))
            : '0',
          readyQuantity: resultTyped.inventory
            ? numberFormatter.format(Number(resultTyped.inventory['readyQuantity(raw)']))
            : '0',
          totalQuantity: resultTyped.inventory
            ? numberFormatter.format(Number(resultTyped.inventory['totalQuantity(raw)']))
            : '0',
          facilityInventories: facilityInventoriesNames.join('\r'),
          inventory: resultTyped.inventory,
        };
      });

      const filteredResult = updatedResult?.filter((result) => showEmptySpecies || !isSpeciesEmpty(result));

      if (updatedResult && getRequestId('searchInventory') === requestId) {
        const hasInventory = apiSearchResults?.some((speciesInventory) => !!speciesInventory.inventory) || false;
        setShowResults(showEmptySpecies || hasInventory);
        setSearchResults(filteredResult || []);
      }
    }
  }, [filters, debouncedSearchTerm, selectedOrganization, searchSortOrder, numberFormatter, setReportData]);

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
        {strings.BY_SPECIES}
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
          origin='Species'
          emptyTableMessage={
            !debouncedSearchTerm && !filters.facilityIds?.length ? strings.NO_BATCHES_WITH_INVENTORY : ''
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
