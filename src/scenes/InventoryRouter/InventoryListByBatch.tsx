import React, { useCallback, useEffect, useState } from 'react';

import { Box, CircularProgress, Container, Typography, useTheme } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import EmptyStatePage from 'src/components/emptyStatePages/EmptyStatePage';
import { useOrganization } from 'src/providers';
import { isBatchEmpty } from 'src/scenes/InventoryRouter/FilterUtils';
import { InventoryFiltersUnion } from 'src/scenes/InventoryRouter/InventoryFilter';
import InventoryTable from 'src/scenes/InventoryRouter/InventoryTable';
import { BatchInventoryResult, InventoryResultWithBatchNumber } from 'src/scenes/InventoryRouter/InventoryV2View';
import { NurseryBatchService } from 'src/services';
import { BE_SORTED_FIELDS, SearchInventoryParams } from 'src/services/NurseryInventoryService';
import strings from 'src/strings';
import { SearchNodePayload, SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import useDebounce from 'src/utils/useDebounce';
import useForm from 'src/utils/useForm';

const columns = (): TableColumnType[] => [
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
    key: 'germinatingQuantity',
    name: strings.GERMINATING,
    type: 'number',
    tooltipTitle: strings.TOOLTIP_GERMINATING_QUANTITY,
  },
  {
    key: 'notReadyQuantity',
    name: strings.NOT_READY,
    type: 'number',
    tooltipTitle: strings.TOOLTIP_NOT_READY_QUANTITY,
  },
  {
    key: 'readyQuantity',
    name: strings.READY,
    type: 'number',
    tooltipTitle: strings.TOOLTIP_READY_QUANTITY,
  },
  {
    key: 'totalQuantity',
    name: strings.TOTAL,
    type: 'number',
    tooltipTitle: strings.TOOLTIP_TOTAL_QUANTITY,
  },
  { key: 'quantitiesMenu', name: '', type: 'string' },
];

type InventoryListByBatchProps = {
  setReportData: (data: SearchInventoryParams) => void;
};

export default function InventoryListByBatch({ setReportData }: InventoryListByBatchProps) {
  const { selectedOrganization } = useOrganization();
  const [searchResults, setSearchResults] = useState<SearchResponseElement[] | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [temporalSearchValue, setTemporalSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(temporalSearchValue, 250);

  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOrder | undefined>({
    field: 'batchNumber',
    direction: 'Ascending',
  });
  const [filters, setFilters] = useForm<InventoryFiltersUnion>({});
  const theme = useTheme();

  const onSearchSortOrder = (order: SearchSortOrder) => {
    const isClientSorted = BE_SORTED_FIELDS.indexOf(order.field) === -1;
    setSearchSortOrder(isClientSorted ? undefined : order);
  };

  const onApplyFilters = useCallback(async () => {
    const requestId = Math.random().toString();
    setRequestId('searchInventory', requestId);

    const showEmptyBatches = (filters.showEmptyBatches || [])[0] === 'true';

    setReportData({
      organizationId: selectedOrganization.id,
      query: debouncedSearchTerm,
      facilityIds: filters.facilityIds,
      subLocationIds: filters.subLocationsIds,
      searchSortOrder,
      showEmptyBatches,
    });

    const searchFields = [];
    if (filters.projectIds && filters.projectIds.length > 0) {
      searchFields.push({
        operation: 'field',
        field: 'project_id',
        type: 'Exact',
        values: filters.projectIds.map((id) => (id === null ? id : id.toString())),
      } as SearchNodePayload);
    }

    const apiSearchResults = await NurseryBatchService.getAllBatches(
      selectedOrganization.id,
      searchSortOrder,
      filters.facilityIds,
      filters.subLocationsIds,
      debouncedSearchTerm,
      undefined,
      searchFields
    );

    const processedResults = apiSearchResults?.map((result) => {
      let subLocationsList = '';
      (result.subLocations as any[])?.forEach((sl, index) => {
        if (index === 0) {
          subLocationsList = sl.subLocation_name;
        } else {
          subLocationsList += `\r${sl.subLocation_name}`;
        }
      });

      return {
        ...result,
        subLocations: subLocationsList,
      };
    });

    let updatedResult: InventoryResultWithBatchNumber[] | undefined;

    // format results
    updatedResult = processedResults?.map((uR) => {
      const resultTyped = uR as BatchInventoryResult;
      return {
        ...resultTyped,
        batchId: resultTyped.id,
        species_scientificName_noLink: resultTyped.species_scientificName,
        facility_name_noLink: resultTyped.facility_name,
      } as InventoryResultWithBatchNumber;
    });

    updatedResult = updatedResult?.filter((result) => showEmptyBatches || !isBatchEmpty(result));

    if (updatedResult) {
      if (!debouncedSearchTerm && !filters.facilityIds?.length && !filters.projectIds?.length) {
        setShowResults(updatedResult.length > 0);
      }
      if (getRequestId('searchInventory') === requestId) {
        setSearchResults(updatedResult);
      }
    }
  }, [filters, debouncedSearchTerm, selectedOrganization, searchSortOrder, setReportData]);

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
        {strings.BY_BATCH}
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
          reloadData={onApplyFilters}
          origin='Batches'
          allowSelectionProjectAssign
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
          <EmptyStatePage pageName={'Inventory'} reloadData={onApplyFilters} />
        </Container>
      )}
    </Card>
  );
}
