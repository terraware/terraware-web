import React from 'react';
import { APP_PATHS } from 'src/constants';
import CellRenderer, { TableRowType } from '../common/table/TableCellRenderer';
import { RendererProps } from '../common/table/types';
import Link from '../common/Link';
import { DateTime } from 'luxon';
import strings from 'src/strings';

export default function ReportsCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, index } = props;

  const createLinkReport = () => {
    const reportLocation = {
      pathname: APP_PATHS.REPORTS_VIEW.replace(':reportId', row.id.toString()),
    };
    return <Link to={reportLocation.pathname}>{`${row.year}-Q${row.quarter}` as React.ReactNode}</Link>;
  };

  if (column.key === 'name') {
    return <CellRenderer index={index} column={column} value={createLinkReport()} row={row} />;
  }

  if (column.key === 'status') {
    let statusValue = '';
    switch (row.status) {
      case 'New':
        statusValue = strings.NEW;
        break;
      case 'In Progress':
        statusValue = strings.IN_PROGRESS;
        break;
      case 'Locked':
        statusValue = strings.LOCKED;
        break;
      case 'Submitted':
        statusValue = strings.SUBMITTED;
        break;
    }
    return <CellRenderer index={index} row={row} column={column} value={statusValue} />;
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
