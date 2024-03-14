import React, { RefObject, useCallback, useEffect, useMemo, useState } from 'react';

import { Container, Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { RendererProps, SortOrder, TableColumnType, TableRowType } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import SearchFiltersWrapperV2, { FilterConfig } from 'src/components/common/SearchFiltersWrapperV2';
import { OrderPreservedTable as Table } from 'src/components/common/table';
import { useLocalization } from 'src/providers';
import { FieldNodePayload, SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import useDebounce from 'src/utils/useDebounce';

interface TableWithSearchFiltersProps {
  cellRenderer?: (props: RendererProps<TableRowType>) => JSX.Element;
  columns: (activeLocale: string | null) => TableColumnType[];
  defaultSearchOrder: SearchSortOrder;
  dispatchSearchRequest: (locale: string | null, search: SearchNodePayload, searchSortOrder: SearchSortOrder) => void;
  extraTableFilters?: SearchNodePayload[];
  pageHeaderRef: RefObject<HTMLDivElement>;
  featuredFilters?: FilterConfig[];
  filterModifiers?: (filters: FilterConfig[]) => FilterConfig[];
  fuzzySearchColumns?: string[];
  rows: TableRowType[];
  tableId: string;
}

const useStyles = makeStyles(() => ({
  mainContainer: {
    padding: 0,
  },
}));

const TableWithSearchFilters = ({
  cellRenderer,
  columns,
  defaultSearchOrder,
  dispatchSearchRequest,
  extraTableFilters,
  featuredFilters,
  filterModifiers,
  fuzzySearchColumns,
  pageHeaderRef,
  rows,
  tableId,
}: TableWithSearchFiltersProps) => {
  const { activeLocale } = useLocalization();
  const classes = useStyles();

  const [filters, setFilters] = useState<Record<string, SearchNodePayload>>({});
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(searchValue, 250);
  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOrder>(defaultSearchOrder);

  const onSortChange = (order: SortOrder, orderBy: string) =>
    setSearchSortOrder({
      field: orderBy,
      direction: order === 'asc' ? 'Ascending' : 'Descending',
    });

  const getSearchPayload = useCallback((): SearchNodePayload => {
    const searchNodeChildren: SearchNodePayload[] = [];

    // Apply search field to search API payload
    if (debouncedSearchTerm && fuzzySearchColumns) {
      const fuzzySearchValueChildren = fuzzySearchColumns.map(
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
  }, [debouncedSearchTerm, filters, fuzzySearchColumns, extraTableFilters]);

  const _featuredFilters = useMemo(() => {
    if (!featuredFilters) {
      return undefined;
    }

    return filterModifiers ? filterModifiers(featuredFilters) : featuredFilters;
  }, [featuredFilters, filterModifiers]);

  useEffect(() => {
    const search: SearchNodePayload = getSearchPayload();
    dispatchSearchRequest(activeLocale, search, searchSortOrder);
  }, [activeLocale, dispatchSearchRequest, getSearchPayload, searchSortOrder]);

  return (
    <Container ref={pageHeaderRef} maxWidth={false} className={classes.mainContainer}>
      <Card flushMobile>
        <Grid item xs={12} sx={{ display: 'flex', marginBottom: '16px', alignItems: 'center' }}>
          <SearchFiltersWrapperV2
            search={searchValue}
            onSearch={setSearchValue}
            currentFilters={filters}
            setCurrentFilters={setFilters}
            featuredFilters={_featuredFilters}
          />
        </Grid>

        <Grid item xs={12}>
          <Table
            id={tableId}
            columns={columns(activeLocale)}
            rows={rows}
            orderBy={searchSortOrder.field}
            order={searchSortOrder.direction === 'Ascending' ? 'asc' : 'desc'}
            Renderer={cellRenderer}
            sortHandler={onSortChange}
          />
        </Grid>
      </Card>
    </Container>
  );
};

export default TableWithSearchFilters;
