import React, { type JSX, useCallback, useState } from 'react';

import { Box, Grid, Typography } from '@mui/material';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';

export interface EditProgressModalProps {
  onClose: () => void;
  onChange: (value: string) => void;
  value?: number;
  metricName: string;
  target: number;
}

export default function EditProgressModal(props: EditProgressModalProps): JSX.Element {
  const { onClose, onChange, value, metricName, target } = props;

  const [newProgress, setNewProgress] = useState(value);

  const save = useCallback(() => {
    if (newProgress) {
      onChange(newProgress.toString());
      onClose();
    }
  }, [newProgress, onChange, onClose]);

  const onCloseHandler = useCallback(() => {
    onChange(value?.toString() || '');
    onClose();
  }, [onChange, onClose, value]);

  const setNewProgressCallback = useCallback((newValue: any) => {
    setNewProgress(newValue as number);
  }, []);

  return (
    <DialogBox
      onClose={onCloseHandler}
      open={true}
      title={metricName}
      size='medium'
      middleButtons={[
        <Button
          id='cancel'
          label={strings.CANCEL}
          type='passive'
          onClick={onCloseHandler}
          priority='secondary'
          key='button-1'
        />,
        <Button id='save' onClick={save} label={strings.SAVE} key='button-2' />,
      ]}
    >
      <Grid container textAlign={'left'} spacing={2}>
        <Grid item xs={12}>
          <Box display={'flex'} alignItems={'center'}>
            <TextField
              type='number'
              label={strings.PROGRESS}
              value={newProgress}
              id={'progress'}
              onChange={setNewProgressCallback}
            />
            {
              <Typography paddingTop={3} paddingLeft={0.5}>
                / {target} ({strings.TARGET})
              </Typography>
            }
          </Box>
        </Grid>
      </Grid>
    </DialogBox>
  );
}
