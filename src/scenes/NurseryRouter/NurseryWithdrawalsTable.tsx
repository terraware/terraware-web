import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Grid } from '@mui/material';
import { SortOrder } from '@terraware/web-components';
import { TableColumnType } from '@terraware/web-components/components/table/types';

import { FilterField } from 'src/components/common/FilterGroup';
import SearchFiltersWrapper, {
  FeaturedFilterConfig,
  SearchFiltersProps,
} from 'src/components/common/SearchFiltersWrapper';
import Table from 'src/components/common/table';
import { APP_PATHS } from 'src/constants';
import { DEFAULT_SEARCH_DEBOUNCE_MS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization } from 'src/providers';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { useAppSelector } from 'src/redux/store';
import WithdrawalLogRenderer from 'src/scenes/NurseryRouter/WithdrawalLogRenderer';
import { NurseryWithdrawalService } from 'src/services';
import strings from 'src/strings';
import { Project } from 'src/types/Project';
import {
  AndNodePayload,
  FieldNodePayload,
  FieldOptionsMap,
  NotNodePayload,
  OrNodePayload,
  SearchNodePayload,
  SearchResponseElement,
  SearchSortOrder,
} from 'src/types/Search';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import { parseSearchTerm } from 'src/utils/search';
import useDebounce from 'src/utils/useDebounce';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

const columns = (): TableColumnType[] => [
  { key: 'withdrawnDate', name: strings.DATE, type: 'string' },
  { key: 'purpose', name: strings.PURPOSE, type: 'string' },
  { key: 'facility_name', name: strings.FROM_NURSERY, type: 'string' },
  { key: 'destinationName', name: strings.DESTINATION, type: 'string' },
  { key: 'project_names', name: strings.PROJECTS, type: 'string' },
  { key: 'plantingSubzoneNames', name: strings.TO_SUBZONE, type: 'string' },
  { key: 'speciesScientificNames', name: strings.SPECIES, type: 'string' },
  { key: 'totalWithdrawn', name: strings.TOTAL_QUANTITY, type: 'number' },
  { key: 'menu', name: '', type: 'string' },
];

export default function NurseryWithdrawalsTable(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { activeLocale } = useLocalization();
  const navigate = useSyncNavigate();
  const location = useStateLocation();
  const query = useQuery();
  const subzoneParam = query.get('subzoneName');
  const siteParam = query.get('siteName');

  const projects = useAppSelector(selectProjects);

  const [filters, setFilters] = useState<Record<string, SearchNodePayload>>({});
  const [searchResults, setSearchResults] = useState<SearchResponseElement[] | null>();
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(searchValue, DEFAULT_SEARCH_DEBOUNCE_MS);
  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOrder>({
    field: 'withdrawnDate',
    direction: 'Descending',
  } as SearchSortOrder);
  const [filterOptions, setFilterOptions] = useState<FieldOptionsMap>({});

  const getProjectName = useCallback(
    (projectId: number) => (projects?.find((project: Project) => project.id === projectId) || {}).name || '',
    [projects]
  );

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

  const featuredFilters: FeaturedFilterConfig[] = useMemo(
    () =>
      activeLocale
        ? [
            {
              field: 'project_id',
              options: (projects || [])?.map((project: Project) => `${project.id}`),
              searchNodeCreator: (values: (number | string | null)[]) => ({
                field: 'batchWithdrawals.batch_project_id',
                operation: 'field',
                type: 'Exact',
                values: values.map((value: number | string | null): string | null =>
                  value === null ? value : `${value}`
                ),
              }),
              label: strings.PROJECTS,
              renderOption: (id: string | number) => getProjectName(Number(id)),
              notPresentFilterShown: true,
              notPresentFilterLabel: strings.NO_PROJECT,
              pillValuesRenderer: (values: unknown[]): string | undefined => {
                if (values.length === 1 && values[0] === null) {
                  return strings.NO_PROJECT;
                }

                return values.map((value: unknown) => getProjectName(Number(value))).join(', ');
              },
            },
          ]
        : [],
    [activeLocale, getProjectName, projects]
  );

  useEffect(() => {
    if (selectedOrganization) {
      const getApiSearchResults = async () => {
        setFilterOptions(await NurseryWithdrawalService.getFilterOptions(selectedOrganization.id));
      };
      void getApiSearchResults();
    }
  }, [selectedOrganization]);

  const onWithdrawalClicked = (withdrawal: any) => {
    navigate({
      pathname: APP_PATHS.NURSERY_REASSIGNMENT.replace(':deliveryId', withdrawal.delivery_id),
    });
  };

  const reload = () => {
    void onApplyFilters();
  };

  const getSearchChildren = useCallback(() => {
    const { type, values } = parseSearchTerm(debouncedSearchTerm);
    const finalSearchValueChildren: SearchNodePayload[] = [];
    const searchValueChildren: SearchNodePayload[] = [];
    if (debouncedSearchTerm) {
      const fromNurseryNode: FieldNodePayload = {
        operation: 'field',
        field: 'facility_name',
        type,
        values,
      };
      searchValueChildren.push(fromNurseryNode);

      const destinationNurseryNode: FieldNodePayload = {
        operation: 'field',
        field: 'destinationName',
        type,
        values,
      };
      searchValueChildren.push(destinationNurseryNode);

      const speciesNameNode: FieldNodePayload = {
        operation: 'field',
        field: 'batchWithdrawals.batch_species_scientificName',
        type,
        values,
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

    // If the batch was deleted before we added the server-side logic to deal with deleting batches
    // that have withdrawals, there won't be any batchWithdrawals values. In that case, we can't
    // show the species name or the total withdrawn. Filter withdrawals without batches out since
    // they're useless to show.
    const batchExistsNode: NotNodePayload = {
      operation: 'not',
      child: {
        operation: 'field',
        field: 'batchWithdrawals.batch_id',
        type: 'Exact',
        values: [null],
      },
    };
    finalSearchValueChildren.push(batchExistsNode);

    return finalSearchValueChildren;
  }, [filters, debouncedSearchTerm]);

  const onApplyFilters = useCallback(async () => {
    if (selectedOrganization) {
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
    }
  }, [getSearchChildren, selectedOrganization, searchSortOrder, filters]);

  useEffect(() => {
    if (siteParam) {
      query.delete('siteName');
      navigate(getLocation(location.pathname, location, query.toString()), { replace: true });
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
  }, [siteParam, query, navigate, location]);

  useEffect(() => {
    if (subzoneParam) {
      query.delete('subzoneName');
      navigate(getLocation(location.pathname, location, query.toString()), { replace: true });
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
  }, [subzoneParam, query, navigate, location]);

  useEffect(() => {
    void onApplyFilters();
  }, [filters, onApplyFilters]);

  const onSortChange = (order: SortOrder, orderBy: string) => {
    const orderByStr = orderBy === 'speciesScientificNames' ? 'batchWithdrawals.batch_species_scientificName' : orderBy;
    setSearchSortOrder({
      field: orderByStr,
      direction: order === 'asc' ? 'Ascending' : 'Descending',
    });
  };

  return (
    <Grid container>
      <Grid item xs={12} sx={{ display: 'flex', marginBottom: '16px', alignItems: 'center' }}>
        <SearchFiltersWrapper
          search={searchValue}
          onSearch={setSearchValue}
          filtersProps={filtersProps}
          featuredFilters={featuredFilters}
        />
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
          reloadData={reload}
        />
      </Grid>
    </Grid>
  );
}
