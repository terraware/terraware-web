import React from 'react';

import { Box } from '@mui/material';
import { Button, DialogBox } from '@terraware/web-components';

import strings from 'src/strings';

type WithdrawDateWarningModalProps = {
  onClose: () => void;
  onContinue: () => void;
};

const WithdrawDateWarningModal = ({ onClose, onContinue }: WithdrawDateWarningModalProps) => {
  return (
    <Box
      sx={{
        '& >.dialog-box-container--skrim': {
          zIndex: 2000,
        },
      }}
    >
      <DialogBox
        message={strings.WITHDRAW_DATE_PREDATES_RECEIVED_DATE_WARNING}
        middleButtons={[
          <Button
            id='cancelWithdrawDateWarning'
            key='button-1'
            label={strings.CANCEL}
            onClick={onClose}
            priority='secondary'
            size='medium'
            type='passive'
          />,
          <Button
            id='continueWithdrawDateWarning'
            key='button-2'
            label={strings.CONTINUE}
            onClick={onContinue}
            size='medium'
          />,
        ]}
        onClose={onClose}
        open
        size='medium'
        skrim
        title={strings.WITHDRAW_SEEDS}
      />
    </Box>
  );
};

export default WithdrawDateWarningModal;
