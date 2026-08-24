import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Message } from '@terraware/web-components';

import ApprovedReportMessage from 'src/components/AcceleratorReports/ApprovedReportMessage';
import RejectedReportMessage from 'src/components/AcceleratorReports/RejectedReportMessage';
import { toReportReviewPayload, unpublishedPropertyList } from 'src/components/AcceleratorReports/utils';
import useAcceleratorReportActions from 'src/hooks/useAcceleratorReportActions';
import useOneAcceleratorReport from 'src/hooks/useOneAcceleratorReport';
import { useLocalization, useUser } from 'src/providers';
import RejectDialog from 'src/scenes/AcceleratorRouter/AcceleratorProjects/Reports/RejectDialog';
import useSnackbar from 'src/utils/useSnackbar';

type ReportMessagesProps = {
  isConsoleView?: boolean;
  reportId: number;
};

const ReportMessages = ({ isConsoleView, reportId }: ReportMessagesProps): JSX.Element | null => {
  const { strings } = useLocalization();
  const { isAllowed } = useUser();
  const theme = useTheme();
  const snackbar = useSnackbar();

  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const { report } = useOneAcceleratorReport(reportId);

  const { reviewFeedback, reviewFeedbackResponse } = useAcceleratorReportActions(reportId);

  useEffect(() => {
    if (reviewFeedbackResponse.isError) {
      snackbar.toastError();
      reviewFeedbackResponse.reset();
      return;
    }
    if (reviewFeedbackResponse.isSuccess) {
      setShowRejectDialog(false);
      reviewFeedbackResponse.reset();
    }
  }, [reviewFeedbackResponse, snackbar]);

  const unpublishedChanges = useMemo(() => {
    if (!isConsoleView || !report?.unpublishedProperties?.length) {
      return null;
    }

    const propertyList = unpublishedPropertyList(report.unpublishedProperties, strings);

    return (
      <Box display='flex' flexDirection='column' gap={1}>
        <Typography fontSize='14px'>{strings.UNPUBLISHED_CHANGES_WARNING}</Typography>

        <Typography fontSize='14px'>{strings.UNPUBLISHED_CHANGES_WARNING_RESOLUTION}</Typography>

        <Typography fontSize='14px'>
          {strings.UNPUBLISHED_CHANGES_WARNING_SECTION} {propertyList}
        </Typography>
      </Box>
    );
  }, [isConsoleView, report, strings]);

  const openRejectDialog = useCallback(() => setShowRejectDialog(true), []);

  const closeRejectDialog = useCallback(() => setShowRejectDialog(false), []);

  const editFeedback = useCallback(
    (feedback: string) => {
      if (report) {
        void reviewFeedback({ review: { ...toReportReviewPayload(report), feedback } });
      }
    },
    [report, reviewFeedback]
  );

  if (!report) {
    return null;
  }

  return (
    <>
      {showRejectDialog && (
        <RejectDialog initialFeedback={report.feedback} onClose={closeRejectDialog} onSubmit={editFeedback} />
      )}

      <ApprovedReportMessage report={report} />

      <RejectedReportMessage
        report={report}
        showRejectDialog={isConsoleView && isAllowed('UPDATE_SUBMISSION_STATUS') ? openRejectDialog : undefined}
      />

      {unpublishedChanges && (
        <Box marginBottom={theme.spacing(2)}>
          <Message body={unpublishedChanges} priority='warning' title={strings.UNPUBLISHED_CHANGES} type='page' />
        </Box>
      )}
    </>
  );
};

export default ReportMessages;
