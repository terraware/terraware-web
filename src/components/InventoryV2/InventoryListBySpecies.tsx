import InventoryTable from 'src/components/InventoryV2/InventoryTable';
import { Box, CircularProgress, Container, Theme, useTheme } from '@mui/material';
import EmptyStatePage from 'src/components/emptyStatePages/EmptyStatePage';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import NurseryInventoryService, { BE_SORTED_FIELDS } from 'src/services/NurseryInventoryService';
import { useOrganization, useUser } from 'src/providers';
import { useNumberFormatter } from 'src/utils/useNumber';
import useDebounce from 'src/utils/useDebounce';
import useForm from 'src/utils/useForm';
import { InventoryFiltersType } from 'src/components/Inventory/InventoryFiltersPopover';
import { InventoryResult, FacilityInventoryResult, InventoryResultWithFacilityNames } from 'src/components/InventoryV2';
import { makeStyles } from '@mui/styles';

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

export default function InventoryListBySpecies() {
  const theme = useTheme();
  const classes = useStyles();
  const { selectedOrganization } = useOrganization();
  const [searchResults, setSearchResults] = useState<SearchResponseElement[] | null>();
  const [unfilteredInventory, setUnfilteredInventory] = useState<SearchResponseElement[] | null>(null);
  const [temporalSearchValue, setTemporalSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(temporalSearchValue, 250);
  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOrder | undefined>({
    field: 'species_scientificName',
    direction: 'Ascending',
  });
  const [filters, setFilters] = useForm<InventoryFiltersType>({});

  const { user } = useUser();
  const numberFormatter = useNumberFormatter();
  const numericFormatter = useMemo(() => numberFormatter(user?.locale), [user?.locale, numberFormatter]);

  const onSearchSortOrder = (order: SearchSortOrder) => {
    const isClientSorted = BE_SORTED_FIELDS.indexOf(order.field) === -1;
    setSearchSortOrder(isClientSorted ? undefined : order);
  };

  const onApplyFilters = useCallback(async () => {
    const requestId = Math.random().toString();
    setRequestId('searchInventory', requestId);
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
            notReadyQuantity: (
              Number(existingSpecies.notReadyQuantity) + Number(resultTyped['notReadyQuantity(raw)'])
            ).toString(),
            readyQuantity: (
              Number(existingSpecies.readyQuantity) + Number(resultTyped['readyQuantity(raw)'])
            ).toString(),
            totalQuantity: (
              Number(existingSpecies.totalQuantity) + Number(resultTyped['totalQuantity(raw)'])
            ).toString(),
            facilityInventories: `${existingSpecies.facilityInventories}, ${resultTyped.facility_name}`,
          };
        } else {
          const transformedResult: InventoryResultWithFacilityNames = {
            species_id: resultTyped.species_id,
            species_scientificName: resultTyped.species_scientificName,
            species_commonName: resultTyped.species_commonName,
            germinatingQuantity: resultTyped['germinatingQuantity(raw)'],
            notReadyQuantity: resultTyped['notReadyQuantity(raw)'],
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
          germinatingQuantity: numericFormatter.format(uR.germinatingQuantity),
          notReadyQuantity: numericFormatter.format(uR.notReadyQuantity),
          readyQuantity: numericFormatter.format(uR.readyQuantity),
          totalQuantity: numericFormatter.format(uR.totalQuantity),
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
      if (!debouncedSearchTerm && !filters.facilityIds?.length) {
        setUnfilteredInventory(updatedResult);
      }
      if (getRequestId('searchInventory') === requestId) {
        setSearchResults(updatedResult);
      }
    }
  }, [filters, debouncedSearchTerm, selectedOrganization, searchSortOrder, numericFormatter]);

  useEffect(() => {
    onApplyFilters();
  }, [filters, onApplyFilters]);

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.TwClrBg,
        borderRadius: '32px',
        padding: theme.spacing(3),
        minWidth: 'fit-content',
      }}
    >
      {unfilteredInventory && unfilteredInventory.length > 0 ? (
        <InventoryTable
          results={searchResults || []}
          temporalSearchValue={temporalSearchValue}
          setTemporalSearchValue={setTemporalSearchValue}
          filters={filters}
          setFilters={setFilters}
          setSearchSortOrder={onSearchSortOrder}
          isPresorted={!!searchSortOrder}
        />
      ) : unfilteredInventory === null ? (
        <div className={classes.spinnerContainer}>
          <CircularProgress />
        </div>
      ) : (
        <Container maxWidth={false} className={classes.mainContainer}>
          <EmptyStatePage backgroundImageVisible={false} pageName={'Inventory'} reloadData={onApplyFilters} />
        </Container>
      )}
    </Box>
  );
}
