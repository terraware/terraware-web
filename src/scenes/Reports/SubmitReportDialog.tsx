import React, { type JSX } from 'react';

import { Typography, useTheme } from '@mui/material';
import { Confirm } from '@terraware/web-components';

import strings from 'src/strings';

export type SubmitDialogProps = {
  onClose: () => void;
  onSubmit: () => void;
};

export default function SubmitReportDialog({ onClose, onSubmit }: SubmitDialogProps): JSX.Element {
  const theme = useTheme();

  return (
    <Confirm
      closeButtonId='cancelSubmit'
      closeButtonText={strings.CANCEL}
      confirmButtonId='confirmSubmit'
      confirmButtonText={strings.SUBMIT}
      message={
        <Typography fontSize='16px' fontWeight={400} lineHeight='24px' marginBottom={theme.spacing(2)}>
          {strings.SUBMIT_ACCELERATOR_REPORT_MESSAGE}
        </Typography>
      }
      onClose={onClose}
      onConfirm={onSubmit}
      open
      size='medium'
      title={strings.SUBMIT_FOR_APPROVAL}
    />
  );
}
