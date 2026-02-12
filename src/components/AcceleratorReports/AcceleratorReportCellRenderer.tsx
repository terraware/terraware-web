import React, { type JSX, useMemo } from 'react';

import { getDateDisplayValue } from '@terraware/web-components/utils';

import Link from 'src/components/common/Link';
import TextTruncated from 'src/components/common/TextTruncated';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useLocalization, useOrganization } from 'src/providers';
import { AcceleratorReportStatus } from 'src/types/AcceleratorReport';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import AcceleratorReportStatusBadge from './AcceleratorReportStatusBadge';

type AcceleratorReportCellRendererType = {
  projectId: number;
};

type ReportCellProps = {
  renderProps: RendererProps<TableRowType>;
  projectId: number;
};

const ReportCell = ({ renderProps, projectId }: ReportCellProps): JSX.Element => {
  const { column, row, index, value } = renderProps;
  const { activeLocale } = useLocalization();
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const { selectedOrganization } = useOrganization();
  const defaultTimezone = useDefaultTimeZone().get().id;

  const linkToReport = useMemo(() => {
    const reportUrl = isAcceleratorRoute ? APP_PATHS.ACCELERATOR_PROJECT_REPORTS_VIEW : APP_PATHS.REPORTS_VIEW;
    const to = reportUrl.replace(':reportId', `${row.id}`).replace(':projectId', projectId.toString());

    const year = row.startDate.split('-')[0];
    const reportName = row.frequency === 'Annual' ? `${year}` : `${year}-${row.quarter}`;

    return (
      <Link to={to}>
        <TextTruncated fontSize={16} fontWeight={500} stringList={[reportName]} width={400} />
      </Link>
    );
  }, [isAcceleratorRoute, projectId, row.frequency, row.id, row.quarter, row.startDate]);

  if (column.key === 'reportName') {
    return (
      <CellRenderer
        column={column}
        index={index}
        row={row}
        style={{ maxWidth: '500px' }}
        sx={{
          fontSize: '16px',
          '& > p': {
            fontSize: '16px',
          },
        }}
        value={linkToReport}
      />
    );
  }

  if (column.key === 'status') {
    return (
      <CellRenderer
        column={column}
        index={index}
        row={row}
        value={activeLocale ? <AcceleratorReportStatusBadge status={value as AcceleratorReportStatus} /> : ''}
      />
    );
  }

  if (column.key === 'modifiedBy') {
    return <CellRenderer {...renderProps} value={row.modifiedByUser.fullName} />;
  }

  if (column.key === 'submittedBy') {
    return <CellRenderer {...renderProps} value={row.submittedByUser?.fullName} />;
  }
  if (column.key === 'submittedTime') {
    const submittedDate = row.submittedTime
      ? getDateDisplayValue(row.submittedTime, selectedOrganization?.timeZone ?? defaultTimezone)
      : '';
    return <CellRenderer {...renderProps} value={submittedDate} />;
  }

  return <CellRenderer {...renderProps} />;
};

export default function AcceleratorReportCellRenderer({ projectId }: AcceleratorReportCellRendererType) {
  // eslint-disable-next-line react/display-name
  return (props: RendererProps<TableRowType>): JSX.Element => <ReportCell projectId={projectId} renderProps={props} />;
}
