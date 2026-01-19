import React, { type JSX, useMemo } from 'react';

import { Typography, useTheme } from '@mui/material';
import { Confirm } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { DeliverableTypeType } from 'src/types/Deliverables';

export type ApproveDialogProps = {
  onClose: () => void;
  onSubmit: () => void;
  deliverableType: DeliverableTypeType;
  approveMessage?: string;
};

export default function ApproveDeliverableDialog({
  onClose,
  onSubmit,
  deliverableType,
  approveMessage,
}: ApproveDialogProps): JSX.Element {
  const theme = useTheme();
  const { activeLocale } = useLocalization();

  const defaultApproveMessages = useMemo(() => {
    if (!activeLocale) {
      return undefined;
    }

    switch (deliverableType) {
      case 'Document':
        return strings.YOU_ARE_ABOUT_TO_APPROVE_THIS_DELIVERABLE;
      case 'Species':
        return strings.YOU_ARE_ABOUT_TO_APPROVE_THIS_SPECIES_DELIVERABLE;
      case 'Questions':
        return strings.YOU_ARE_ABOUT_TO_APPROVE_THIS_QUESTIONS_DELIVERABLE;
    }
  }, [activeLocale, deliverableType]);

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
            {approveMessage ?? defaultApproveMessages}
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
