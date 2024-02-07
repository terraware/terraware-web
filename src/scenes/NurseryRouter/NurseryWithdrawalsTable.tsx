import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Grid } from '@mui/material';
import { SortOrder } from '@terraware/web-components';
import { TableColumnType } from '@terraware/web-components/components/table/types';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import { useLocalization, useOrganization } from 'src/providers';
import useDebounce from 'src/utils/useDebounce';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import { NurseryWithdrawalService } from 'src/services';
import {
  AndNodePayload,
  FieldNodePayload,
  FieldOptionsMap,
  OrNodePayload,
  SearchNodePayload,
  SearchResponseElement,
  SearchSortOrder,
} from 'src/types/Search';
import Table from 'src/components/common/table';
import { FilterField } from 'src/components/common/FilterGroup';
import SearchFiltersWrapper, { SearchFiltersProps } from 'src/components/common/SearchFiltersWrapper';
import WithdrawalLogRenderer from 'src/scenes/NurseryRouter/WithdrawalLogRenderer';

const columns = (): TableColumnType[] => [
  { key: 'withdrawnDate', name: strings.DATE, type: 'string' },
  { key: 'purpose', name: strings.PURPOSE, type: 'string' },
  { key: 'facility_name', name: strings.FROM_NURSERY, type: 'string' },
  { key: 'destinationName', name: strings.DESTINATION, type: 'string' },
  { key: 'plantingSubzoneNames', name: strings.TO_SUBZONE, type: 'string' },
  { key: 'speciesScientificNames', name: strings.SPECIES, type: 'string' },
  { key: 'totalWithdrawn', name: strings.TOTAL_QUANTITY, type: 'number' },
  { key: 'hasReassignments', name: '', type: 'string' },
];

