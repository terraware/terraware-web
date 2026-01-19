import React, { type JSX } from 'react';

import { DateTime } from 'luxon';

import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { ModuleEventProject } from 'src/types/Module';

export default function EventsCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, index, value, onRowClick } = props;

  if (column.key === 'id' && onRowClick) {
    const valueToRender =
      value?.toString() === '-1' ? (
        <Link fontSize='16px' target='_blank' onClick={() => onRowClick()}>
          {'<ID>'}
        </Link>
      ) : (
        <Link fontSize='16px' target='_blank' onClick={() => onRowClick()}>
          {value as React.ReactNode}
        </Link>
      );

    return <CellRenderer index={index} column={column} value={valueToRender} row={row} />;
  }

  if ((column.key === 'meetingUrl' || column.key === 'recordingUrl' || column.key === 'slidesUrl') && !onRowClick) {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={
          <Link fontSize='16px' target='_blank' to={value as string}>
            {value as string}
          </Link>
        }
        row={row}
      />
    );
  }

  if (column.key === 'projects') {
    const valueToRender = Array.isArray(value)
      ? value
          .map((proj) => {
            const projectTyped = proj as ModuleEventProject;
            return projectTyped.projectName;
          })
          .join(', ')
      : '';
    return <CellRenderer index={index} column={column} value={valueToRender} row={row} />;
  }

  if (column.key === 'startTime' || column.key === 'endTime') {
    const valueToRender = typeof value === 'string' ? DateTime.fromISO(value)?.toFormat('yyyy-MM-dd hh:mm a') : '';

    return <CellRenderer index={index} column={column} value={valueToRender} row={row} />;
  }

  return <CellRenderer {...props} />;
}
