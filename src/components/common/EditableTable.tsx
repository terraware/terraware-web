import React, { ReactNode, useCallback } from 'react';

import {
  EditableTableOptionsV2,
  EditableTableToggleDensePaddingButtonV2,
  EditableTableToggleFiltersButtonV2,
  EditableTableToggleFullScreenButtonV2,
  EditableTableToolbarContext,
  EditableTableV2,
  EditableTable as WebEditableTable,
  isMrtTable,
} from '@terraware/web-components';
import { EditableTableProps } from '@terraware/web-components/components/EditableTable';
import {
  MRT_RowData,
  MRT_TableOptions,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
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
> &
  Pick<
    NonNullable<EditableTableProps<TData>['tableOptions']>,
    'enableGlobalFilterRankedResults' | 'muiTopToolbarProps' | 'muiTableBodyRowProps' | 'muiTableProps'
  >;

export type SharedEditableTableProps<TData extends MRT_RowData> = Omit<
  EditableTableProps<TData>,
  'tableOptions' | 'renderTopToolbarCustomActions' | 'renderToolbarInternalActions'
> & {
  supportsV2: true;
  tableOptions?: SharedOptions<TData>;
  renderTopToolbarCustomActions?: (context: EditableTableToolbarContext<TData>) => React.ReactNode;
  renderToolbarInternalActions?: (context: EditableTableToolbarContext<TData>) => React.ReactNode;
  renderMrtToolbarInternalActions?: (context: EditableTableToolbarContext<TData>) => React.ReactNode;
  enableShowAllColumnsMenuItem?: boolean;
  showColumnFiltersButton?: boolean;
};

type Props<TData extends MRT_RowData> =
  (EditableTableProps<TData> & { supportsV2?: false }) | SharedEditableTableProps<TData>;

export const EditableTableToolbar = <TData extends MRT_RowData>({
  table,
  children,
  showColumnFiltersButton,
  showDensityButton,
  showFullScreenButton,
}: EditableTableToolbarContext<TData> & {
  children?: ReactNode;
  showColumnFiltersButton?: boolean;
  showDensityButton?: boolean;
  showFullScreenButton?: boolean;
}) => (
  <TableToolbarActions>
    {showColumnFiltersButton &&
      (isMrtTable(table) ? (
        <MRT_ToggleFiltersButton table={table} />
      ) : (
        <EditableTableToggleFiltersButtonV2 table={table} />
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
    return <EditableTableV2 {...props} showColumnFiltersButton={showFilters} />;
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
        ...(hideShowAllColumns && { renderColumnActionsMenuItems }),
        localization: { ...localization, ...(!props.supportsV2 ? props.tableOptions?.localization : undefined) },
      }}
    />
  );
};

export default EditableTable;
