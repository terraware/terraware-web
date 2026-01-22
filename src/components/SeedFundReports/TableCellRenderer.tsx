import React, { type JSX } from 'react';

import { DateTime } from 'luxon';

import ReportLink from 'src/components/SeedFundReports/ReportLink';
import CellRenderer from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { ListReport, statusName } from 'src/types/Report';

export default function ReportsCellRenderer(
  props: RendererProps<ListReport & { organizationName?: string }>
): JSX.Element {
  const { column, row, index } = props;

  if (column.key === 'name') {
    return <CellRenderer index={index} column={column} value={<ReportLink fontSize='16px' report={row} />} row={row} />;
  }

  if (column.key === 'status') {
    return <CellRenderer index={index} row={row} column={column} value={statusName(row.status)} />;
  }

  if (column.key === 'submittedTime') {
    if (!row.submittedTime) {
      return <CellRenderer index={index} row={row} column={column} value='' />;
    }
    const date = DateTime.fromISO(row.submittedTime);
    return <CellRenderer index={index} row={row} column={column} value={date.toISODate()} />;
  }

  return <CellRenderer {...props} />;
}
