import React, { type JSX, useState } from 'react';

import { Grid } from '@mui/material';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';

type SaveAndNotifyNurseryModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
  busy?: boolean;
};

const SaveAndNotifyNurseryModal = ({ open, onClose, onConfirm, busy }: SaveAndNotifyNurseryModalProps): JSX.Element => {
  const [note, setNote] = useState('');

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={strings.SAVE_AND_REQUEST}
      size='medium'
      skrim={true}
      middleButtons={[
        <Button
          key='cancel-notify-nursery'
          id='cancelNotifyNursery'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onClose}
          size='medium'
          disabled={busy}
        />,
        <Button
          key='confirm-notify-nursery'
          id='confirmNotifyNursery'
          label={strings.SAVE_AND_REQUEST}
          onClick={() => onConfirm(note)}
          size='medium'
          disabled={busy}
        />,
      ]}
    >
      <Grid container spacing={2} sx={{ padding: 0 }} textAlign='left'>
        <Grid item xs={12}>
          <TextField
            id='nurseryNote'
            type='textarea'
            label={strings.NOTE_FOR_NURSERY}
            value={note}
            onChange={(value) => setNote(String(value ?? ''))}
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
};

export default SaveAndNotifyNurseryModal;
