import React, { type JSX, useCallback, useEffect, useState } from 'react';

import { Button } from '@terraware/web-components';

import useOneAcceleratorReport from 'src/hooks/useOneAcceleratorReport';
import { useLocalization } from 'src/providers';
import { useSubmitOneAcceleratorReportMutation } from 'src/queries/generated/acceleratorReports';
import useSnackbar from 'src/utils/useSnackbar';

import SubmitReportDialog from './SubmitReportDialog';

export type ReportSubmitButtonProps = {
  reportId: number;
};

const ReportSubmitButton = ({ reportId }: ReportSubmitButtonProps): JSX.Element => {
  const { strings } = useLocalization();
  const snackbar = useSnackbar();

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  const { isFetching, report } = useOneAcceleratorReport(reportId);

  const [submit, submitResponse] = useSubmitOneAcceleratorReportMutation();

  useEffect(() => {
    if (submitResponse.isError) {
      snackbar.toastError();
    }
  }, [snackbar, submitResponse.isError]);

  const status = report?.status;

  const disabled = (status !== 'Not Submitted' && status !== 'Needs Update') || isFetching || submitResponse.isLoading;

  const openSubmitDialog = useCallback(() => setShowSubmitDialog(true), []);

  const closeSubmitDialog = useCallback(() => setShowSubmitDialog(false), []);

  const submitReport = useCallback(() => {
    void submit(reportId);
    setShowSubmitDialog(false);
  }, [reportId, submit]);

  return (
    <>
      {showSubmitDialog && <SubmitReportDialog onClose={closeSubmitDialog} onSubmit={submitReport} />}

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
