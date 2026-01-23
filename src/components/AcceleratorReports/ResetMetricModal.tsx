import React, { type JSX } from 'react';

import { Typography } from '@mui/material';
import { Confirm } from '@terraware/web-components';

import strings from 'src/strings';

export type ResetMetricModalProps = {
  onClose: () => void;
  onSubmit: () => void;
};

export default function DeleteConfirmationDialog({ onClose, onSubmit }: ResetMetricModalProps): JSX.Element {
  return (
    <Confirm
      closeButtonId='cancelResetMetric'
      closeButtonText={strings.CANCEL}
      confirmButtonId='confirmResetMetric'
      confirmButtonPriority='primary'
      confirmButtonText={strings.RESET}
      confirmButtonType='destructive'
      message={
        <Typography fontSize='16px' fontWeight={400}>
          {strings.RESET_METRIC_CONFIRM}
        </Typography>
      }
      onClose={onClose}
      onConfirm={onSubmit}
      open={true}
      title={strings.RESET_METRIC}
    />
  );
}
