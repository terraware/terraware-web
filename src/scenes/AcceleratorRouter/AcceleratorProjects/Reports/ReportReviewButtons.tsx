import React, { type JSX, useCallback, useEffect, useState } from 'react';

import { Button } from '@terraware/web-components';

import { toReportReviewPayload } from 'src/components/AcceleratorReports/utils';
import useAcceleratorReportActions from 'src/hooks/useAcceleratorReportActions';
import useOneAcceleratorReport from 'src/hooks/useOneAcceleratorReport';
import { useLocalization, useUser } from 'src/providers';
import { ReportReviewPayload } from 'src/queries/generated/acceleratorReports';
import useSnackbar from 'src/utils/useSnackbar';

import ApproveReportDialog from './ApproveReportDialog';
import RejectDialog from './RejectDialog';

const NO_WRAP = { '&.button': { minWidth: 'auto', whiteSpace: 'nowrap' } };

type ReportReviewButtonsProps = {
  reportId: number;
};

const ReportReviewButtons = ({ reportId }: ReportReviewButtonsProps): JSX.Element | null => {
  const { strings } = useLocalization();
  const { isAllowed } = useUser();
  const snackbar = useSnackbar();

  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const { report } = useOneAcceleratorReport(reportId);

  // a report can only be reviewed once it has been submitted
  const notReviewable = report?.status === undefined || report.status === 'Not Submitted';

  const { reviewReport, reviewReportResponse } = useAcceleratorReportActions(reportId);

  useEffect(() => {
    if (reviewReportResponse.isError) {
      snackbar.toastError();
      reviewReportResponse.reset();
      return;
    }
    if (reviewReportResponse.isSuccess) {
      setShowApproveDialog(false);
      setShowRejectDialog(false);
      reviewReportResponse.reset();
    }
  }, [reviewReportResponse, snackbar]);

  const review = useCallback(
    (status: ReportReviewPayload['status'], feedback?: string) => {
      if (report) {
        void reviewReport({ review: { ...toReportReviewPayload(report), feedback, status } });
      }
    },
    [report, reviewReport]
  );

  const approveReport = useCallback(() => review('Approved'), [review]);

  const rejectReport = useCallback((feedback: string) => review('Needs Update', feedback), [review]);

  const openApproveDialog = useCallback(() => setShowApproveDialog(true), []);

  const closeApproveDialog = useCallback(() => setShowApproveDialog(false), []);

  const openRejectDialog = useCallback(() => setShowRejectDialog(true), []);

  const closeRejectDialog = useCallback(() => setShowRejectDialog(false), []);

  if (!isAllowed('UPDATE_SUBMISSION_STATUS')) {
    return null;
  }

  return (
    <>
      {showApproveDialog && <ApproveReportDialog onClose={closeApproveDialog} onSubmit={approveReport} />}

      {showRejectDialog && <RejectDialog onClose={closeRejectDialog} onSubmit={rejectReport} />}

      <Button
        disabled={notReviewable || report.status === 'Needs Update'}
        id='rejectReport'
        label={strings.REQUEST_UPDATE_ACTION}
        onClick={openRejectDialog}
        priority='secondary'
        size='medium'
        sx={NO_WRAP}
        type='destructive'
      />

      <Button
        disabled={notReviewable || report.status === 'Approved'}
        id='approveReport'
        label={strings.APPROVE}
        onClick={openApproveDialog}
        size='medium'
        sx={NO_WRAP}
      />
    </>
  );
};

export default ReportReviewButtons;
