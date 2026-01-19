import React, { type JSX } from 'react';

import { Typography, useTheme } from '@mui/material';
import { Confirm } from '@terraware/web-components';

import strings from 'src/strings';

export type StatusChangeConfirmationDialogProps = {
  onClose: () => void;
  onConfirm: () => void;
};

export default function StatusChangeConfirmationDialog({
  onClose,
  onConfirm,
}: StatusChangeConfirmationDialogProps): JSX.Element {
  const theme = useTheme();

  return (
    <Confirm
      closeButtonText={strings.CANCEL}
      confirmButtonText={strings.CONTINUE_AND_RESET_STATUS}
      message={
        <>
          <Typography fontSize='16px' fontWeight={400} marginBottom={theme.spacing(2)}>
            {strings.DELIVERABLE_STATUS_CHANGE_CONFIRMATION_1}
          </Typography>

          <Typography fontSize='16px' fontWeight={400}>
            {strings.DELIVERABLE_STATUS_CHANGE_CONFIRMATION_2}
          </Typography>
        </>
      }
      onClose={onClose}
      onConfirm={onConfirm}
      open={true}
      size='large'
      title={strings.SUBMIT_DOCUMENT}
    />
  );
}
