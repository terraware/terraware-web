import React, { Typography, useTheme } from '@mui/material';
import { Confirm } from '@terraware/web-components';

import strings from 'src/strings';

export type ApproveDialogProps = {
  onClose: () => void;
  onSubmit: () => void;
  deliverableType: string;
  approveMessage?: string;
};

export default function ApproveDeliverableDialog({
  onClose,
  onSubmit,
  deliverableType,
  approveMessage,
}: ApproveDialogProps): JSX.Element {
  const theme = useTheme();

  return (
    <Confirm
      size={deliverableType === 'Document' ? 'medium' : 'large'}
      closeButtonId='cancelApprove'
      closeButtonText={strings.CANCEL}
      confirmButtonId='confirmApprove'
      confirmButtonText={strings.APPROVE}
      message={
        <>
          <Typography fontSize='16px' fontWeight={400} lineHeight='24px' marginBottom={theme.spacing(2)}>
            {approveMessage
              ? approveMessage
              : deliverableType === 'Document'
                ? strings.YOU_ARE_ABOUT_TO_APPROVE_THIS_DELIVERABLE
                : strings.YOU_ARE_ABOUT_TO_APPROVE_THIS_SPECIES_DELIVERABLE}
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
