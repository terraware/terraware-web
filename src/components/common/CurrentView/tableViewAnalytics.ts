import { isEqual } from 'lodash';
import { MRT_ColumnOrderState, MRT_RowData, MRT_TableInstance } from 'material-react-table';

import { OrganizationRole } from 'src/types/Organization';
import { User } from 'src/types/User';

import { TableSettings, isDataColumnId, nonEmptyFilters } from './tableSettings';

const GLOBAL_ROLE_PRIORITY: User['globalRoles'] = ['Super-Admin', 'Accelerator Admin', 'TF Expert', 'Read Only'];

export const getTableViewUserRole = (
  isConsole: boolean,
  user?: User,
  organizationRole?: OrganizationRole
): string | undefined =>
  isConsole ? GLOBAL_ROLE_PRIORITY.find((role) => user?.globalRoles.includes(role)) : organizationRole;

const isColumnOrderChanged = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
  columnOrder: MRT_ColumnOrderState,
  defaultColumnOrder: MRT_ColumnOrderState
) => {
  const dataColumnIds = table
    .getAllLeafColumns()
    .map((column) => column.id)
    .filter(isDataColumnId);
  const normalize = (order: MRT_ColumnOrderState) => [
    ...order.filter((columnId) => dataColumnIds.includes(columnId)),
    ...dataColumnIds.filter((columnId) => !order.includes(columnId)),
  ];
  return !isEqual(normalize(columnOrder), normalize(defaultColumnOrder));
};

export const getSavedViewAnalytics = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
  settings: TableSettings,
  defaults: TableSettings
) => {
  const filteredColumns = nonEmptyFilters(settings.columnFilters).map((filter) => filter.id);
  return {
    filter_count: filteredColumns.length,
    filtered_columns: filteredColumns,
    has_sort: settings.sorting.length > 0,
    has_search: !!settings.globalFilter,
    columns_reordered: isColumnOrderChanged(table, settings.columnOrder, defaults.columnOrder),
  };
};
