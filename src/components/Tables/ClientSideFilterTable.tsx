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
import { DEFAULT_SEARCH_DEBOUNCE_MS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { FieldNodePayload, SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { useSessionFilters } from 'src/utils/filterHooks/useSessionFilters';
import { parseSearchTerm } from 'src/utils/search';
import { SearchAndSortFn, SearchOrderConfig, searchAndSort as genericSearchAndSort } from 'src/utils/searchAndSort';
import useDebounce from 'src/utils/useDebounce';

export interface ClientSideFilterTableProps
  extends Omit<OrderPreservedTablePropsFull<TableRowType>, 'columns' | 'orderBy'> {
  busy?: boolean;
  clientSortedFields?: string[];
  columns: TableColumnType[] | ((activeLocale: string | null) => TableColumnType[]);
  defaultSortOrder: SearchSortOrder;
  extraComponent?: React.ReactNode;
  extraTableFilters?: SearchNodePayload[];
  featuredFilters?: FilterConfigWithValues[];
  filterModifiers?: (filters: FilterConfig[]) => FilterConfig[];
  fuzzySearchColumns?: string[];
  iconFilters?: FilterConfig[];
  onFilterApplied?: (filter: string, values: (string | number | null)[]) => void;
  rightComponent?: React.ReactNode;
  rows: TableRowType[];
  searchAndSort?: SearchAndSortFn<TableRowType>;
  stickyFilters?: boolean;
  title?: string;
}

const ClientSideFilterTable = (props: ClientSideFilterTableProps) => {
  const {
    busy,
    clientSortedFields,
    columns,
    defaultSortOrder,
    extraComponent,
    extraTableFilters,
    featuredFilters,
    filterModifiers,
    fuzzySearchColumns,
    iconFilters,
    id,
    onFilterApplied,
    rightComponent,
    rows,
    searchAndSort,
    stickyFilters,
    title,
    ...tableProps
  } = props;

  const { activeLocale } = useLocalization();

  const [filters, setFilters] = useState<Record<string, FieldNodePayload>>({});
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(searchValue, DEFAULT_SEARCH_DEBOUNCE_MS);
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
        .filter((field: string) => filters[field]?.operation === 'field' && filters[field].values.length > 0)
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
            [x: string]: FieldNodePayload;
          },
          filter: FilterConfigWithValues
        ): {
          [x: string]: FieldNodePayload;
        } => ({
          ...acc,
          [filter.field]: filter.searchNodeCreator
            ? filter.searchNodeCreator(filter.values || [])
            : defaultSearchNodeCreator(filter.field, filter.values || []),
        }),
        {} as {
          [x: string]: FieldNodePayload;
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
    const numberFields = (typeof columns === 'function' ? columns(activeLocale) : columns)
      .filter((col) => col.type === 'number')
      .map((col) => col.key);

    let searchOrderConfig: SearchOrderConfig | undefined;
    if (activeLocale && searchSortOrder) {
      searchOrderConfig = {
        locale: activeLocale,
        sortOrder: searchSortOrder,
        numberFields,
      };
    }

    if (searchSortOrder) {
      return searchAndSort
        ? searchAndSort(rows, search, searchOrderConfig)
        : genericSearchAndSort(rows, search, searchOrderConfig);
    }

    return rows;
  }, [activeLocale, columns, getSearchPayload, rows, searchAndSort, searchSortOrder]);

  const tableColumns = useMemo(
    () => (typeof columns === 'function' ? () => columns(activeLocale) : columns),
    [activeLocale, columns]
  );

  return (
    <Container disableGutters maxWidth={false} sx={{ padding: 0 }}>
      <Card busy={busy} flushMobile rightComponent={rightComponent} title={title}>
        <Grid item xs={12} sx={{ display: 'flex', marginBottom: '16px', alignItems: 'center' }}>
          <SearchFiltersWrapperV2
            currentFilters={filters}
            extraComponent={extraComponent}
            featuredFilters={_featuredFilters}
            iconFilters={iconFilters}
            onFilterApplied={onFilterApplied}
            onSearch={setSearchValue}
            rightComponent={<TableSettingsButton />}
            search={searchValue}
            setCurrentFilters={setFilters}
            stickyFilters={stickyFilters}
            tableId={id}
          />
        </Grid>

        <Grid item xs={12}>
          <OrderPreservedTable
            {...tableProps}
            columns={tableColumns}
            id={id}
            isPresorted={!!searchSortOrder}
            order={searchSortOrder?.direction === 'Ascending' ? 'asc' : 'desc'}
            orderBy={searchSortOrder?.field || defaultSortOrder.field}
            rows={_filteredSortedRows}
            sortHandler={onSortChange}
          />
        </Grid>
      </Card>
    </Container>
  );
};

export default ClientSideFilterTable;