export default function NurseryWithdrawalsTable(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { activeLocale } = useLocalization();
  const query = useQuery();
  const history = useHistory();
  const location = useStateLocation();
  const [searchResults, setSearchResults] = useState<SearchResponseElement[] | null>();
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(searchValue, 250);
  const [filters, setFilters] = useState<Record<string, SearchNodePayload>>({});
  const subzoneParam = query.get('subzoneName');
  const siteParam = query.get('siteName');

  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOrder>({
    field: 'withdrawnDate',
    direction: 'Descending',
  } as SearchSortOrder);

  const filterColumns = useMemo<FilterField[]>(
    () =>
      activeLocale
        ? [
            { name: 'purpose', label: strings.PURPOSE, type: 'multiple_selection' },
            { name: 'facility_name', label: strings.FROM_NURSERY, type: 'multiple_selection' },
            { name: 'destinationName', label: strings.DESTINATION, type: 'multiple_selection' },
            { name: 'plantingSubzoneNames', label: strings.SUBZONE, type: 'multiple_selection' },
            {
              name: 'batchWithdrawals.batch_species_scientificName',
              label: strings.SPECIES,
              type: 'multiple_selection',
            },
            { name: 'withdrawnDate', label: strings.WITHDRAWN_DATE, type: 'date_range' },
          ]
        : [],
    [activeLocale]
  );

  const [filterOptions, setFilterOptions] = useState<FieldOptionsMap>({});

  const filtersProps: SearchFiltersProps = useMemo(
    () => ({
      filters,
      setFilters,
      filterColumns,
      filterOptions,
      noScroll: false,
    }),
    [filterColumns, filterOptions, filters]
  );

  useEffect(() => {
    const getApiSearchResults = async () => {
      setFilterOptions(await NurseryWithdrawalService.getFilterOptions(selectedOrganization.id));
    };
    void getApiSearchResults();
  }, [selectedOrganization]);

  const onWithdrawalClicked = (withdrawal: any) => {
    history.push({
      pathname: APP_PATHS.NURSERY_REASSIGNMENT.replace(':deliveryId', withdrawal.delivery_id),
    });
  };

  const getSearchChildren = useCallback(() => {
    const finalSearchValueChildren: SearchNodePayload[] = [];
    const searchValueChildren: FieldNodePayload[] = [];
    if (debouncedSearchTerm) {
      const fromNurseryNode: FieldNodePayload = {
        operation: 'field',
        field: 'facility_name',
        type: 'Fuzzy',
        values: [debouncedSearchTerm],
      };
      searchValueChildren.push(fromNurseryNode);

      const destinationNurseryNode: FieldNodePayload = {
        operation: 'field',
        field: 'destinationName',
        type: 'Fuzzy',
        values: [debouncedSearchTerm],
      };
      searchValueChildren.push(destinationNurseryNode);

      const speciesNameNode: FieldNodePayload = {
        operation: 'field',
        field: 'batchWithdrawals.batch_species_scientificName',
        type: 'Fuzzy',
        values: [debouncedSearchTerm],
      };
      searchValueChildren.push(speciesNameNode);
    }

    const filterValueChildren: SearchNodePayload[] = [...Object.values(filters)];

    if (searchValueChildren.length) {
      const searchValueNodes: OrNodePayload = {
        operation: 'or',
        children: searchValueChildren,
      };

      if (filterValueChildren.length) {
        const filterValueNodes: AndNodePayload = {
          operation: 'and',
          children: filterValueChildren,
        };

        finalSearchValueChildren.push({
          operation: 'and',
          children: [filterValueNodes, searchValueNodes],
        });
      } else {
        finalSearchValueChildren.push(searchValueNodes);
      }
    } else if (filterValueChildren.length) {
      const filterValueNodes: AndNodePayload = {
        operation: 'and',
        children: filterValueChildren,
      };
      finalSearchValueChildren.push(filterValueNodes);
    }
    return finalSearchValueChildren;
  }, [filters, debouncedSearchTerm]);

  const onApplyFilters = useCallback(async () => {
    const searchChildren: SearchNodePayload[] = getSearchChildren();
    const requestId = Math.random().toString();
    setRequestId('searchWithdrawals', requestId);
    const apiSearchResults = await NurseryWithdrawalService.listNurseryWithdrawals(
      selectedOrganization.id,
      searchChildren,
      searchSortOrder
    );
    if (apiSearchResults) {
      if (getRequestId('searchWithdrawals') === requestId) {
        const destinationFilter = filters.destinationName?.values ?? [];
        if (destinationFilter.length) {
          setSearchResults(
            apiSearchResults.filter((result) => destinationFilter.indexOf(result.destinationName) !== -1)
          );
        } else {
          setSearchResults(apiSearchResults);
        }
      }
    }
  }, [getSearchChildren, selectedOrganization, searchSortOrder, filters]);

  useEffect(() => {
    if (siteParam) {
      query.delete('siteName');
      history.replace(getLocation(location.pathname, location, query.toString()));
      setFilters((curr) => ({
        ...curr,
        destinationName: {
          field: 'destinationName',
          operation: 'field',
          type: 'Exact',
          values: [siteParam],
        },
      }));
    }
  }, [siteParam, query, history, location]);

  useEffect(() => {
    if (subzoneParam) {
      query.delete('subzoneName');
      history.replace(getLocation(location.pathname, location, query.toString()));
      setFilters((curr) => ({
        ...curr,
        plantingSubzoneNames: {
          field: 'plantingSubzoneNames',
          operation: 'field',
          type: 'Exact',
          values: [subzoneParam],
        },
      }));
    }
  }, [subzoneParam, query, history, location]);

  useEffect(() => {
    void onApplyFilters();
  }, [filters, onApplyFilters]);

  const onSortChange = (order: SortOrder, orderBy: string) => {
    const orderByStr = orderBy === 'speciesScientificNames' ? 'batchWithdrawals.batch_species_scientificName' : orderBy;
    setSearchSortOrder({
      field: orderByStr as string,
      direction: order === 'asc' ? 'Ascending' : 'Descending',
    });
  };

  return (
    <Grid container>
      <Grid item xs={12} sx={{ display: 'flex', marginBottom: '16px', alignItems: 'center' }}>
        <SearchFiltersWrapper search={searchValue} onSearch={setSearchValue} filtersProps={filtersProps} />
      </Grid>

      <Grid item xs={12}>
        <Table
          id='withdrawal-log'
          columns={columns}
          rows={searchResults || []}
          Renderer={WithdrawalLogRenderer}
          orderBy={searchSortOrder.field}
          order={searchSortOrder.direction === 'Ascending' ? 'asc' : 'desc'}
          isPresorted={searchSortOrder.field !== 'batchWithdrawals.batch_species_scientificName'}
          onSelect={onWithdrawalClicked}
          controlledOnSelect={true}
          sortHandler={onSortChange}
          isClickable={() => false}
        />
      </Grid>
    </Grid>
  );
}
