import React, { Typography, useTheme } from '@mui/material';
import { Confirm } from '@terraware/web-components';

import strings from 'src/strings';

export type ApproveDialogProps = {
  onClose: () => void;
  onSubmit: () => void;
};

export default function ApproveDeliverableDialog({ onClose, onSubmit }: ApproveDialogProps): JSX.Element {
  const theme = useTheme();

  return (
    <Confirm
      closeButtonId='cancelApprove'
      closeButtonText={strings.CANCEL}
      confirmButtonId='confirmApprove'
      confirmButtonText={strings.APPROVE}
      message={
        <>
          <Typography fontSize='16px' fontWeight={400} lineHeight='24px' marginBottom={theme.spacing(2)}>
            {strings.YOU_ARE_ABOUT_TO_APPROVE_THIS_DELIVERABLE}
          </Typography>

          <Typography fontSize='16px' fontWeight={400} lineHeight='24px' marginBottom={theme.spacing(2)}>
            {strings.ARE_YOU_SURE}
          </Typography>
        </>
      }
      onClose={onClose}
      onConfirm={onSubmit}
      open={true}
      title={strings.APPROVE_DELIVERABLE}
    />
  );
}
