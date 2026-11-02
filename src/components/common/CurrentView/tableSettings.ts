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
