import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Grid } from '@mui/material';
import { SortOrder } from '@terraware/web-components';
import { Option, TableColumnType } from '@terraware/web-components/components/table/types';
import { ColumnHeader } from 'export-to-csv/output/lib/types';

import { FilterField } from 'src/components/common/FilterGroup';
import SearchFiltersWrapper, {
  FeaturedFilterConfig,
  SearchFiltersProps,
} from 'src/components/common/SearchFiltersWrapper';
import { ExportTableProps } from 'src/components/common/SearchFiltersWrapper/ExportTableComponent';
import BackendSearchTable from 'src/components/common/table/BackendSearchTable';
import { APP_PATHS, DEFAULT_SEARCH_DEBOUNCE_MS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization } from 'src/providers';
import {
  selectNurseryWithdrawalsCount,
  selectNurseryWithdrawalsFilterOptions,
  selectNurseryWithdrawalsList,
} from 'src/redux/features/nurseryWithdrawals/nurseryWithdrawalsSelectors';
import {
  requestCountNurseryWithdrawals,
  requestListNurseryWithdrawals,
  requestNurseryWithdrawalsFilterOptions,
} from 'src/redux/features/nurseryWithdrawals/nurseryWithdrawalsThunks';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import WithdrawalLogRenderer from 'src/scenes/NurseryRouter/WithdrawalLogRenderer';
import { NurseryWithdrawalPurpose, purposeLabel } from 'src/types/Batch';
import { Project } from 'src/types/Project';
import {
  AndNodePayload,
  FieldNodePayload,
  FieldOptionsMap,
  FieldValuesPayload,
  NotNodePayload,
  OrNodePayload,
  SearchNodePayload,
  SearchResponseElement,
  SearchSortOrder,
} from 'src/types/Search';
import { CsvData } from 'src/utils/csv';
import { parseSearchTerm } from 'src/utils/search';
import useDebounce from 'src/utils/useDebounce';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

const ITEMS_PER_PAGE = 100;

const DEFAULT_SORT_ORDER: SearchSortOrder = {
  field: 'withdrawnDate',
  direction: 'Descending',
};

