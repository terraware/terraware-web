import React from 'react';

import {
  EditableTableColumnV2,
  EditableTableInstanceV2,
  EditableTableOptionsV2,
  EditableTablePropsV2,
} from '@terraware/web-components';

import CurrentView, { CurrentViewProps } from 'src/components/common/CurrentView';
import strings from 'src/strings';
import { TABLES } from 'src/types/Tables';

import MatrixV2Toolbar, { MatrixV2ToolbarProps } from './MatrixV2Toolbar';
import { MatrixRow } from './matrixValues';

type MatrixTableContext = { table: EditableTableInstanceV2<MatrixRow> };
type MatrixV2Config = {
  columns: EditableTableColumnV2<MatrixRow>[];
  data: MatrixRow[];
  isMobile: boolean;
  tableOptions: EditableTableOptionsV2<MatrixRow>;
  controls: Omit<MatrixV2ToolbarProps, 'table'>;
  view: Pick<CurrentViewProps<MatrixRow>, 'defaultPreset' | 'defaultSettings' | 'onPresetChange'>;
};

export const buildMatrixV2Props = ({
  columns,
  data,
  isMobile,
  tableOptions,
  controls,
  view,
}: MatrixV2Config): EditableTablePropsV2<MatrixRow> => ({
  columns,
  data,
  clearAllFiltersLabel: strings.CLEAR_ALL_FILTERS,
  enableColumnFilters: true,
  enableColumnOrdering: true,
  enableColumnPinning: true,
  enableEditing: true,
  enableGlobalFilter: true,
  enableColumnDragging: !isMobile,
  enableShowAllColumnsMenuItem: false,
  positionGlobalFilter: 'right',
  tableOptions,
  renderToolbarInternalActions: ({ table }: MatrixTableContext) => <MatrixV2Toolbar {...controls} table={table} />,
  renderTopToolbarCustomActions: ({ table }: MatrixTableContext) => (
    <CurrentView
      {...view}
      table={table}
      tableDefinition={TABLES.matrixView}
      presetViews={[
        { label: strings.ACCELERATOR_PROJECTS, value: 'acceleratorProjects' },
        { label: strings.APPLICANTS, value: 'applicants' },
      ]}
    />
  ),
  sx: {
    padding: 0,
    '& table': { tableLayout: 'fixed' },
    '& tbody td': { borderBottom: 'none' },
    '@media (max-width: 767px)': {
      '& .MuiToolbar-root': { alignItems: 'center' },
      '& .MuiToolbar-root > .MuiTextField-root': { flexBasis: '100%', order: 2 },
      '& .MuiToolbar-root > .button': { order: 3, paddingLeft: 0 },
    },
  },
  muiTableBodyCellProps: ({ cell, column }) => ({
    title: column.id === 'projectName' ? String(cell.getValue() ?? '') : undefined,
    sx: {
      '&[data-pinned="true"]': {
        filter: 'brightness(0.97)',
        boxShadow: '-4px 0 4px -4px rgba(97, 97, 97, 0.5) inset',
        zIndex: 1,
      },
      ...(column.id === 'projectName' && {
        maxWidth: '150px',
        '& a': {
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          lineHeight: '1.2em',
          maxHeight: '5.4em',
          whiteSpace: 'normal',
        },
      }),
    },
  }),
  muiTableHeadCellProps: ({ column }) => ({
    title: String(column.columnDef.header),
    sx: {
      height: '56px',
      maxWidth: '200px',
      padding: '8px',
      '& .MuiTableSortLabel-root': {
        whiteSpace: 'normal',
        lineHeight: '1.2em',
        maxHeight: '3.6em',
        overflow: 'hidden',
      },
    },
  }),
});
