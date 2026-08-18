import React, { type JSX } from 'react';

import { Typography } from '@mui/material';
import { Confirm } from '@terraware/web-components';

import { useLocalization } from 'src/providers';

type ResetIndicatorModalProps = {
  onClose: () => void;
  onSubmit: () => void;
};

const ResetIndicatorModal = ({ onClose, onSubmit }: ResetIndicatorModalProps): JSX.Element => {
  const { strings } = useLocalization();

  return (
    <Confirm
      closeButtonId='cancelResetIndicator'
      closeButtonText={strings.CANCEL}
      confirmButtonId='confirmResetIndicator'
      confirmButtonPriority='primary'
      confirmButtonText={strings.RESET}
      confirmButtonType='destructive'
      message={
        <Typography fontSize='16px' fontWeight={400}>
          {strings.RESET_INDICATOR_CONFIRM}
        </Typography>
      }
      onClose={onClose}
      onConfirm={onSubmit}
      open={true}
      title={strings.RESET_INDICATOR}
    />
  );
};

export default ResetIndicatorModal;
