import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Container, Grid } from '@mui/material';
import { SortOrder, TableColumnType, TableRowType } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import SearchFiltersWrapperV2, {
  FilterConfig,
  FilterConfigWithValues,
} from 'src/components/common/SearchFiltersWrapperV2';
import { default as OrderPreservedTable, OrderPreservedTablePropsFull } from 'src/components/common/table';
import TableSettingsButton from 'src/components/common/table/TableSettingsButton';
import { useLocalization } from 'src/providers';
import { FieldNodePayload, SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { useSessionFilters } from 'src/utils/filterHooks/useSessionFilters';
import { parseSearchTerm } from 'src/utils/search';
import useDebounce from 'src/utils/useDebounce';

import { defaultSearchNodeCreator } from '../common/SearchFiltersWrapperV2/FeaturedFilters';

export interface TableWithSearchFiltersProps
  extends Omit<OrderPreservedTablePropsFull<TableRowType>, 'columns' | 'orderBy'> {
  busy?: boolean;
  columns: (activeLocale: string | null) => TableColumnType[];
  defaultSearchOrder: SearchSortOrder;
  dispatchSearchRequest: (locale: string | null, search: SearchNodePayload, searchSortOrder: SearchSortOrder) => void;
  extraTableFilters?: SearchNodePayload[];
  featuredFilters?: FilterConfigWithValues[];
  filterModifiers?: (filters: FilterConfig[]) => FilterConfig[];
  fuzzySearchColumns?: string[];
  rightComponent?: React.ReactNode;
  title?: string;
  clientSortedFields?: string[];
  onFilterApplied?: (filter: string, values: (string | number | null)[]) => void;
  stickyFilters?: boolean;
}

const TableWithSearchFilters = (props: TableWithSearchFiltersProps) => {
  const {
    id,
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
    clientSortedFields,
    onFilterApplied,
    stickyFilters,
    ...tableProps
  } = props;

  const { activeLocale } = useLocalization();

  const [filters, setFilters] = useState<Record<string, SearchNodePayload>>({});
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(searchValue, 250);
  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOrder | undefined>(defaultSearchOrder);
  const { sessionFilters } = useSessionFilters(id);

  const onSortChangeHandler = (order: SearchSortOrder) => {
    const isClientSorted = clientSortedFields ? clientSortedFields.indexOf(order.field) > -1 : false;
    setSearchSortOrder(isClientSorted ? undefined : order);
  };

  const onSortChange = (order: SortOrder, orderBy: string) => {
    onSortChangeHandler({
      field: orderBy,
      direction: order === 'asc' ? 'Ascending' : 'Descending',
    });
  };

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
    if (searchSortOrder) {
      dispatchSearchRequest(activeLocale, search, searchSortOrder);
    }
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

  // set current filters if any featuredFilters has initial value, but not if we have sticky fitlers
  useEffect(() => {
    if (!sessionFilters) {
      // Wait for session filters to finish loading
      return;
    }

    if (stickyFilters && Object.keys(sessionFilters).length > 0) {
      return;
    }

    const filtersWithValues = featuredFilters?.filter((ff) => ff.values && ff.values.length > 0);
    if (filtersWithValues && filtersWithValues.length > 0) {
      const newCurrentFilters = filtersWithValues.reduce(
        (
          acc: {
            [x: string]: SearchNodePayload;
          },
          filter: FilterConfigWithValues
        ): {
          [x: string]: SearchNodePayload;
        } => ({
          ...acc,
          [filter.field]: filter.searchNodeCreator
            ? filter.searchNodeCreator(filter.values || [])
            : defaultSearchNodeCreator(filter.field, filter.values || []),
        }),
        {} as {
          [x: string]: SearchNodePayload;
        }
      );
      setFilters(newCurrentFilters);
    }
  }, [featuredFilters, sessionFilters, stickyFilters]);

  return (
    <Container maxWidth={false} sx={{ padding: 0 }} disableGutters>
      <Card busy={busy} flushMobile rightComponent={rightComponent} title={title}>
        <Grid item xs={12} sx={{ display: 'flex', marginBottom: '16px', alignItems: 'center' }}>
          <SearchFiltersWrapperV2
            tableId={id}
            search={searchValue}
            onSearch={setSearchValue}
            currentFilters={filters}
            setCurrentFilters={setFilters}
            featuredFilters={_featuredFilters}
            rightComponent={<TableSettingsButton />}
            onFilterApplied={onFilterApplied}
            stickyFilters={stickyFilters}
          />
        </Grid>

        <Grid item xs={12}>
          <OrderPreservedTable
            {...tableProps}
            columns={() => columns(activeLocale)}
            orderBy={searchSortOrder?.field || defaultSearchOrder.field}
            order={searchSortOrder?.direction === 'Ascending' ? 'asc' : 'desc'}
            sortHandler={onSortChange}
            isPresorted={!!searchSortOrder}
            id={id}
          />
        </Grid>
      </Card>
    </Container>
  );
};

export default TableWithSearchFilters;
