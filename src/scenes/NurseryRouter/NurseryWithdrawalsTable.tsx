import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Grid } from '@mui/material';
import { SortOrder } from '@terraware/web-components';
import { TableColumnType } from '@terraware/web-components/components/table/types';
import { ColumnHeader } from 'export-to-csv/output/lib/types';

import { FilterField } from 'src/components/common/FilterGroup';
import SearchFiltersWrapper, {
  FeaturedFilterConfig,
  SearchFiltersProps,
} from 'src/components/common/SearchFiltersWrapper';
import { ExportTableProps } from 'src/components/common/SearchFiltersWrapper/ExportTableComponent';
import Table from 'src/components/common/table';
import { APP_PATHS, DEFAULT_SEARCH_DEBOUNCE_MS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization } from 'src/providers';
import { PlantingProgress } from 'src/redux/features/plantings/plantingsSelectors';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { useAppSelector } from 'src/redux/store';
import WithdrawalLogRenderer from 'src/scenes/NurseryRouter/WithdrawalLogRenderer';
import { NurseryWithdrawalService } from 'src/services';
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
import { CsvData } from 'src/utils/csv';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import { parseSearchTerm } from 'src/utils/search';
import useDebounce from 'src/utils/useDebounce';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

export default function NurseryWithdrawalsTable(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { strings } = useLocalization();
  const navigate = useSyncNavigate();
  const location = useStateLocation();
  const query = useQuery();
  const subzoneParam = query.get('subzoneName');
  const siteParam = query.get('siteName');

  const projects = useAppSelector(selectProjects);

  const [filters, setFilters] = useState<Record<string, SearchNodePayload>>({});
  const [rows, setRows] = useState<SearchResponseElement[] | null>();
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(searchValue, DEFAULT_SEARCH_DEBOUNCE_MS);
  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOrder | undefined>({
    field: 'withdrawnDate',
    direction: 'Descending',
  } as SearchSortOrder);
  const [filterOptions, setFilterOptions] = useState<FieldOptionsMap>({});

  const getProjectName = useCallback(
    (projectId: number) => (projects?.find((project: Project) => project.id === projectId) || {}).name || '',
    [projects]
  );

  const columns = useMemo<TableColumnType[]>(
    () => [
      { key: 'withdrawnDate', name: strings.DATE, type: 'string' },
      { key: 'purpose', name: strings.PURPOSE, type: 'string' },
      { key: 'facility_name', name: strings.FROM_NURSERY, type: 'string' },
      { key: 'destinationName', name: strings.DESTINATION, type: 'string' },
      { key: 'project_names', name: strings.PROJECTS, type: 'string' },
      { key: 'plantingSubzoneNames', name: strings.TO_SUBZONE, type: 'string' },
      { key: 'speciesScientificNames', name: strings.SPECIES, type: 'string' },
      { key: 'totalWithdrawn', name: strings.TOTAL_QUANTITY, type: 'number' },
      { key: 'menu', name: '', type: 'string' },
    ],
    [strings]
  );

  const filterColumns = useMemo<FilterField[]>(
    () => [
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
    ],
    [strings]
  );

  const exportColumnHeaders = useMemo<ColumnHeader[]>(
    () => [
      {
        key: 'withdrawnDate',
        displayLabel: strings.DATE,
      },
      {
        key: 'purpose',
        displayLabel: strings.PURPOSE,
      },
      {
        key: 'facility_name',
        displayLabel: strings.FROM_NURSERY,
      },
      {
        key: 'destinationName',
        displayLabel: strings.DESTINATION,
      },
      {
        key: 'project_names',
        displayLabel: strings.PROJECTS,
      },
      {
        key: 'plantingSubzoneNames',
        displayLabel: strings.TO_SUBZONE,
      },
      {
        key: 'speciesScientificNames',
        displayLabel: strings.SPECIES,
      },
      {
        key: 'totalWithdrawn',
        displayLabel: strings.TOTAL_QUANTITY,
      },
    ],
    [strings]
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
    () => [
      {
        field: 'project_id',
        options: (projects || [])?.map((project: Project) => `${project.id}`),
        searchNodeCreator: (values: (number | string | null)[]) => ({
          field: 'batchWithdrawals.batch_project_id',
          operation: 'field',
          type: 'Exact',
          values: values.map((value: number | string | null): string | null => (value === null ? value : `${value}`)),
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
    ],
    [strings, getProjectName, projects]
  );

  useEffect(() => {
    if (selectedOrganization) {
      const getApiSearchResults = async () => {
        setFilterOptions(await NurseryWithdrawalService.getFilterOptions(selectedOrganization.id));
      };
      void getApiSearchResults();
    }
  }, [selectedOrganization]);

  const onWithdrawalClicked = useCallback(
    (withdrawal: any) => {
      navigate({
        pathname: APP_PATHS.NURSERY_REASSIGNMENT.replace(':deliveryId', withdrawal.delivery_id),
      });
    },
    [navigate]
  );

  const searchChildren: SearchNodePayload[] = useMemo(() => {
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

  const retrieveWithdrawals: (limit: number) => Promise<PlantingProgress[]> = useCallback(
    async (limit: number) => {
      if (selectedOrganization) {
        const requestId = Math.random().toString();
        setRequestId('searchWithdrawals', requestId);
        const apiSearchResults = await NurseryWithdrawalService.listNurseryWithdrawals(
          selectedOrganization.id,
          searchChildren,
          searchSortOrder,
          limit
        );
        if (apiSearchResults) {
          if (getRequestId('searchWithdrawals') === requestId) {
            const destinationFilter = filters.destinationName?.values ?? [];
            if (destinationFilter.length) {
              return apiSearchResults.filter(
                (result) => destinationFilter.indexOf(result.destinationName) !== -1
              ) as PlantingProgress[];
            } else {
              return apiSearchResults as PlantingProgress[];
            }
          }
        }
      }
      return [];
    },
    [filters.destinationName?.values, searchChildren, searchSortOrder, selectedOrganization]
  );

  const onApplyFilters = useCallback(async () => {
    setRows(await retrieveWithdrawals(1000));
  }, [retrieveWithdrawals]);

  const reload = useCallback(() => {
    void onApplyFilters();
  }, [onApplyFilters]);

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

  const onSortChange = useCallback(
    (order: SortOrder, orderBy: string) => {
      const orderByStr =
        orderBy === 'speciesScientificNames'
          ? 'batchWithdrawals.batch_species_scientificName'
          : orderBy === 'project_names'
            ? null
            : orderBy;
      setSearchSortOrder(
        orderByStr
          ? {
              field: orderByStr,
              direction: order === 'asc' ? 'Ascending' : 'Descending',
            }
          : undefined
      );
    },
    [setSearchSortOrder]
  );

  const isClickable = useCallback(() => false, []);

  const exportProps: ExportTableProps | undefined = useMemo(() => {
    if (!rows || rows.length === 0) {
      return;
    }
    const nurseryName = (rows[0]?.facility_name as string) || strings.UNKNOWN;
    return {
      filename: `${nurseryName}-${strings.NURSERY_WITHDRAWALS}`,
      columnHeaders: exportColumnHeaders,
      retrieveResults: () => retrieveWithdrawals(0),
      convertRow: (withdrawal: SearchResponseElement) =>
        ({
          ...withdrawal,
          project_names: (withdrawal.project_names as string[] | undefined)
            ?.filter((projectName) => !!projectName)
            .join(', '),
          speciesScientificNames: (withdrawal.speciesScientificNames as string[] | undefined)?.join(', '),
        }) as CsvData,
    };
  }, [exportColumnHeaders, retrieveWithdrawals, rows, strings.NURSERY_WITHDRAWALS, strings.UNKNOWN]);

  return (
    <Grid container>
      <Grid item xs={12} sx={{ display: 'flex', marginBottom: '16px', alignItems: 'center' }}>
        <SearchFiltersWrapper
          search={searchValue}
          onSearch={setSearchValue}
          filtersProps={filtersProps}
          featuredFilters={featuredFilters}
          exportProps={exportProps}
        />
      </Grid>

      <Grid item xs={12}>
        <Table
          id='withdrawal-log'
          columns={columns}
          rows={rows || []}
          Renderer={WithdrawalLogRenderer}
          orderBy={searchSortOrder?.field || 'project_names'}
          order={searchSortOrder?.direction === 'Ascending' ? 'asc' : 'desc'}
          isPresorted={
            searchSortOrder !== undefined && searchSortOrder.field !== 'batchWithdrawals.batch_species_scientificName'
          }
          onSelect={onWithdrawalClicked}
          controlledOnSelect={true}
          sortHandler={onSortChange}
          isClickable={isClickable}
          reloadData={reload}
        />
      </Grid>
    </Grid>
  );
}
