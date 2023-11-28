import InventoryTable from 'src/components/InventoryV2/InventoryTable';
import { CircularProgress, Container, Theme } from '@mui/material';
import EmptyStatePage from 'src/components/emptyStatePages/EmptyStatePage';
import React, { useCallback, useEffect, useState } from 'react';
import { SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import NurseryInventoryService, { BE_SORTED_FIELDS, SearchInventoryParams } from 'src/services/NurseryInventoryService';
import { useOrganization } from 'src/providers';
import useDebounce from 'src/utils/useDebounce';
import useForm from 'src/utils/useForm';
import { InventoryFiltersType } from 'src/components/Inventory/InventoryFiltersPopover';
import { FacilitySpeciesInventoryResult } from 'src/components/InventoryV2';
import { makeStyles } from '@mui/styles';
import strings from 'src/strings';
import { TableColumnType } from '@terraware/web-components';
import Card from 'src/components/common/Card';

const useStyles = makeStyles((theme: Theme) => ({
  mainContainer: {
    padding: '32px 0',
  },
  spinnerContainer: {
    position: 'fixed',
    top: '50%',
    left: '50%',
  },
}));

const columns = (): TableColumnType[] => [
  { key: 'facility_name', name: strings.NURSERY, type: 'string' },
  {
    key: 'facilityInventories',
    name: strings.SPECIES,
    type: 'string',
    tooltipTitle: strings.TOOLTIP_SCIENTIFIC_NAME,
  },
  {
    key: 'germinatingQuantity',
    name: strings.GERMINATING,
    type: 'string',
    tooltipTitle: strings.TOOLTIP_GERMINATING_QUANTITY,
  },
  {
    key: 'notReadyQuantity',
    name: strings.NOT_READY,
    type: 'string',
    tooltipTitle: strings.TOOLTIP_NOT_READY_QUANTITY,
  },
  { key: 'readyQuantity', name: strings.READY, type: 'string', tooltipTitle: strings.TOOLTIP_READY_QUANTITY },
  { key: 'totalQuantity', name: strings.TOTAL, type: 'string', tooltipTitle: strings.TOOLTIP_TOTAL_QUANTITY },
];

type InventoryListByNurseryProps = {
  setReportData: (data: SearchInventoryParams) => void;
};

export default function InventoryListByNursery({ setReportData }: InventoryListByNurseryProps) {
  const classes = useStyles();
  const { selectedOrganization } = useOrganization();
  const [searchResults, setSearchResults] = useState<SearchResponseElement[] | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [temporalSearchValue, setTemporalSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(temporalSearchValue, 250);

  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOrder | undefined>({
    field: 'facility_name',
    direction: 'Ascending',
  });
  const [filters, setFilters] = useForm<InventoryFiltersType>({});

  const onSearchSortOrder = (order: SearchSortOrder) => {
    const isClientSorted = BE_SORTED_FIELDS.indexOf(order.field) === -1;
    setSearchSortOrder(isClientSorted ? undefined : order);
  };

  const onApplyFilters = useCallback(async () => {
    const requestId = Math.random().toString();
    setRequestId('searchInventory', requestId);

    setReportData({
      organizationId: selectedOrganization.id,
      query: debouncedSearchTerm,
      facilityIds: filters.facilityIds,
      searchSortOrder,
    });

    const apiSearchResults = await NurseryInventoryService.searchInventoryByNursery({
      organizationId: selectedOrganization.id,
      query: debouncedSearchTerm,
      facilityIds: filters.facilityIds,
      searchSortOrder,
    });

    const updatedResult = apiSearchResults?.map((result) => {
      const resultTyped = result as FacilitySpeciesInventoryResult;
      const speciesNames = resultTyped.facilityInventories.map((species) => species.species_scientificName);
      return { ...resultTyped, facilityInventories: speciesNames.join('\r') };
    });

    if (updatedResult) {
      if (!debouncedSearchTerm && !filters.facilityIds?.length) {
        setShowResults(updatedResult.length > 0);
      }
      if (getRequestId('searchInventory') === requestId) {
        setSearchResults(updatedResult);
      }
    }
  }, [filters, debouncedSearchTerm, selectedOrganization, searchSortOrder, setReportData]);

  useEffect(() => {
    onApplyFilters();
  }, [filters, onApplyFilters]);

  return (
    <Card style={{ minWidth: 'fit-content' }}>
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
        />
      ) : searchResults === null ? (
        <div className={classes.spinnerContainer}>
          <CircularProgress />
        </div>
      ) : (
        <Container maxWidth={false} className={classes.mainContainer}>
          <EmptyStatePage backgroundImageVisible={false} pageName={'Inventory'} reloadData={onApplyFilters} />
        </Container>
      )}
    </Card>
  );
}
