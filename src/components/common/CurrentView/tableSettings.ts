import {
  MRT_ColumnFiltersState,
  MRT_ColumnOrderState,
  MRT_ColumnPinningState,
  MRT_RowData,
  MRT_SortingState,
  MRT_TableInstance,
  MRT_VisibilityState,
} from 'material-react-table';

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
