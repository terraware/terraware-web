import React, { type JSX } from 'react';

import { Typography } from '@mui/material';
import { Confirm } from '@terraware/web-components';

import strings from 'src/strings';

export type SubmitConfirmationDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

export default function SubmitConfirmationDialog({
  open,
  onClose,
  onSubmit,
}: SubmitConfirmationDialogProps): JSX.Element {
  return (
    <Confirm
      closeButtonId='cancelSubmitReport'
      closeButtonText={strings.CANCEL}
      confirmButtonId='confirmEdit'
      confirmButtonText={strings.REPORT_SUBMIT}
      message={
        <Typography fontSize='16px' fontWeight={400}>
          {strings.REPORT_CONFIRM_SUBMIT}
        </Typography>
      }
      onClose={onClose}
      onConfirm={onSubmit}
      open={open}
      title={strings.REPORT_SUBMIT}
    />
  );
}
