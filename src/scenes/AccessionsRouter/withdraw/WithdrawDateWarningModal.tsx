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
            label={strings.CANCEL}
            priority='secondary'
            type='passive'
            onClick={onClose}
            size='medium'
            key='button-1'
          />,
          <Button
            id='continueWithdrawDateWarning'
            label={strings.CONTINUE}
            onClick={onContinue}
            size='medium'
            key='button-2'
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
