import React, { ReactNode, useCallback } from 'react';

import {
  EditableTableOptionsV2,
  EditableTablePropsV2,
  EditableTableShowHideColumnsButtonV2,
  EditableTableToggleDensePaddingButtonV2,
  EditableTableToggleFiltersButtonV2,
  EditableTableToggleFullScreenButtonV2,
  EditableTableToggleGlobalFilterButtonV2,
  EditableTableToolbarContext,
  EditableTableV2,
  EditableTable as WebEditableTable,
  isMrtTable,
} from '@terraware/web-components';
import { EditableTableProps } from '@terraware/web-components/components/EditableTable';
import { omit } from 'lodash';
import {
  MRT_RowData,
  MRT_ShowHideColumnsButton,
  MRT_TableOptions,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MRT_ToggleGlobalFilterButton,
} from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { MRT_Localization_FR } from 'material-react-table/locales/fr';

import { useFeatureEnabled } from 'src/features';
import { useLocalization } from 'src/providers';

import TableToolbarActions from './table/TableToolbarActions';

type SharedOptions<TData extends MRT_RowData> = Pick<
  EditableTableOptionsV2<TData> & NonNullable<EditableTableProps<TData>['tableOptions']>,
  | 'state'
  | 'initialState'
  | 'onColumnFiltersChange'
  | 'onColumnOrderChange'
  | 'onColumnPinningChange'
  | 'onColumnVisibilityChange'
  | 'onGlobalFilterChange'
  | 'onSortingChange'
  | 'onPaginationChange'
  | 'manualPagination'
  | 'manualSorting'
  | 'manualFiltering'
  | 'rowCount'
  | 'autoResetPageIndex'
  | 'getRowId'
  | 'enableColumnPinning'
> &
  Pick<
    NonNullable<EditableTableProps<TData>['tableOptions']>,
    | 'defaultColumn'
    | 'enableGlobalFilterRankedResults'
    | 'enableGrouping'
    | 'muiTablePaperProps'
    | 'muiTableProps'
    | 'onShowColumnFiltersChange'
    | 'onShowGlobalFilterChange'
    | 'onDensityChange'
    | 'renderEmptyRowsFallback'
  > &
  Pick<EditableTablePropsV2<TData>, 'muiTopToolbarProps' | 'muiTableBodyProps' | 'muiTableBodyRowProps'>;

export type SharedEditableTableProps<TData extends MRT_RowData> = Omit<
  EditableTableProps<TData>,
  'tableOptions' | keyof SharedCallbacks<TData>
> &
  SharedCallbacks<TData> & {
    supportsV2: true;
    tableOptions?: SharedOptions<TData>;
    renderMrtToolbarInternalActions?: (context: EditableTableToolbarContext<TData>) => React.ReactNode;
    enableFilterByColumnMenuItem?: boolean;
    enableShowAllColumnsMenuItem?: boolean;
    showColumnFiltersButton?: boolean;
    renderEmptyRowsFallback?: EditableTablePropsV2<TData>['renderEmptyRowsFallback'];
  };

type SharedCallbacks<TData extends MRT_RowData> = Pick<
  EditableTablePropsV2<TData>,
  'renderToolbarInternalActions' | 'renderTopToolbarCustomActions' | 'muiTableHeadCellProps' | 'muiTableBodyCellProps'
>;

type Props<TData extends MRT_RowData> =
  (EditableTableProps<TData> & { supportsV2?: false }) | SharedEditableTableProps<TData>;

export const EditableTableToolbar = <TData extends MRT_RowData>({
  table,
  children,
  leadingActions,
  showGlobalFilterButton,
  showColumnFiltersButton,
  showColumnsButton,
  showDensityButton,
  showFullScreenButton,
}: EditableTableToolbarContext<TData> & {
  children?: ReactNode;
  leadingActions?: ReactNode;
  showGlobalFilterButton?: boolean;
  showColumnFiltersButton?: boolean;
  showColumnsButton?: boolean;
  showDensityButton?: boolean;
  showFullScreenButton?: boolean;
}) => (
  <TableToolbarActions>
    {leadingActions}
    {showGlobalFilterButton &&
      (isMrtTable(table) ? (
        <MRT_ToggleGlobalFilterButton table={table} />
      ) : (
        <EditableTableToggleGlobalFilterButtonV2 table={table} />
      ))}
    {showColumnFiltersButton &&
      (isMrtTable(table) ? (
        <MRT_ToggleFiltersButton table={table} />
      ) : (
        <EditableTableToggleFiltersButtonV2 table={table} />
      ))}
    {showColumnsButton &&
      (isMrtTable(table) ? (
        <MRT_ShowHideColumnsButton table={table} />
      ) : (
        <EditableTableShowHideColumnsButtonV2 table={table} />
      ))}
    {children}
    {showDensityButton &&
      (isMrtTable(table) ? (
        <MRT_ToggleDensePaddingButton table={table} />
      ) : (
        <EditableTableToggleDensePaddingButtonV2 table={table} />
      ))}
    {showFullScreenButton &&
      (isMrtTable(table) ? (
        <MRT_ToggleFullScreenButton table={table} />
      ) : (
        <EditableTableToggleFullScreenButtonV2 table={table} />
      ))}
  </TableToolbarActions>
);

