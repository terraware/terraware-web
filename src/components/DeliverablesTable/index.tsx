import React, { RefObject, useCallback, useEffect, useMemo, useState } from 'react';
import { Container, Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { SortOrder, TableColumnType } from '@terraware/web-components';
import strings from 'src/strings';
import { FieldNodePayload, SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { DeliverableCategories, DeliverableStatuses, SearchResponseDeliverable } from 'src/types/Deliverables';
import { useLocalization } from 'src/providers';
import useDebounce from 'src/utils/useDebounce';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { selectDeliverablesSearchRequest } from 'src/redux/features/deliverables/deliverablesSelectors';
import { requestDeliverablesSearch } from 'src/redux/features/deliverables/deliverablesAsyncThunks';
import Card from 'src/components/common/Card';
import SearchFiltersWrapperV2, { FilterConfig } from 'src/components/common/SearchFiltersWrapperV2';
import { BaseTable as Table } from 'src/components/common/table';
import DeliverableCellRenderer from './DeliverableCellRenderer';

interface DeliverablesTableProps {
  columns: (activeLocale: string | null) => TableColumnType[];
  extraTableFilters?: SearchNodePayload[];
  isAcceleratorConsole?: boolean;
  organizationId: number;
  pageHeaderRef: RefObject<HTMLDivElement>;
}

const useStyles = makeStyles(() => ({
  mainContainer: {
    padding: 0,
  },
}));

const FUZZY_SEARCH_COLUMNS = ['name', 'project_name'];

const DeliverablesTable = ({
  columns,
  extraTableFilters,
  isAcceleratorConsole,
  pageHeaderRef,
  organizationId,
}: DeliverablesTableProps) => {
  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();
  const classes = useStyles();

  const [deliverables, setDeliverables] = useState<SearchResponseDeliverable[]>([]);
  const [deliverablesSearchRequestId, setDeliverablesSearchRequestId] = useState('');
  const deliverablesSearchRequest = useAppSelector(selectDeliverablesSearchRequest(deliverablesSearchRequestId));

  const [filters, setFilters] = useState<Record<string, SearchNodePayload>>({});
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(searchValue, 250);
  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOrder>({
    field: 'deliverableName',
    direction: 'Ascending',
  } as SearchSortOrder);

  const featuredFilters: FilterConfig[] = useMemo(
    () =>
      activeLocale
        ? [
            {
              field: 'status',
              // These options are strings for now, but may end up as enums when the BE types come through, if that is
              // the case we will need to implement the renderOption and pillValueRenderer to render the desired
              // human readable values
              options: DeliverableStatuses,
              label: strings.STATUS,
            },
            {
              field: 'category',
              // Same note as above
              options: DeliverableCategories,
              label: strings.CATEGORY,
            },
          ]
        : [],
    [activeLocale]
  );

  const onSortChange = (order: SortOrder, orderBy: string) =>
    setSearchSortOrder({
      field: orderBy,
      direction: order === 'asc' ? 'Ascending' : 'Descending',
    });

  const getSearchPayload = useCallback((): SearchNodePayload => {
    const searchNodeChildren: SearchNodePayload[] = [];

    // Apply search field to search API payload
    if (debouncedSearchTerm) {
      const fuzzySearchValueChildren = FUZZY_SEARCH_COLUMNS.map(
        (field: string): FieldNodePayload => ({
          operation: 'field',
          field,
          type: 'Fuzzy',
          values: [debouncedSearchTerm],
        })
      );

      searchNodeChildren.push({
        operation: 'or',
        children: fuzzySearchValueChildren,
      });
    }

    // Apply filters to search API payload
    if (Object.keys(filters).length > 0) {
      const filterValueChildren = Object.keys(filters)
        .filter((field: string) => (filters[field]?.values || []).length > 0)
        .map((field: string): SearchNodePayload => filters[field]);

      searchNodeChildren.push({
        operation: 'and',
        children: filterValueChildren,
      });
    }

    // Apply filters that are outside the table but pertinent to the view (like participants or projects)
    if (extraTableFilters) {
      extraTableFilters.forEach((searchNodeChild: SearchNodePayload) => {
        searchNodeChildren.push(searchNodeChild);
      });
    }

    return {
      operation: 'and',
      children: searchNodeChildren,
    };
  }, [debouncedSearchTerm, filters, extraTableFilters]);

  useEffect(() => {
    const search: SearchNodePayload = getSearchPayload();
    const request = dispatch(requestDeliverablesSearch({ organizationId, search, searchSortOrder }));
    setDeliverablesSearchRequestId(request.requestId);
  }, [dispatch, getSearchPayload, organizationId, searchSortOrder]);

  useEffect(() => {
    // TODO do something if the request has an error
    if (deliverablesSearchRequest && deliverablesSearchRequest.data) {
      setDeliverables(deliverablesSearchRequest.data);
    }
  }, [deliverablesSearchRequest]);

  return (
    <Container ref={pageHeaderRef} maxWidth={false} className={classes.mainContainer}>
      <Card flushMobile>
        <Grid item xs={12} sx={{ display: 'flex', marginBottom: '16px', alignItems: 'center' }}>
          <SearchFiltersWrapperV2
            search={searchValue}
            onSearch={setSearchValue}
            currentFilters={filters}
            setCurrentFilters={setFilters}
            featuredFilters={featuredFilters}
          />
        </Grid>

        <Grid item xs={12}>
          <Table
            columns={columns(activeLocale)}
            rows={deliverables}
            orderBy={searchSortOrder.field}
            order={searchSortOrder.direction === 'Ascending' ? 'asc' : 'desc'}
            Renderer={DeliverableCellRenderer(isAcceleratorConsole)}
            sortHandler={onSortChange}
          />
        </Grid>
      </Card>
    </Container>
  );
};

export default DeliverablesTable;
