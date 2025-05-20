import React, { useCallback, useMemo } from 'react';

import Link from 'src/components/common/Link';
import TextTruncated from 'src/components/common/TextTruncated';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useLocalization } from 'src/providers';
import { selectUser } from 'src/redux/features/user/usersSelectors';
import { useAppSelector } from 'src/redux/store';
import { AcceleratorReportStatus } from 'src/types/AcceleratorReport';

import AcceleratorReportStatusBadge from './AcceleratorReportStatusBadge';

type AcceleratorReportCellRendererType = {
  projectId: string;
};

type ReportCellProps = {
  renderProps: RendererProps<TableRowType>;
  projectId: string;
};

const ReportCell = ({ renderProps, projectId }: ReportCellProps): JSX.Element => {
  const { column, row, index, value } = renderProps;
  const { activeLocale } = useLocalization();
  const { isAcceleratorRoute } = useAcceleratorConsole();

  const modifiedByUser = useAppSelector(selectUser(row.modifiedBy));
  const submittedByUser = useAppSelector(selectUser(row.submittedBy));

  const createLinkToReport = useCallback(() => {
    const reportUrl = isAcceleratorRoute ? APP_PATHS.ACCELERATOR_PROJECT_REPORTS_VIEW : APP_PATHS.REPORTS_VIEW;
    const to = reportUrl.replace(':reportId', `${row.id}`).replace(':projectId', projectId);

    const year = row.startDate.split('-')[0];
    const reportName = row.frequency === 'Annual' ? `${year}` : `${year}-${row.quarter}`;

    return (
      <Link to={to}>
        <TextTruncated fontSize={16} fontWeight={500} stringList={[reportName]} width={400} />
      </Link>
    );
  }, [isAcceleratorRoute, projectId, row.frequency, row.id, row.quarter, row.startDate]);

  const modifiedByName = useMemo(() => {
    return modifiedByUser
      ? `${modifiedByUser?.firstName ?? ''} ${modifiedByUser?.lastName ?? ''}`.trim() || modifiedByUser.email
      : '';
  }, [modifiedByUser]);

  const submittedByName = useMemo(() => {
    return submittedByUser
      ? `${submittedByUser?.firstName ?? ''} ${submittedByUser?.lastName ?? ''}`.trim() || submittedByUser.email
      : '';
  }, [submittedByUser]);

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
        value={createLinkToReport()}
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
    return <CellRenderer {...renderProps} value={modifiedByName} />;
  }

  if (column.key === 'submittedBy') {
    return <CellRenderer {...renderProps} value={submittedByName} />;
  }

  return <CellRenderer {...renderProps} />;
};

export default function AcceleratorReportCellRenderer({ projectId }: AcceleratorReportCellRendererType) {
  // eslint-disable-next-line react/display-name
  return (props: RendererProps<TableRowType>): JSX.Element => <ReportCell projectId={projectId} renderProps={props} />;
}
