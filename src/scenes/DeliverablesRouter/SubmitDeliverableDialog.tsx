import React, { type JSX } from 'react';

import { Typography, useTheme } from '@mui/material';
import { Confirm } from '@terraware/web-components';

import strings from 'src/strings';

export type SubmitDialogProps = {
  onClose: () => void;
  onSubmit: () => void;
  submitMessage?: string;
};

export default function SubmitDeliverableDialog({ onClose, onSubmit, submitMessage }: SubmitDialogProps): JSX.Element {
  const theme = useTheme();

  return (
    <Confirm
      size={'medium'}
      closeButtonId='cancelSubmit'
      closeButtonText={strings.CANCEL}
      confirmButtonId='confirmSubmit'
      confirmButtonText={strings.SUBMIT}
      message={
        <Typography fontSize='16px' fontWeight={400} lineHeight='24px' marginBottom={theme.spacing(2)}>
          {submitMessage || strings.YOU_ARE_ABOUT_TO_SUBMIT_THIS_SPECIES_DELIVERABLE}
        </Typography>
      }
      onClose={onClose}
      onConfirm={onSubmit}
      open={true}
      title={strings.SUBMIT_FOR_APPROVAL}
    />
  );
}
