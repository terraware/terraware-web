import React, { type JSX } from 'react';

import { Typography } from '@mui/material';
import { Button, DialogBox } from '@terraware/web-components';

import strings from 'src/strings';

export type StartOverConfirmationProps = {
  onClose: () => void;
  onConfirm: () => void;
};

export default function StartOverConfirmation(props: StartOverConfirmationProps): JSX.Element {
  const { onClose, onConfirm } = props;

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.START_OVER}
      size='medium'
      middleButtons={[
        <Button
          id='cancelStartOver'
          label={strings.NO}
          type='passive'
          onClick={onClose}
          priority='secondary'
          key='button-1'
        />,
        <Button
          id='confirmStartOver'
          onClick={onConfirm}
          type='destructive'
          label={strings.START_OVER}
          key='button-2'
        />,
      ]}
      message={strings.START_OVER_WARNING}
    >
      <Typography>{strings.START_OVER_CONFIRMATION}</Typography>
    </DialogBox>
  );
}
