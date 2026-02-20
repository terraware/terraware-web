import React, { type JSX, useCallback, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, DialogBox, Textfield } from '@terraware/web-components';

import { useLocalization } from 'src/providers';

export type RejectDialogProps = {
  onClose: () => void;
  onSubmit: (feedback: string) => void;
  initialFeedback?: string;
};

export default function RejectDialog({ onClose, onSubmit, initialFeedback }: RejectDialogProps): JSX.Element {
  const [feedback, setFeedback] = useState<string>(initialFeedback ?? '');
  const [validate, setValidate] = useState<boolean>(false);
  const theme = useTheme();
  const { strings } = useLocalization();

  const reject = useCallback(() => {
    setValidate(true);
    if (feedback) {
      onSubmit(feedback);
    }
  }, [feedback, onSubmit]);

  const setFeedbackCallback = useCallback((value: any) => {
    setFeedback(value as string);
  }, []);

  return (
    <DialogBox
      open={true}
      title={strings.REQUEST_UPDATE}
      size='medium'
      onClose={onClose}
      middleButtons={[
        <Button
          id='cancelReject'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onClose}
          key='button-1'
        />,
        <Button
          id='confirmReject'
          priority='primary'
          type='destructive'
          label={strings.REQUEST_UPDATE}
          onClick={reject}
          key='button-2'
        />,
      ]}
    >
      <Typography fontSize='16px' fontWeight={400} lineHeight='24px' marginBottom={theme.spacing(2)}>
        {strings.REQUEST_UPDATE_REASON}
      </Typography>
      <Box textAlign='left'>
        <Textfield
          autoFocus
          errorText={validate && !feedback.trim() ? strings.REQUIRED_FIELD : ''}
          label={strings.FEEDBACK}
          id='feedback'
          onChange={setFeedbackCallback}
          required
          type='textarea'
          value={feedback}
        />
      </Box>
    </DialogBox>
  );
}
