import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress, Container, Typography, useTheme } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import EmptyStatePage from 'src/components/emptyStatePages/EmptyStatePage';
import { DEFAULT_SEARCH_DEBOUNCE_MS } from 'src/constants';
import { useLocalization, useOrganization } from 'src/providers';
import { InventoryFiltersType } from 'src/scenes/InventoryRouter/InventoryFilter';
import InventoryTable from 'src/scenes/InventoryRouter/InventoryTable';
import {
  FacilityInventoryResult,
  InventoryResult,
  InventoryResultWithFacilityNames,
} from 'src/scenes/InventoryRouter/InventoryV2View';
import { NurseryBatchService } from 'src/services';
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

  const [filters, setFilters] = useForm<InventoryFiltersType>({});
  const [searchResults, setSearchResults] = useState<SearchResponseElement[] | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [temporalSearchValue, setTemporalSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(temporalSearchValue, DEFAULT_SEARCH_DEBOUNCE_MS);
  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOrder | undefined>({
    field: 'species_scientificName',
    direction: 'Ascending',
  });

  const columns = useMemo(
    (): TableColumnType[] => [
      {
        key: 'species_scientificName',
        name: strings.SPECIES,
        type: 'string',
        tooltipTitle: strings.TOOLTIP_SCIENTIFIC_NAME,
      },
      {
        key: 'species_commonName',
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
      setReportData({
        organizationId: selectedOrganization.id,
        query: debouncedSearchTerm,
        facilityIds: filters.facilityIds,
        searchSortOrder,
      });

      const allBatchesResult = await NurseryBatchService.getAllBatches(selectedOrganization.id, searchSortOrder);

      const apiSearchResults = await NurseryInventoryService.searchInventory({
        organizationId: selectedOrganization.id,
        query: debouncedSearchTerm,
        facilityIds: filters.facilityIds,
        searchSortOrder,
      });

      let updatedResult: InventoryResultWithFacilityNames[] | undefined = [];
      if (filters.facilityIds && filters.facilityIds.length) {
        const nextResults = apiSearchResults?.reduce((acc, result) => {
          const resultTyped = result as FacilityInventoryResult;
          const indexFound = acc.findIndex((res) => res.species_id === resultTyped.species_id);

          if (indexFound !== undefined && indexFound !== -1) {
            const existingSpecies = acc[indexFound];
            acc[indexFound] = {
              ...existingSpecies,
              germinatingQuantity: (
                Number(existingSpecies.germinatingQuantity) + Number(resultTyped['germinatingQuantity(raw)'])
              ).toString(),
              hardeningOffQuantity: (
                Number(existingSpecies.hardeningOffQuantity) + Number(resultTyped['hardeningOffQuantity(raw)'])
              ).toString(),
              activeGrowthQuantity: (
                Number(existingSpecies.activeGrowthQuantity) + Number(resultTyped['activeGrowthQuantity(raw)'])
              ).toString(),
              readyQuantity: (
                Number(existingSpecies.readyQuantity) + Number(resultTyped['readyQuantity(raw)'])
              ).toString(),
              totalQuantity: (
                Number(existingSpecies.totalQuantity) + Number(resultTyped['totalQuantity(raw)'])
              ).toString(),
              facilityInventories: `${existingSpecies.facilityInventories}\r${resultTyped.facility_name}`,
            };
          } else {
            const transformedResult: InventoryResultWithFacilityNames = {
              facility_id: resultTyped.facility_id,
              species_id: resultTyped.species_id,
              species_scientificName: resultTyped.species_scientificName,
              species_commonName: resultTyped.species_commonName,
              germinatingQuantity: resultTyped['germinatingQuantity(raw)'],
              hardeningOffQuantity: resultTyped['hardeningOffQuantity(raw)'],
              activeGrowthQuantity: resultTyped['activeGrowthQuantity(raw)'],
              readyQuantity: resultTyped['readyQuantity(raw)'],
              totalQuantity: resultTyped['totalQuantity(raw)'],
              facilityInventories: resultTyped.facility_name,
            };

            acc.push(transformedResult);
          }
          return acc;
        }, [] as InventoryResultWithFacilityNames[]);

        // format results
        updatedResult = nextResults?.map((uR) => {
          return {
            ...uR,
            germinatingQuantity: numberFormatter.format(Number(uR.germinatingQuantity)),
            hardeningOffQuantity: numberFormatter.format(Number(uR.hardeningOffQuantity)),
            activeGrowthQuantity: numberFormatter.format(Number(uR.activeGrowthQuantity)),
            readyQuantity: numberFormatter.format(Number(uR.readyQuantity)),
            totalQuantity: numberFormatter.format(Number(uR.totalQuantity)),
          };
        });
      } else {
        updatedResult = apiSearchResults?.map((result) => {
          const resultTyped = result as InventoryResult;
          const facilityInventoriesNames = resultTyped.facilityInventories.map((nursery) => nursery.facility_name);
          return { ...resultTyped, facilityInventories: facilityInventoriesNames.join('\r') };
        });
      }
      if (updatedResult) {
        if (getRequestId('searchInventory') === requestId) {
          setShowResults((allBatchesResult?.length || 0) > 0);
          setSearchResults(updatedResult);
        }
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
