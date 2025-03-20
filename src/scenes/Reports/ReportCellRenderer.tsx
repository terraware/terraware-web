import React, { useEffect, useMemo } from 'react';

import Link from 'src/components/common/Link';
import TextTruncated from 'src/components/common/TextTruncated';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useLocalization } from 'src/providers';
import { requestGetUser } from 'src/redux/features/user/usersAsyncThunks';
import { selectUser } from 'src/redux/features/user/usersSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { AcceleratorReportStatus } from 'src/types/AcceleratorReport';

import ReportStatusBadge from './ReportStatusBadge';

export default function ReportCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, index, value } = props;
  const { activeLocale } = useLocalization();
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const dispatch = useAppDispatch();

  const modifiedByUser = useAppSelector(selectUser(row.modifiedBy));
  const submittedByUser = useAppSelector(selectUser(row.submittedBy));

  const createLinkToReport = (iValue: React.ReactNode | unknown[]) => {
    // TODO: update link to accelerator report views once ready
    const reportUrl = isAcceleratorRoute ? APP_PATHS.REPORTS_VIEW : APP_PATHS.REPORTS_VIEW;
    const to = reportUrl.replace(':reportId', `${row.id}`);

    return (
      <Link to={to}>
        <TextTruncated fontSize={16} width={400} fontWeight={500} stringList={[iValue as string]} />
      </Link>
    );
  };

  useEffect(() => {
    if (!modifiedByUser && row.modifiedBy && row.modifiedBy !== -1) {
      dispatch(requestGetUser(row.modifiedBy));
    }
  }, [dispatch, row, modifiedByUser]);

  useEffect(() => {
    if (!submittedByUser && row.submittedBy && row.submittedBy !== -1) {
      dispatch(requestGetUser(row.submittedBy));
    }
  }, [dispatch, row, submittedByUser]);

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

  if (column.key === 'report') {
    const year = row.startDate ? row.startDate?.split('-')?.[0] : '';
    const quarterNumber = row.startDate ? Math.ceil((new Date(row.startDate).getMonth() + 1) / 3) : 0;
    const title = row.frequency === 'Annual' ? `${year}` : `${year}-Q${quarterNumber}`;

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
        value={createLinkToReport(title)}
      />
    );
  }

  if (column.key === 'status') {
    return (
      <CellRenderer
        column={column}
        index={index}
        row={row}
        value={activeLocale ? <ReportStatusBadge status={value as AcceleratorReportStatus} /> : ''}
      />
    );
  }

  if (column.key === 'year') {
    return <CellRenderer {...props} value={row.startDate ? row.startDate?.split('-')?.[0] : ''} />;
  }

  if (column.key === 'modifiedBy') {
    return <CellRenderer {...props} value={modifiedByName} />;
  }

  if (column.key === 'submittedBy') {
    return <CellRenderer {...props} value={submittedByName} />;
  }

  return <CellRenderer {...props} />;
}
