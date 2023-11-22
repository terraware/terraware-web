import InventoryTable from 'src/components/InventoryV2/InventoryTable';
import { Box, CircularProgress, Container, Theme, useTheme } from '@mui/material';
import EmptyStatePage from 'src/components/emptyStatePages/EmptyStatePage';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import NurseryInventoryService, { BE_SORTED_FIELDS, SearchInventoryParams } from 'src/services/NurseryInventoryService';
import { useOrganization, useUser } from 'src/providers';
import { useNumberFormatter } from 'src/utils/useNumber';
import useDebounce from 'src/utils/useDebounce';
import useForm from 'src/utils/useForm';
import { InventoryFiltersType } from 'src/components/Inventory/InventoryFiltersPopover';
import { FacilityInventoryResult, InventoryResultWithSpeciesNames } from 'src/components/InventoryV2';
import { makeStyles } from '@mui/styles';
import strings from 'src/strings';
import { TableColumnType } from '@terraware/web-components';
import { getAllNurseries } from 'src/utils/organization';
import { Facility } from 'src/types/Facility';

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
    key: 'speciesNames',
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
  const theme = useTheme();
  const classes = useStyles();
  const { selectedOrganization } = useOrganization();
  const [searchResults, setSearchResults] = useState<SearchResponseElement[] | null>();
  const [unfilteredInventory, setUnfilteredInventory] = useState<SearchResponseElement[] | null>(null);
  const [temporalSearchValue, setTemporalSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(temporalSearchValue, 250);

  const [nurseries, setNurseries] = useState<Facility[]>([]);
  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOrder | undefined>({
    field: 'species_scientificName',
    direction: 'Ascending',
  });
  const [filters, setFilters] = useForm<InventoryFiltersType>({});

  const { user } = useUser();
  const numberFormatter = useNumberFormatter();
  const numericFormatter = useMemo(() => numberFormatter(user?.locale), [user?.locale, numberFormatter]);

  useEffect(() => {
    setNurseries(getAllNurseries(selectedOrganization));
  }, [selectedOrganization]);

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
      facilityIds: filters.facilityIds || nurseries.map((nr) => nr.id),
      searchSortOrder,
    });
    const apiSearchResults = await NurseryInventoryService.searchInventoryByNursery({
      organizationId: selectedOrganization.id,
      query: debouncedSearchTerm,
      facilityIds: filters.facilityIds || nurseries.map((nr) => nr.id),
      searchSortOrder,
    });

    let updatedResult: InventoryResultWithSpeciesNames[] | undefined = [];

    const nextResults = apiSearchResults?.reduce((acc, result) => {
      const resultTyped = result as FacilityInventoryResult;
      const indexFound = acc.findIndex((savedResult) => savedResult.facility_id === resultTyped.facility_id);

      if (indexFound > -1) {
        const existingFacility = acc[indexFound];
        acc[indexFound] = {
          ...existingFacility,
          germinatingQuantity: (
            Number(existingFacility.germinatingQuantity) + Number(resultTyped['germinatingQuantity(raw)'])
          ).toString(),
          notReadyQuantity: (
            Number(existingFacility.notReadyQuantity) + Number(resultTyped['notReadyQuantity(raw)'])
          ).toString(),
          readyQuantity: (
            Number(existingFacility.readyQuantity) + Number(resultTyped['readyQuantity(raw)'])
          ).toString(),
          totalQuantity: (
            Number(existingFacility.totalQuantity) + Number(resultTyped['totalQuantity(raw)'])
          ).toString(),
          speciesNames: `${existingFacility.speciesNames}, ${resultTyped.species_scientificName}`,
        };
      } else {
        const transformedResult: InventoryResultWithSpeciesNames = {
          facility_id: resultTyped.facility_id,
          facility_name: resultTyped.facility_name,
          species_id: resultTyped.species_id,
          species_scientificName: resultTyped.species_scientificName,
          species_commonName: resultTyped.species_commonName,
          germinatingQuantity: resultTyped['germinatingQuantity(raw)'],
          notReadyQuantity: resultTyped['notReadyQuantity(raw)'],
          readyQuantity: resultTyped['readyQuantity(raw)'],
          totalQuantity: resultTyped['totalQuantity(raw)'],
          speciesNames: resultTyped.species_scientificName,
        };

        acc.push(transformedResult);
      }
      return acc;
    }, [] as InventoryResultWithSpeciesNames[]);

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

    if (updatedResult) {
      if (!debouncedSearchTerm && !filters.facilityIds?.length) {
        setUnfilteredInventory(updatedResult);
      }
      if (getRequestId('searchInventory') === requestId) {
        setSearchResults(updatedResult);
      }
    }
  }, [filters, debouncedSearchTerm, selectedOrganization, searchSortOrder, numericFormatter, nurseries, setReportData]);

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
          columns={columns}
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
