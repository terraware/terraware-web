import React, { type JSX, useCallback, useEffect, useState } from 'react';

import { Box, useTheme } from '@mui/material';

import AcceleratorReportStatusBadge from 'src/components/AcceleratorReports/AcceleratorReportStatusBadge';
import { useUser } from 'src/providers';
import { selectReviewAcceleratorReport } from 'src/redux/features/reports/reportsSelectors';
import { requestReviewAcceleratorReport } from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { AcceleratorReport, AcceleratorReportStatus } from 'src/types/AcceleratorReport';
import useSnackbar from 'src/utils/useSnackbar';

import InternalComment from './InternalComment';

export type MetadataProps = {
  report: AcceleratorReport;
  projectId: string;
  reload: () => void;
};

const Metadata = (props: MetadataProps): JSX.Element => {
  const { report, projectId, reload } = props;
  const [requestId, setRequestId] = useState('');
  const reviewAcceleratorReportResponse = useAppSelector(selectReviewAcceleratorReport(requestId));
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { isAllowed } = useUser();
  const snackbar = useSnackbar();

  useEffect(() => {
    if (reviewAcceleratorReportResponse?.status === 'error') {
      snackbar.toastError();
    } else if (reviewAcceleratorReportResponse?.status === 'success') {
      reload();
      snackbar.toastSuccess(strings.CHANGES_SAVED);
    }
  }, [reviewAcceleratorReportResponse, snackbar, reload]);

  const onUpdateInternalComment = useCallback(
    (internalComment: string, status: AcceleratorReportStatus) => {
      const request = dispatch(
        requestReviewAcceleratorReport({
          reportId: report.id,
          projectId: Number(projectId),
          review: {
            ...report,
            internalComment,
            status,
          },
        })
      );
      setRequestId(request.requestId);
    },
    [report, dispatch, projectId]
  );

  return (
    <Box display='flex' flexDirection='column'>
      <Box border={`1px solid ${theme.palette.TwClrBaseGray100}`} borderRadius='8px' marginBottom='16px' padding='16px'>
        {report.status !== 'Needs Update' && (
          <div style={{ float: 'right', marginBottom: '0px', marginLeft: '16px' }}>
            <AcceleratorReportStatusBadge status={report.status} />
          </div>
        )}
        <InternalComment entity={report} update={onUpdateInternalComment} disabled={!isAllowed('EDIT_REPORTS')} />
      </Box>
    </Box>
  );
};

export default Metadata;
