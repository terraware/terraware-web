import { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { TableColumnType, TableRowType, Table as WebComponentsTable } from '@terraware/web-components';
import { LocalizationProps, Props, TextAlignment } from '@terraware/web-components/components/table';
import _ from 'lodash';

import { useLocalization, useOrganization } from 'src/providers';
import { PreferencesService } from 'src/services';
import strings from 'src/strings';

import useTableDensity from './useTableDensity';

function renderPaginationText(from: number, to: number, total: number): string {
  if (total > 0) {
    return strings.formatString(strings.PAGINATION_FOOTER_RANGE, from, to, total) as string;
  } else {
    return strings.PAGINATION_FOOTER_EMPTY;
  }
}

function renderNumSelectedText(numSelected: number): string {
  return strings.formatString(strings.ROWS_SELECTED, numSelected) as string;
}

const enhancedTopBarSelectionConfig = {
  renderEnhancedNumSelectedText: (selectedCount: number, pageCount: number): string => {
    switch (true) {
      case selectedCount === 1 && pageCount === 1: {
        return strings.formatString<string>(strings.TABLE_SELECTED_ROW, `${selectedCount}`) as string;
      }
      case selectedCount > 1 && pageCount === 1: {
        return strings.formatString<string>(strings.TABLE_SELECTED_ROWS, `${selectedCount}`) as string;
      }
      case selectedCount === 1 && pageCount > 1: {
        return strings.formatString<string>(
          strings.TABLE_SELECTED_ROW_ACROSS_PAGES,
          `${selectedCount}`,
          `${pageCount}`
        ) as string;
      }
      case selectedCount > 1 && pageCount > 1: {
        return strings.formatString<string>(
          strings.TABLE_SELECTED_ROWS_ACROSS_PAGES,
          `${selectedCount}`,
          `${pageCount}`
        ) as string;
      }
    }
    return '';
  },
  renderSelectAllText: (rowsCount: number): string =>
    strings.formatString(strings.TABLE_SELECT_ALL_ROWS, `${rowsCount}`) as string,
  renderSelectNoneText: (): string => strings.TABLE_SELECT_NONE,
};

interface TableProps<T> extends Omit<Props<T>, keyof LocalizationProps> {
  showPagination?: boolean;
}

export function BaseTable<T extends TableRowType>(props: TableProps<T>): JSX.Element {
  const { tableDensity } = useTableDensity();

  const addAlignment = useMemo(() => {
    return props.columns.map((col) => {
      if (col.type === 'number') {
        return { ...col, alignment: 'right' as TextAlignment };
      } else {
        return col;
      }
    });
  }, [props.columns]);

  return WebComponentsTable({
    ...props,
    booleanFalseText: strings.NO,
    booleanTrueText: strings.YES,
    density: tableDensity,
    editText: strings.EDIT,
    renderNumSelectedText,
    ...(props.showPagination !== false ? { renderPaginationText } : {}),
    enhancedTopBarSelectionConfig,
    columns: addAlignment,
  });
}

/**
 * Ordered columns component that preserves reordered columns using callback functions.
 * This table fetches column names from preferences and sets them if available.
 * Also saves new columns order upon reordering, into user preferences (for the org scope).
 */

export type OrderPreserveableTableProps = {
  // user preference name to store the columns order
  columnsPreferenceName?: string;
  id: string;
  setColumns: (columns: TableColumnType[]) => void;
};

export function OrderPreserveableTable<T extends TableRowType>(
  props: TableProps<T> & OrderPreserveableTableProps
): JSX.Element {
  const [initialized, setInitialized] = useState<boolean>(false);
  const { columns, columnsPreferenceName, id, onReorderEnd, setColumns, ...tableProps } = props;
  const { selectedOrganization, orgPreferences, reloadOrgPreferences } = useOrganization();

  const getPreferenceName = useCallback(() => columnsPreferenceName || `${id}-columns`, [columnsPreferenceName, id]);

  const getTableColumns = useCallback(
    (columnNames: string[]): TableColumnType[] =>
      columnNames
        .map((columnName) => columns.find((column) => column.key === columnName))
        .filter((column) => !!column) as TableColumnType[],
    [columns]
  );

  const reorderHandler = async (reorderedColumns: string[]) => {
    if (selectedOrganization) {
      await PreferencesService.updateUserOrgPreferences(selectedOrganization.id, {
        [getPreferenceName()]: reorderedColumns,
      });
      reloadOrgPreferences();
      const columnsToSet = getTableColumns(reorderedColumns);
      setColumns(columnsToSet);

      if (onReorderEnd) {
        onReorderEnd(reorderedColumns);
      }
    }
  };

  useEffect(() => {
    const fetchSavedColumns = () => {
      if (!orgPreferences || initialized) {
        return;
      }
      const columnNames: string[] | undefined = orgPreferences[getPreferenceName()] as string[] | undefined;
      if (
        columnNames?.length &&
        !_.isEqual(
          columns.map((column) => column.key),
          columnNames
        )
      ) {
        const columnsToSet = getTableColumns(columnNames);
        setColumns(columnsToSet);
      }
      setInitialized(true);
    };

    fetchSavedColumns();
  });

  return BaseTable<T>({
    ...tableProps,
    id,
    columns,
    onReorderEnd: (reorderedColumns) => void reorderHandler(reorderedColumns),
  });
}

/**
 * Ordered columns table with implementation to set columns - this handles the most common cases
 * where client does not need extra semantics to filter columns.
 * Species table is an example where this won't work, uses its own setColumns implementation.
 */
export type OrderPreservedTableProps = {
  id: string;
  columns: TableColumnType[] | (() => TableColumnType[]);
};

export type OrderPreservedTablePropsFull<T> = Omit<TableProps<T>, 'columns'> & OrderPreservedTableProps;

export default function OrderPreservedTable<T extends TableRowType>(
  props: OrderPreservedTablePropsFull<T>
): JSX.Element {
  const { columns: columnsProp, ...tableProps } = props;
  const columns = typeof columnsProp === 'function' ? columnsProp() : columnsProp;
  const { activeLocale } = useLocalization();
  const [tableColumns, setTableColumns] = useState<TableColumnType[]>(columns);

  useEffect(() => {
    const sourceColumns = activeLocale ? columns : [];
    const refreshedColumns: TableColumnType[] = tableColumns
      .map((tableColumn: TableColumnType) =>
        sourceColumns.find((sourceColumn: TableColumnType) => sourceColumn.key === tableColumn.key)
      )
      .filter((tableColumn?: TableColumnType) => !!tableColumn) as TableColumnType[];

    if (!_.isEqual(tableColumns, refreshedColumns)) {
      setTableColumns(refreshedColumns);
    }
  }, [activeLocale, columnsProp, columns, tableColumns]);

  const columnsPreferenceName = useMemo<string>(() => {
    const columnNames = columns
      .map((column) => column.key)
      .sort()
      .join('_');
    return `${props.id}_columns_${columnNames}`;
  }, [columns, props.id]);

  return OrderPreserveableTable<T>({
    ...tableProps,
    columns: tableColumns,
    columnsPreferenceName,
    setColumns: (columnsToSet: TableColumnType[]) => setTableColumns(columnsToSet),
  });
}
