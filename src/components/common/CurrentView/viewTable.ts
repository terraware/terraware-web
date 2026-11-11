import { EditableTableInstanceV2 } from '@terraware/web-components';
import {
  MRT_Column,
  MRT_ColumnFiltersState,
  MRT_ColumnOrderState,
  MRT_ColumnPinningState,
  MRT_RowData,
  MRT_SortingState,
  MRT_TableInstance,
  MRT_VisibilityState,
  getDefaultColumnOrderIds,
} from 'material-react-table';

import type { TableSettings } from './tableSettings';

export type ViewTableColumn = {
  id: string;
  header: string;
  filterVariant?: string;
  filterSelectOptions?: unknown[];
  isVisible: boolean;
  isPinned: boolean;
};

export type ViewTable = {
  getSettings: () => TableSettings;
  getInitialSettings: () => Partial<TableSettings>;
  getColumns: () => ViewTableColumn[];
  getVisibleColumnsInDisplayOrder: () => ViewTableColumn[];
  setColumnFilters: (columnFilters: MRT_ColumnFiltersState) => void;
  setColumnOrder: (columnOrder: MRT_ColumnOrderState) => void;
  setColumnPinning: (columnPinning: MRT_ColumnPinningState) => void;
  setColumnVisibility: (columnVisibility: MRT_VisibilityState) => void;
  setGlobalFilter: (globalFilter: string) => void;
  setSorting: (sorting: MRT_SortingState) => void;
};

export type CurrentViewTable<TData extends MRT_RowData> = MRT_TableInstance<TData> | EditableTableInstanceV2<TData>;

export type TableSource<TData extends MRT_RowData> = MRT_TableInstance<TData> | ViewTable;

export const isDataColumnId = (columnId: string) => !columnId.startsWith('mrt-');

const isMrtTable = <TData extends MRT_RowData>(table: TableSource<TData>): table is MRT_TableInstance<TData> =>
  'getState' in table;

const fromMrtTable = <TData extends MRT_RowData>(table: MRT_TableInstance<TData>): ViewTable => {
  const toViewColumn = (column: MRT_Column<TData>) => ({
    id: column.id,
    header: typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id,
    filterVariant: column.columnDef.filterVariant,
    filterSelectOptions: Array.isArray(column.columnDef.filterSelectOptions)
      ? column.columnDef.filterSelectOptions
      : undefined,
    isVisible: column.getIsVisible(),
    isPinned: !!column.getIsPinned(),
  });

  return {
    getSettings: () => {
      const state = table.getState();
      return {
        columnFilters: state.columnFilters,
        columnOrder: state.columnOrder,
        columnPinning: state.columnPinning,
        columnVisibility: state.columnVisibility,
        globalFilter: state.globalFilter ?? '',
        sorting: state.sorting,
      };
    },
    getInitialSettings: () => table.initialState,
    getColumns: () => table.getAllLeafColumns().map(toViewColumn),
    getVisibleColumnsInDisplayOrder: () =>
      [
        ...table.getLeftVisibleLeafColumns(),
        ...table.getCenterVisibleLeafColumns(),
        ...table.getRightVisibleLeafColumns(),
      ].map((column) => toViewColumn(column as MRT_Column<TData>)),
    setColumnFilters: table.setColumnFilters,
    setColumnOrder: (columnOrder) =>
      table.setColumnOrder(
        getDefaultColumnOrderIds({
          ...table.options,
          state: { ...table.getState(), columnOrder: columnOrder.filter(isDataColumnId) },
        })
      ),
    setColumnPinning: table.setColumnPinning,
    setColumnVisibility: table.setColumnVisibility,
    setGlobalFilter: table.setGlobalFilter,
    setSorting: table.setSorting,
  };
};

export const fromEditableTableV2 = <TData extends MRT_RowData>(table: EditableTableInstanceV2<TData>): ViewTable => {
  const toViewColumn = (column: ReturnType<EditableTableInstanceV2<TData>['getAllLeafColumns']>[number]) => ({
    id: column.id,
    header: typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id,
    filterVariant: column.columnDef.meta?.filterVariant,
    filterSelectOptions: column.columnDef.meta?.filterSelectOptions,
    isVisible: column.getIsVisible(),
    isPinned: !!column.getIsPinned(),
  });

  return {
    getSettings: () => {
      const state = table.store.state;
      return {
        columnFilters: state.columnFilters,
        columnOrder: state.columnOrder,
        columnPinning: { left: state.columnPinning.start, right: state.columnPinning.end },
        columnVisibility: state.columnVisibility,
        globalFilter: (state.globalFilter as string | undefined) ?? '',
        sorting: state.sorting,
      };
    },
    getInitialSettings: () => {
      const { initialState } = table;
      return {
        columnFilters: initialState.columnFilters,
        columnOrder: initialState.columnOrder,
        columnPinning: { left: initialState.columnPinning.start, right: initialState.columnPinning.end },
        columnVisibility: initialState.columnVisibility,
        globalFilter: initialState.globalFilter as string | undefined,
        sorting: initialState.sorting,
      };
    },
    getColumns: () => table.getAllLeafColumns().map(toViewColumn),
    getVisibleColumnsInDisplayOrder: () =>
      [
        ...table.getStartVisibleLeafColumns(),
        ...table.getCenterVisibleLeafColumns(),
        ...table.getEndVisibleLeafColumns(),
      ].map(toViewColumn),
    setColumnFilters: (columnFilters) => table.setColumnFilters(columnFilters),
    setColumnOrder: (columnOrder) => table.setColumnOrder(columnOrder),
    setColumnPinning: (columnPinning) =>
      table.setColumnPinning({ start: columnPinning.left ?? [], end: columnPinning.right ?? [] }),
    setColumnVisibility: (columnVisibility) => table.setColumnVisibility(columnVisibility),
    setGlobalFilter: (globalFilter) => table.setGlobalFilter(globalFilter),
    setSorting: (sorting) => table.setSorting(sorting),
  };
};

export const toViewTable = <TData extends MRT_RowData>(table: TableSource<TData>): ViewTable =>
  isMrtTable(table) ? fromMrtTable(table) : table;

export const toTableSource = <TData extends MRT_RowData>(table: CurrentViewTable<TData>): TableSource<TData> =>
  'getState' in table ? table : fromEditableTableV2(table);
