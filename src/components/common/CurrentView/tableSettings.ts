import dayjs from 'dayjs';
import { isEqual } from 'lodash';
import {
  MRT_ColumnFiltersState,
  MRT_ColumnOrderState,
  MRT_ColumnPinningState,
  MRT_RowData,
  MRT_SortingState,
  MRT_TableInstance,
  MRT_VisibilityState,
} from 'material-react-table';

import normalizePersistedColumnFilters from 'src/utils/tableColumnFilters';

export type TableSettings = {
  columnFilters: MRT_ColumnFiltersState;
  columnOrder: MRT_ColumnOrderState;
  columnPinning: MRT_ColumnPinningState;
  columnVisibility: MRT_VisibilityState;
  globalFilter: string;
  sorting: MRT_SortingState;
};

export const getTableSettings = <TData extends MRT_RowData>(table: MRT_TableInstance<TData>): TableSettings => {
  const state = table.getState();
  return {
    columnFilters: state.columnFilters,
    columnOrder: state.columnOrder,
    columnPinning: state.columnPinning,
    columnVisibility: state.columnVisibility,
    globalFilter: state.globalFilter ?? '',
    sorting: state.sorting,
  };
};

export const getDefaultTableSettings = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
  overrides?: Partial<TableSettings>
): TableSettings => {
  const { initialState } = table;
  return {
    columnFilters: initialState.columnFilters ?? [],
    columnOrder: initialState.columnOrder ?? [],
    columnPinning: initialState.columnPinning ?? {},
    columnVisibility: initialState.columnVisibility ?? {},
    globalFilter: initialState.globalFilter ?? '',
    sorting: initialState.sorting ?? [],
    ...overrides,
  };
};

export const applyTableSettings = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
  settings: Partial<TableSettings>,
  defaults: TableSettings
) => {
  table.setColumnFilters(normalizePersistedColumnFilters(settings.columnFilters ?? defaults.columnFilters));
  table.setColumnOrder(settings.columnOrder ?? defaults.columnOrder);
  table.setColumnPinning(settings.columnPinning ?? defaults.columnPinning);
  table.setColumnVisibility(settings.columnVisibility ?? defaults.columnVisibility);
  table.setGlobalFilter(settings.globalFilter ?? defaults.globalFilter);
  table.setSorting(settings.sorting ?? defaults.sorting);
};

const isEmptyFilter = (filter: { value: unknown }) =>
  filter.value === undefined ||
  filter.value === '' ||
  (Array.isArray(filter.value) && filter.value.every((value) => value === undefined || value === ''));

const nonEmptyFilters = (filters: MRT_ColumnFiltersState) => filters.filter((filter) => !isEmptyFilter(filter));

const toComparableFilterValue = (value: unknown) => {
  if (dayjs.isDayjs(value)) {
    return value.isValid() ? value.toISOString() : null;
  }
  return value ?? '';
};

const comparableFilters = (filters: MRT_ColumnFiltersState) =>
  nonEmptyFilters(filters).map((filter) => ({
    ...filter,
    value: Array.isArray(filter.value)
      ? filter.value.map(toComparableFilterValue)
      : toComparableFilterValue(filter.value),
  }));

const isDataColumnId = (columnId: string) => !columnId.startsWith('mrt-');

const normalizePinning = (pinning: MRT_ColumnPinningState) => ({
  left: (pinning.left ?? []).filter(isDataColumnId),
  right: (pinning.right ?? []).filter(isDataColumnId),
});

export const isTableModified = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
  viewSettings: Partial<TableSettings>,
  defaults: TableSettings
) => {
  const current = getTableSettings(table);
  const view = { ...defaults, ...viewSettings };
  const columns = table.getAllFlatColumns().filter((column) => isDataColumnId(column.id));

  const columnVisibilityChanged = columns.some(
    (column) => (current.columnVisibility[column.id] ?? true) !== (view.columnVisibility[column.id] ?? true)
  );

  const unpinnedVisibleColumnIds = columns
    .filter((column) => column.getIsVisible() && !column.getIsPinned())
    .map((column) => column.id);
  const orderColumns = (order: MRT_ColumnOrderState) => [
    ...order.filter((columnId) => unpinnedVisibleColumnIds.includes(columnId)),
    ...unpinnedVisibleColumnIds.filter((columnId) => !order.includes(columnId)),
  ];

  return (
    columnVisibilityChanged ||
    !isEqual(orderColumns(current.columnOrder), orderColumns(view.columnOrder)) ||
    !isEqual(comparableFilters(current.columnFilters), comparableFilters(view.columnFilters)) ||
    current.globalFilter !== (view.globalFilter || '') ||
    !isEqual(current.sorting, view.sorting) ||
    !isEqual(normalizePinning(current.columnPinning), normalizePinning(view.columnPinning))
  );
};
