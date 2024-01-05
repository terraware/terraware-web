import React from 'react';
import { APP_PATHS } from 'src/constants';
import CellRenderer, { TableRowType } from '../common/table/TableCellRenderer';
import { RendererProps } from '../common/table/types';
import Link from '../common/Link';
import { DateTime } from 'luxon';
import { statusName } from 'src/types/Report';

export default function ReportsCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, index } = props;

  const createLinkReport = () => {
    const reportLocation = {
      pathname: APP_PATHS.REPORTS_VIEW.replace(':reportId', row.id.toString()),
    };

    let reportName = `${row.year}-Q${row.quarter}`;
    if (row.projectName) {
      reportName += ` ${row.projectName}`;
    }

    if (row.organizationName) {
      reportName += ` ${row.organizationName} [Org]`;
    }

    return <Link to={reportLocation.pathname}>{reportName}</Link>;
  };

  if (column.key === 'name') {
    return <CellRenderer index={index} column={column} value={createLinkReport()} row={row} />;
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
