import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Container, Grid } from '@mui/material';
import { SortOrder, TableColumnType, TableRowType } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import SearchFiltersWrapperV2, { FilterConfig } from 'src/components/common/SearchFiltersWrapperV2';
import { default as OrderPreservedTable, OrderPreservedTablePropsFull } from 'src/components/common/table';
import { useLocalization } from 'src/providers';
import { FieldNodePayload, SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { parseSearchTerm } from 'src/utils/search';
import useDebounce from 'src/utils/useDebounce';

interface TableWithSearchFiltersProps extends Omit<OrderPreservedTablePropsFull<TableRowType>, 'columns' | 'orderBy'> {
  busy?: boolean;
  columns: (activeLocale: string | null) => TableColumnType[];
  defaultSearchOrder: SearchSortOrder;
  dispatchSearchRequest: (locale: string | null, search: SearchNodePayload, searchSortOrder: SearchSortOrder) => void;
  extraTableFilters?: SearchNodePayload[];
  featuredFilters?: FilterConfig[];
  filterModifiers?: (filters: FilterConfig[]) => FilterConfig[];
  fuzzySearchColumns?: string[];
  rightComponent?: React.ReactNode;
  title?: string;
}

const TableWithSearchFilters = (props: TableWithSearchFiltersProps) => {
  const {
    columns,
    busy,
    defaultSearchOrder,
    dispatchSearchRequest,
    extraTableFilters,
    featuredFilters,
    filterModifiers,
    fuzzySearchColumns,
    rightComponent,
    title,
    ...tableProps
  } = props;

  const { activeLocale } = useLocalization();

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
      const { type, values } = parseSearchTerm(debouncedSearchTerm);
      const fuzzySearchValueChildren = fuzzySearchColumns.map(
        (field: string): FieldNodePayload => ({
          field,
          operation: 'field',
          type,
          values,
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

  // reset filters when extraTableFilters change
  useEffect(() => {
    setFilters((_filters) => {
      const newFilters = { ..._filters };
      Object.keys(newFilters)?.forEach((key) => {
        const filter = {
          ...newFilters[key],
          values: [],
        };
        newFilters[key] = filter;
      });
      return newFilters;
    });
  }, [extraTableFilters]);

  return (
    <Container maxWidth={false} sx={{ padding: 0 }}>
      <Card busy={busy} flushMobile rightComponent={rightComponent} title={title}>
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
          <OrderPreservedTable
            {...tableProps}
            columns={() => columns(activeLocale)}
            orderBy={searchSortOrder.field}
            order={searchSortOrder.direction === 'Ascending' ? 'asc' : 'desc'}
            sortHandler={onSortChange}
          />
        </Grid>
      </Card>
    </Container>
  );
};

export default TableWithSearchFilters;
