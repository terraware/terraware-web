import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Container, Grid } from '@mui/material';
import { SortOrder, TableColumnType, TableRowType } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import SearchFiltersWrapperV2, {
  FilterConfig,
  FilterConfigWithValues,
} from 'src/components/common/SearchFiltersWrapperV2';
import { defaultSearchNodeCreator } from 'src/components/common/SearchFiltersWrapperV2/FeaturedFilters';
import { default as OrderPreservedTable, OrderPreservedTablePropsFull } from 'src/components/common/table';
import TableSettingsButton from 'src/components/common/table/TableSettingsButton';
import { useLocalization } from 'src/providers';
import { FieldNodePayload, SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { useSessionFilters } from 'src/utils/filterHooks/useSessionFilters';
import { parseSearchTerm } from 'src/utils/search';
import { SearchOrderConfig, searchAndSort } from 'src/utils/searchAndSort';
import useDebounce from 'src/utils/useDebounce';

export interface ClientSideFilterTableProps
  extends Omit<OrderPreservedTablePropsFull<TableRowType>, 'columns' | 'orderBy'> {
  busy?: boolean;
  columns: (activeLocale: string | null) => TableColumnType[];
  rows: TableRowType[];
  defaultSortOrder: SearchSortOrder;
  extraTableFilters?: SearchNodePayload[];
  featuredFilters?: FilterConfigWithValues[];
  filterModifiers?: (filters: FilterConfig[]) => FilterConfig[];
  fuzzySearchColumns?: string[];
  rightComponent?: React.ReactNode;
  title?: string;
  clientSortedFields?: string[];
  onFilterApplied?: (filter: string, values: (string | number | null)[]) => void;
  stickyFilters?: boolean;
  iconFilters?: FilterConfig[];
}

const ClientSideFilterTable = (props: ClientSideFilterTableProps) => {
  const {
    id,
    columns,
    busy,
    defaultSortOrder,
    extraTableFilters,
    featuredFilters,
    filterModifiers,
    fuzzySearchColumns,
    rightComponent,
    title,
    clientSortedFields,
    onFilterApplied,
    stickyFilters,
    iconFilters,
    rows,
    ...tableProps
  } = props;

  const { activeLocale } = useLocalization();

  const [filters, setFilters] = useState<Record<string, SearchNodePayload>>({});
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(searchValue, 250);
  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOrder | undefined>(defaultSortOrder);
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

  // set current filters if any featuredFilters has initial value, but not if we have sticky filters
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

  const _featuredFilters = useMemo(() => {
    if (!featuredFilters) {
      return undefined;
    }

    return filterModifiers ? filterModifiers(featuredFilters) : featuredFilters;
  }, [featuredFilters, filterModifiers]);

  const _filteredSortedRows = useMemo(() => {
    const search: SearchNodePayload = getSearchPayload();
    const numberFields = columns(activeLocale)
      .filter((col) => col.type === 'number')
      .map((col) => col.key);

    let searchOrderConfig: SearchOrderConfig | undefined;
    if (activeLocale && searchSortOrder) {
      searchOrderConfig = {
        locale: activeLocale,
        sortOrder: searchSortOrder,
        numberFields: numberFields,
      };
    }

    if (searchSortOrder) {
      return searchAndSort(rows, search, searchOrderConfig);
    }

    return rows;
  }, [
    rows,
    searchSortOrder,
    debouncedSearchTerm,
    filters,
    fuzzySearchColumns,
    extraTableFilters,
    getSearchPayload,
    activeLocale,
  ]);

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
            iconFilters={iconFilters}
          />
        </Grid>

        <Grid item xs={12}>
          <OrderPreservedTable
            {...tableProps}
            rows={_filteredSortedRows}
            columns={() => columns(activeLocale)}
            orderBy={searchSortOrder?.field || defaultSortOrder.field}
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

export default ClientSideFilterTable;
