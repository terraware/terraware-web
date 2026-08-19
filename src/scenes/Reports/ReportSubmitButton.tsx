import React, { type JSX, useCallback, useEffect, useState } from 'react';

import { Button } from '@terraware/web-components';

import useAcceleratorReportActions from 'src/hooks/useAcceleratorReportActions';
import useOneAcceleratorReport from 'src/hooks/useOneAcceleratorReport';
import { useLocalization } from 'src/providers';
import useSnackbar from 'src/utils/useSnackbar';

import SubmitReportDialog from './SubmitReportDialog';

type ReportSubmitButtonProps = {
  reportId: number;
};

const ReportSubmitButton = ({ reportId }: ReportSubmitButtonProps): JSX.Element => {
  const { strings } = useLocalization();
  const snackbar = useSnackbar();

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  const { isFetching, report } = useOneAcceleratorReport(reportId);

  const { isLoading, submitReport, submitReportResponse } = useAcceleratorReportActions(reportId);

  useEffect(() => {
    if (submitReportResponse.isError) {
      snackbar.toastError();
      submitReportResponse.reset();
    }
  }, [snackbar, submitReportResponse]);

  const status = report?.status;

  const disabled = (status !== 'Not Submitted' && status !== 'Needs Update') || isFetching || isLoading;

  const openSubmitDialog = useCallback(() => setShowSubmitDialog(true), []);

  const closeSubmitDialog = useCallback(() => setShowSubmitDialog(false), []);

  const onSubmit = useCallback(() => {
    void submitReport();
    setShowSubmitDialog(false);
  }, [submitReport]);

  return (
    <>
      {showSubmitDialog && <SubmitReportDialog onClose={closeSubmitDialog} onSubmit={onSubmit} />}

      <Button
        disabled={disabled}
        id='submitReport'
        label={strings.SUBMIT_FOR_APPROVAL}
        onClick={openSubmitDialog}
        size='medium'
        sx={{ '&.button': { whiteSpace: 'nowrap', minWidth: 'auto' } }}
      />
    </>
  );
};

export default ReportSubmitButton;