const EditableTable = <TData extends MRT_RowData>(props: Props<TData>) => {
  const useV2 = useFeatureEnabled('Editable Table V2');
  const showFilters = props.supportsV2 && (props.showColumnFiltersButton ?? props.enableColumnFilters);
  const hideShowAllColumns = props.supportsV2 && props.enableShowAllColumnsMenuItem === false;
  const { showDensityButton, showFullScreenButton } = props;
  const hasSharedControls =
    props.supportsV2 &&
    (props.showColumnFiltersButton !== undefined ||
      showDensityButton !== undefined ||
      showFullScreenButton !== undefined);
  const renderSharedToolbar = useCallback(
    ({ table }: EditableTableToolbarContext<TData>) => (
      <EditableTableToolbar
        table={table}
        showColumnFiltersButton={showFilters}
        showDensityButton={showDensityButton}
        showFullScreenButton={showFullScreenButton}
      />
    ),
    [showDensityButton, showFilters, showFullScreenButton]
  );
  const renderColumnActionsMenuItems = useCallback(
    ({
      internalColumnMenuItems,
      column,
      table,
    }: Parameters<NonNullable<MRT_TableOptions<TData>['renderColumnActionsMenuItems']>>[0]) => {
      if (!isMrtTable(table)) {
        return internalColumnMenuItems;
      }
      const label = table.options.localization.showAllColumns?.replace('{column}', String(column.columnDef.header));
      return internalColumnMenuItems.filter(
        (item) => !React.isValidElement<{ label?: string }>(item) || !label || item.props.label !== label
      );
    },
    []
  );
  const { activeLocale } = useLocalization();
  const language = activeLocale?.replace(/[-_].*/, '');
  const localization =
    language === 'es'
      ? MRT_Localization_ES
      : language === 'fr' || language === 'gx'
        ? MRT_Localization_FR
        : MRT_Localization_EN;

  if (props.supportsV2 && useV2) {
    const {
      state,
      initialState,
      enableColumnPinning,
      muiTopToolbarProps,
      muiTableBodyProps,
      muiTableBodyRowProps,
      onShowColumnFiltersChange,
      onShowGlobalFilterChange,
      onDensityChange,
      ...options
    } = props.tableOptions ?? {};
    return (
      <EditableTableV2
        {...props}
        showColumnFiltersButton={showFilters}
        showColumnFilters={state?.showColumnFilters}
        onShowColumnFiltersChange={onShowColumnFiltersChange}
        showGlobalFilter={state?.showGlobalFilter}
        onShowGlobalFilterChange={onShowGlobalFilterChange}
        density={state?.density}
        onDensityChange={onDensityChange}
        isLoading={state?.isLoading}
        showLoadingProgress={state?.showProgressBars}
        enableHeaderColumnDragging={props.enableColumnDragging}
        enableColumnPinning={enableColumnPinning ?? props.enableColumnPinning}
        muiTopToolbarProps={muiTopToolbarProps}
        muiTableBodyProps={muiTableBodyProps}
        muiTableBodyRowProps={muiTableBodyRowProps}
        tableOptions={{
          ...omit(options, [
            'defaultColumn',
            'enableGlobalFilterRankedResults',
            'enableGrouping',
            'muiTablePaperProps',
            'muiTableProps',
            'renderEmptyRowsFallback',
          ]),
          state,
          initialState,
        }}
      />
    );
  }

  return (
    <WebEditableTable
      {...props}
      renderToolbarInternalActions={
        (props.supportsV2 ? props.renderMrtToolbarInternalActions : undefined) ??
        props.renderToolbarInternalActions ??
        (hasSharedControls ? renderSharedToolbar : undefined)
      }
      tableOptions={{
        ...props.tableOptions,
        ...(props.supportsV2 && props.renderEmptyRowsFallback
          ? { renderEmptyRowsFallback: props.renderEmptyRowsFallback }
          : {}),
        ...(hideShowAllColumns && { renderColumnActionsMenuItems }),
        localization: { ...localization, ...(!props.supportsV2 ? props.tableOptions?.localization : undefined) },
      }}
    />
  );
};

export default EditableTable;
