import {
  EditableTableInstanceV2,
  getColumnPinPositionV2,
  getColumnPinningV2,
  setColumnPinningV2,
} from '@terraware/web-components';
import {
  DropdownOption,
  MRT_Column,
  MRT_RowData,
  MRT_TableInstance,
  MRT_Updater,
  getDefaultColumnOrderIds,
} from 'material-react-table';

import type { TableSettings } from './tableSettings';

export type ViewTableColumn = {
  id: string;
  header: string;
  filterVariant?: string;
  filterSelectOptions?: DropdownOption[];
  isVisible: boolean;
  isPinned: boolean;
};

export type ViewTable = {
  getSettings: () => TableSettings;
  getInitialSettings: () => Partial<TableSettings>;
  getColumns: () => ViewTableColumn[];
  getVisibleColumnsInDisplayOrder: () => ViewTableColumn[];
  setColumnFilters: (value: TableSettings['columnFilters']) => void;
  setColumnOrder: (value: TableSettings['columnOrder']) => void;
  setColumnPinning: (value: MRT_Updater<TableSettings['columnPinning']>) => void;
  setColumnVisibility: (value: TableSettings['columnVisibility']) => void;
  setGlobalFilter: (value: string) => void;
  setSorting: (value: TableSettings['sorting']) => void;
};

export type CurrentViewTable<TData extends MRT_RowData> = MRT_TableInstance<TData> | EditableTableInstanceV2<TData>;
export type TableSource<TData extends MRT_RowData> = CurrentViewTable<TData> | ViewTable;

export const isDataColumnId = (columnId: string) => !columnId.startsWith('mrt-');

const fromMrtTable = <TData extends MRT_RowData>(table: MRT_TableInstance<TData>): ViewTable => {
  const toViewColumn = (column: MRT_Column<TData>): ViewTableColumn => ({
    id: column.id,
    header: typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id,
    filterVariant: column.columnDef.filterVariant,
    filterSelectOptions: column.columnDef.filterSelectOptions,
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
  const toViewColumn = (column: ReturnType<typeof table.getAllLeafColumns>[number]): ViewTableColumn => ({
    id: column.id,
    header: typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id,
    filterVariant: column.columnDef.meta?.filterVariant,
    filterSelectOptions: column.columnDef.meta?.filterSelectOptions,
    isVisible: column.getIsVisible(),
    isPinned: !!getColumnPinPositionV2(column),
  });
  return {
    getSettings: () => {
      const state = table.store.get();
      return {
        columnFilters: state.columnFilters,
        columnOrder: state.columnOrder,
        columnPinning: getColumnPinningV2(table),
        columnVisibility: state.columnVisibility,
        globalFilter: state.globalFilter ?? '',
        sorting: state.sorting,
      };
    },
    getInitialSettings: () => {
      const state = table.initialState;
      return {
        columnFilters: state.columnFilters,
        columnOrder: state.columnOrder,
        columnPinning: { left: state.columnPinning.start, right: state.columnPinning.end },
        columnVisibility: state.columnVisibility,
        globalFilter: state.globalFilter,
        sorting: state.sorting,
      };
    },
    getColumns: () => table.getAllLeafColumns().map(toViewColumn),
    getVisibleColumnsInDisplayOrder: () =>
      [
        ...table.getStartVisibleLeafColumns(),
        ...table.getCenterVisibleLeafColumns(),
        ...table.getEndVisibleLeafColumns(),
      ].map(toViewColumn),
    setColumnFilters: (value) => table.setColumnFilters(value),
    setColumnOrder: (value) => table.setColumnOrder(value.filter(isDataColumnId)),
    setColumnPinning: (value) => setColumnPinningV2(table, value),
    setColumnVisibility: (value) => table.setColumnVisibility(value),
    setGlobalFilter: (value) => table.setGlobalFilter(value),
    setSorting: (value) => table.setSorting(value),
  };
};

export const toViewTable = <TData extends MRT_RowData>(table: TableSource<TData>): ViewTable => {
  if ('getSettings' in table) {
    return table;
  }
  return 'getState' in table ? fromMrtTable(table) : fromEditableTableV2(table);
};
