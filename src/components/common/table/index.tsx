import { useCallback, useEffect, useState } from 'react';
import { Table as WebComponentsTable, TableColumnType, TableRowType } from '@terraware/web-components';
import strings from 'src/strings';
import { LocalizationProps, Props } from '@terraware/web-components/components/table';
import { useOrganization } from 'src/providers/hooks';
import { PreferencesService } from 'src/services';
import _ from 'lodash';

function renderPaginationText(from: number, to: number, total: number): string {
  if (total > 0) {
    return strings.formatString(strings.PAGINATION_FOOTER, from, to, total) as string;
  } else {
    return strings.PAGINATION_FOOTER_EMPTY;
  }
}

function renderNumSelectedText(numSelected: number): string {
  return strings.formatString(strings.ROWS_SELECTED, numSelected) as string;
}

interface TableProps<T> extends Omit<Props<T>, keyof LocalizationProps> {
  showPagination?: boolean;
}

export function BaseTable<T extends TableRowType>(props: TableProps<T>): JSX.Element {
  return WebComponentsTable({
    ...props,
    booleanFalseText: strings.NO,
    booleanTrueText: strings.YES,
    editText: strings.EDIT,
    renderNumSelectedText,
    ...(props.showPagination !== false ? { renderPaginationText } : {}),
  });
}

/**
 * Ordered columns component that preserves reordered columns using callback functions.
 * This table fetches column names from preferences and sets them if available.
 * Also saves new columns order upon reordering, into user preferences (for the org scope).
 */

export type OrderPreserveableTableProps = {
  setColumns: (columns: TableColumnType[]) => void;
};

export function OrderPreserveableTable<T extends TableRowType>(
  props: TableProps<T> & OrderPreserveableTableProps
): JSX.Element {
  const [initialized, setInitialized] = useState<boolean>(false);
  const { setColumns, onReorderEnd, columns, id, ...tableProps } = props;
  const { selectedOrganization, orgPreferences, reloadOrgPreferences } = useOrganization();

  const getPreferenceName = useCallback(() => `${id}-columns`, [id]);

  const getTableColumns = useCallback(
    (columnNames: string[]): TableColumnType[] =>
      columnNames.map((columnName) => columns.find((column) => column.key === columnName)) as TableColumnType[],
    [columns]
  );

  const reorderHandler = async (reorderedColumns: string[]) => {
    await PreferencesService.updateUserOrgPreferences(selectedOrganization.id, {
      [getPreferenceName()]: reorderedColumns,
    });
    reloadOrgPreferences();
    const columnsToSet = getTableColumns(reorderedColumns);
    setColumns(columnsToSet);

    if (onReorderEnd) {
      onReorderEnd(reorderedColumns);
    }
  };

  useEffect(() => {
    const fetchSavedColumns = () => {
      if (!orgPreferences) {
        return;
      }
      setInitialized(true);
      const columnNames: string[] | undefined = orgPreferences[getPreferenceName()] as string[] | undefined;
      if (
        columnNames?.length &&
        columns.length === columnNames.length &&
        !_.isEqual(
          columns.map((column) => column.key),
          columnNames
        )
      ) {
        const columnsToSet = getTableColumns(columnNames);
        setColumns(columnsToSet);
      }
    };

    if (!initialized) {
      fetchSavedColumns();
    }
  });

  return BaseTable<T>({
    ...tableProps,
    id,
    columns,
    onReorderEnd: reorderHandler,
  });
}

/**
 * Ordered columns table with implementation to set columns - this handles the most common cases
 * where client does not need extra semantics to filter columns.
 * Species table is an example where this won't work, uses its own setColumns implementation.
 */
export default function OrderPreservedTable<T extends TableRowType>(props: TableProps<T>): JSX.Element {
  const { columns, ...tableProps } = props;
  const [tableColumns, setTableColumns] = useState<TableColumnType[]>(columns);

  return OrderPreserveableTable<T>({
    ...tableProps,
    columns: tableColumns,
    setColumns: (columnsToSet: TableColumnType[]) => setTableColumns(columnsToSet),
  });
}
