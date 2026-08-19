import React, { type JSX, useCallback, useEffect } from 'react';

import { Box, useTheme } from '@mui/material';

import { useLocalization, useUser } from 'src/providers';
import { AcceleratorReportPayload, useReviewAcceleratorReportMutation } from 'src/queries/generated/acceleratorReports';
import { AcceleratorReportStatus } from 'src/types/AcceleratorReport';
import useSnackbar from 'src/utils/useSnackbar';

import InternalComment from './InternalComment';

type ReportInternalCommentProps = {
  projectId: number;
  report: AcceleratorReportPayload;
};

const ReportInternalComment = ({ projectId, report }: ReportInternalCommentProps): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const { isAllowed } = useUser();
  const snackbar = useSnackbar();

  const [reviewReport, reviewReportResponse] = useReviewAcceleratorReportMutation();

  useEffect(() => {
    if (reviewReportResponse.isError) {
      snackbar.toastError();
    } else if (reviewReportResponse.isSuccess) {
      snackbar.toastSuccess(strings.CHANGES_SAVED);
    }
  }, [snackbar, reviewReportResponse.isError, reviewReportResponse.isSuccess, strings.CHANGES_SAVED]);

  const onUpdateInternalComment = useCallback(
    (internalComment: string, status: AcceleratorReportStatus) => {
      void reviewReport({
        reportId: report.id,
        projectId,
        reviewAcceleratorReportRequestPayload: {
          review: {
            ...report,
            internalComment,
            status,
          },
        },
      });
    },
    [reviewReport, report, projectId]
  );

  return (
    <Box
      border={`1px solid ${theme.palette.TwClrBaseGray100}`}
      borderRadius={theme.spacing(1)}
      marginBottom={theme.spacing(3)}
      padding={theme.spacing(2)}
    >
      <InternalComment entity={report} update={onUpdateInternalComment} disabled={!isAllowed('EDIT_REPORTS')} />
    </Box>
  );
};

export default ReportInternalComment;
