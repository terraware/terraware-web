import { useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, DialogBox, Textfield } from '@terraware/web-components';

import strings from 'src/strings';

export type RejectDialogProps = {
  onClose: () => void;
  onSubmit: (feedback: string) => void;
};

export default function RejectDialog({ onClose, onSubmit }: RejectDialogProps): JSX.Element {
  const [feedback, setFeedback] = useState<string>('');
  const [validate, setValidate] = useState<boolean>(false);
  const theme = useTheme();

  const reject = () => {
    setValidate(true);
    if (feedback) {
      onSubmit(feedback);
    }
  };

  return (
    <DialogBox
      open={true}
      title={strings.REJECT}
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
          label={strings.REJECT}
          onClick={reject}
          key='button-2'
        />,
      ]}
    >
      <Typography fontSize='16px' fontWeight={400} lineHeight='24px' marginBottom={theme.spacing(2)}>
        {strings.REJECT_REASON}
      </Typography>
      <Box textAlign='left'>
        <Textfield
          autoFocus
          errorText={validate && !feedback.trim() ? strings.REQUIRED_FIELD : ''}
          label={strings.FEEDBACK}
          id='feedback'
          onChange={(value) => setFeedback(value as string)}
          type='textarea'
          value={feedback}
        />
      </Box>
    </DialogBox>
  );
}
