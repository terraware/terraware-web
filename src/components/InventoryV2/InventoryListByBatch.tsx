import InventoryTable from 'src/components/InventoryV2/InventoryTable';
import { CircularProgress, Container, Theme } from '@mui/material';
import EmptyStatePage from 'src/components/emptyStatePages/EmptyStatePage';
import React, { useCallback, useEffect, useState } from 'react';
import { SearchNodePayload, SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import { BE_SORTED_FIELDS, SearchInventoryParams } from 'src/services/NurseryInventoryService';
import { useOrganization } from 'src/providers';
import useDebounce from 'src/utils/useDebounce';
import useForm from 'src/utils/useForm';
import { InventoryFiltersType } from 'src/components/InventoryV2/InventoryFilter';
import { BatchInventoryResult, InventoryResultWithBatchNumber } from 'src/components/InventoryV2';
import { makeStyles } from '@mui/styles';
import strings from 'src/strings';
import { TableColumnType } from '@terraware/web-components';
import { NurseryBatchService } from 'src/services';
import Card from 'src/components/common/Card';
import { isBatchEmpty } from 'src/components/InventoryV2/FilterUtils';
import useQuery from 'src/utils/useQuery';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { selectSubLocations } from 'src/redux/features/subLocations/subLocationsSelectors';
import { requestSubLocations } from 'src/redux/features/subLocations/subLocationsThunks';
import { useHistory } from 'react-router-dom';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import { SubLocation } from 'src/types/Facility';
import isEnabled from 'src/features';

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
  { key: 'quantitiesMenu', name: '', type: 'string' },
];

type InventoryListByBatchProps = {
  setReportData: (data: SearchInventoryParams) => void;
};

export default function InventoryListByBatch({ setReportData }: InventoryListByBatchProps) {
  const classes = useStyles();
  const { selectedOrganization } = useOrganization();
  const [searchResults, setSearchResults] = useState<SearchResponseElement[] | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [temporalSearchValue, setTemporalSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(temporalSearchValue, 250);
  const featureFlagProjects = isEnabled('Projects');

  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOrder | undefined>({
    field: 'batchNumber',
    direction: 'Ascending',
  });
  const [filters, setFilters] = useForm<InventoryFiltersType>({});

  const dispatch = useAppDispatch();
  const subLocations: SubLocation[] | undefined = useAppSelector(selectSubLocations);
  const [subLocationNames, setSubLocationNames] = useState<string[]>([]);
  const [nurseryIds, setNurseryIds] = useState<number[]>([]);
  const query = useQuery();
  useEffect(() => {
    const querySubLocationNames = query.getAll('subLocationName')?.filter((s) => s !== '');
    setSubLocationNames(querySubLocationNames ?? []);
    const queryNurseryIds = query
      .getAll('facilityId')
      ?.filter((n) => n !== '')
      ?.map((id) => Number(id));
    setNurseryIds(queryNurseryIds ?? []);
  }, [query]);

  useEffect(() => {
    setFilters((f) => ({ ...f, facilityIds: nurseryIds }));
  }, [nurseryIds, setFilters]);

  useEffect(() => {
    dispatch(requestSubLocations(filters.facilityIds ?? []));
  }, [filters.facilityIds, dispatch]);

  useEffect(() => {
    const subLocationsIds = subLocationNames
      .map((name) => subLocations?.find((sl) => sl.name === name)?.id)
      .filter((id): id is number => id !== undefined);
    setFilters((f) => ({ ...f, subLocationsIds }));
  }, [subLocationNames, subLocations, setFilters]);

  const history = useHistory();
  const location = useStateLocation();
  const updateFilterQueryParams = useCallback(
    (f: InventoryFiltersType) => {
      const newQuery = new URLSearchParams();
      f.facilityIds?.forEach((n) => newQuery.append('facilityId', n.toString()));
      f.subLocationsIds
        ?.map((id) => subLocations?.find((sl) => sl.id === id)?.name ?? '')
        ?.filter((name) => name !== '')
        ?.forEach((name) => newQuery.append('subLocationName', name));
      newQuery.append('tab', 'batches_by_batch');
      history.replace(getLocation(location.pathname, location, newQuery.toString()));
    },
    [history, location, subLocations]
  );

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
      subLocationIds: filters.subLocationsIds,
      searchSortOrder,
    });

    const searchFields = [];
    if (filters.projectIds && filters.projectIds.length > 0) {
      searchFields.push({
        operation: 'field',
        field: 'project_id',
        type: 'Exact',
        values: filters.projectIds.map((id) => id.toString()),
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

    const showEmptyBatches = (filters.showEmptyBatches || [])[0] === 'true';
    updatedResult = updatedResult?.filter((result) => showEmptyBatches || !isBatchEmpty(result));

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
          setFilters={(f) => {
            setFilters(f);
            updateFilterQueryParams(f);
          }}
          setSearchSortOrder={onSearchSortOrder}
          isPresorted={!!searchSortOrder}
          columns={() =>
            featureFlagProjects ? columns() : columns().filter((column) => column.key !== 'project_name')
          }
          reloadData={onApplyFilters}
          origin='Batches'
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
