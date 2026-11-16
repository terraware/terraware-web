import {
  EditableTableInstance,
  TableSettings,
  applyTableSettings as applySettings,
  getInitialTableSettings,
  getTableColumns,
  getTableSettings,
  isDataColumnId,
} from '@terraware/web-components';
import dayjs from 'dayjs';
import { isEqual } from 'lodash';
import {
  MRT_ColumnFiltersState,
  MRT_ColumnOrderState,
  MRT_ColumnPinningState,
  MRT_RowData,
} from 'material-react-table';

import normalizePersistedColumnFilters from 'src/utils/tableColumnFilters';

export type { TableSettings } from '@terraware/web-components';
export { getTableSettings, isDataColumnId } from '@terraware/web-components';

export const getDefaultTableSettings = <TData extends MRT_RowData>(
  table: EditableTableInstance<TData>,
  overrides?: Partial<TableSettings>
): TableSettings => {
  return {
    ...getInitialTableSettings(table),
    ...overrides,
  };
};

export const applyTableSettings = <TData extends MRT_RowData>(
  table: EditableTableInstance<TData>,
  settings: Partial<TableSettings>,
  defaults: TableSettings
) => {
  applySettings(table, {
    columnFilters: normalizePersistedColumnFilters(settings.columnFilters ?? defaults.columnFilters),
    columnOrder: settings.columnOrder ?? defaults.columnOrder,
    columnPinning: settings.columnPinning ?? defaults.columnPinning,
    columnVisibility: settings.columnVisibility ?? defaults.columnVisibility,
    globalFilter: settings.globalFilter ?? defaults.globalFilter,
    sorting: settings.sorting ?? defaults.sorting,
  });
};

export const isBlankFilterValue = (value: unknown) => value === undefined || value === null || value === '';

const isEmptyFilter = (filter: { value: unknown }) =>
  isBlankFilterValue(filter.value) || (Array.isArray(filter.value) && filter.value.every(isBlankFilterValue));

export const nonEmptyFilters = (filters: MRT_ColumnFiltersState) => filters.filter((filter) => !isEmptyFilter(filter));

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

const normalizePinning = (pinning: MRT_ColumnPinningState) => ({
  left: (pinning.left ?? []).filter(isDataColumnId),
  right: (pinning.right ?? []).filter(isDataColumnId),
});

export const isTableModified = <TData extends MRT_RowData>(
  table: EditableTableInstance<TData>,
  viewSettings: Partial<TableSettings>,
  defaults: TableSettings
) => {
  const current = getTableSettings(table);
  const view = { ...defaults, ...viewSettings };
  const columns = getTableColumns(table, 'definition').filter((column) => isDataColumnId(column.id));

  const columnVisibilityChanged = columns.some(
    (column) => (current.columnVisibility[column.id] ?? true) !== (view.columnVisibility[column.id] ?? true)
  );

  const unpinnedVisibleColumnIds = columns
    .filter((column) => column.isVisible && !column.pinned)
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