export default function NurseryWithdrawalsTable(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { strings } = useLocalization();
  const navigate = useSyncNavigate();
  const location = useStateLocation();
  const query = useQuery();
  const substratumParam = query.get('substratumName');
  const siteParam = query.get('siteName');
  const dispatch = useAppDispatch();

  const projects = useAppSelector(selectProjects);

  const [listRequestId, setListRequestId] = useState<string>('');
  const withdrawalsListResult = useAppSelector(selectNurseryWithdrawalsList(listRequestId));
  const [countRequestId, setCountRequestId] = useState<string>('');
  const countResult = useAppSelector(selectNurseryWithdrawalsCount(countRequestId));
  const [filterOptionsRequestId, setFilterOptionsRequestId] = useState<string>('');
  const filterOptionsResult = useAppSelector(selectNurseryWithdrawalsFilterOptions(filterOptionsRequestId));

  const [exportRequestId, setExportRequestId] = useState<string>('');
  const exportResult = useAppSelector(selectNurseryWithdrawalsList(exportRequestId));

  const [filters, setFilters] = useState<Record<string, SearchNodePayload>>({});
  const [rows, setRows] = useState<SearchResponseElement[] | null>();
  const [searchValue, setSearchValue] = useState('');
  const [totalRowCount, setTotalRowCount] = useState<number>();
  const debouncedSearchTerm = useDebounce(searchValue, DEFAULT_SEARCH_DEBOUNCE_MS);
  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOrder>(DEFAULT_SORT_ORDER);
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
      { key: 'substratumNames', name: strings.TO_SUBZONE, type: 'string' },
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
      { name: 'substratumNames', label: strings.SUBZONE, type: 'multiple_selection' },
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
        key: 'substratumNames',
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
      optionsRenderer: (filterName: string, fieldValues: FieldValuesPayload): Option[] | undefined => {
        if (filterName !== 'purpose') {
          return;
        }

        return fieldValues[filterName]?.values.map(
          (value): Option => ({
            disabled: false,
            label: purposeLabel(value as NurseryWithdrawalPurpose),
            value,
          })
        );
      },
    }),
    [filterColumns, filterOptions, filters]
  );

  const featuredFilters: FeaturedFilterConfig[] = useMemo(
    () => [
      {
        field: 'project_id',
        options: (projects || [])?.map((project: Project) => project.id),
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

  useEffect(() => {
    if (selectedOrganization) {
      const request = dispatch(requestNurseryWithdrawalsFilterOptions({ organizationId: selectedOrganization.id }));
      setFilterOptionsRequestId(request.requestId);
    }
  }, [dispatch, selectedOrganization]);

  useEffect(() => {
    if (filterOptionsResult?.status === 'success' && filterOptionsResult?.data) {
      if (filterOptionsResult?.data) {
        setFilterOptions(filterOptionsResult.data);
      }
    }
  }, [filterOptionsResult]);

  useEffect(() => {
    if (countResult?.status === 'success' && countResult?.data) {
      if (countResult?.data) {
        setTotalRowCount(countResult.data);
      }
    }
  }, [countResult]);

  useEffect(() => {
    if (withdrawalsListResult?.status === 'success' && withdrawalsListResult?.data) {
      if (withdrawalsListResult?.data) {
        setRows(withdrawalsListResult.data);
      }
    }
  }, [withdrawalsListResult]);

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
    if (substratumParam) {
      query.delete('substratumName');
      navigate(getLocation(location.pathname, location, query.toString()), { replace: true });
      setFilters((curr) => ({
        ...curr,
        substratumNames: {
          field: 'substratumNames',
          operation: 'field',
          type: 'Exact',
          values: [substratumParam],
        },
      }));
    }
  }, [substratumParam, query, navigate, location]);

  const onSortChange = useCallback((order: SortOrder, orderBy: string) => {
    const orderByStr =
      orderBy === 'speciesScientificNames'
        ? 'batchWithdrawals.batch_species_scientificName'
        : orderBy === 'project_names'
          ? 'batchWithdrawals.batch_project_name'
          : orderBy;
    setSearchSortOrder(
      orderByStr
        ? {
            field: orderByStr,
            direction: order === 'asc' ? 'Ascending' : 'Descending',
          }
        : DEFAULT_SORT_ORDER
    );
  }, []);

  const isClickable = useCallback(() => false, []);

  const requestExportData = useCallback(() => {
    if (selectedOrganization) {
      const request = dispatch(
        requestListNurseryWithdrawals({
          organizationId: selectedOrganization.id,
          searchCriteria: searchChildren,
          sortOrder: searchSortOrder,
          limit: 0,
          offset: 0,
        })
      );
      setExportRequestId(request.requestId);
    }
  }, [dispatch, searchChildren, searchSortOrder, selectedOrganization]);

  const exportProps: ExportTableProps | undefined = useMemo(() => {
    if (!rows || rows.length === 0) {
      return;
    }
    const nurseryName = (rows[0]?.facility_name as string) || strings.UNKNOWN;
    return {
      filename: `${nurseryName}-${strings.NURSERY_WITHDRAWALS}`,
      columnHeaders: exportColumnHeaders,
      requestResults: requestExportData,
      resultsResponse: exportResult,
      convertRow: (withdrawal: SearchResponseElement) =>
        ({
          ...withdrawal,
          project_names: (withdrawal.project_names as string[] | undefined)
            ?.filter((projectName) => !!projectName)
            .join(', '),
          speciesScientificNames: (withdrawal.speciesScientificNames as string[] | undefined)?.join(', '),
        }) as CsvData,
    };
  }, [exportColumnHeaders, requestExportData, rows, strings, exportResult]);

  const requestCount = useCallback(() => {
    if (selectedOrganization) {
      const request = dispatch(
        requestCountNurseryWithdrawals({ organizationId: selectedOrganization.id, searchCriteria: searchChildren })
      );
      setCountRequestId(request.requestId);
    }
  }, [dispatch, searchChildren, selectedOrganization]);

  const requestResults = useCallback(
    (pageNumber: number) => {
      if (selectedOrganization) {
        const request = dispatch(
          requestListNurseryWithdrawals({
            organizationId: selectedOrganization.id,
            searchCriteria: searchChildren,
            sortOrder: searchSortOrder,
            limit: ITEMS_PER_PAGE,
            offset: (pageNumber - 1) * ITEMS_PER_PAGE,
          })
        );
        setListRequestId(request.requestId);
      }
    },
    [dispatch, searchChildren, searchSortOrder, selectedOrganization]
  );

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
        <BackendSearchTable
          id='withdrawal-log'
          columns={columns}
          rows={rows || []}
          Renderer={WithdrawalLogRenderer}
          orderBy={
            searchSortOrder.field === 'batchWithdrawals.batch_project_name' ? 'project_names' : searchSortOrder.field
          }
          order={searchSortOrder.direction === 'Ascending' ? 'asc' : 'desc'}
          onSelect={onWithdrawalClicked}
          controlledOnSelect={true}
          sortHandler={onSortChange}
          isClickable={isClickable}
          totalRowCount={totalRowCount}
          maxItemsPerPage={ITEMS_PER_PAGE}
          requestResults={requestResults}
          requestCount={requestCount}
          searchNodePayload={searchChildren}
        />
      </Grid>
    </Grid>
  );
}
