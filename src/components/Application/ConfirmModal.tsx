import React from 'react';

import { Typography } from '@mui/material';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';

export type NewApplicationModalProps = {
  open: boolean;
  title: string;
  body: string;
  onClose: () => void;
  onConfirm: () => void;
};

const ConfirmModal = ({ open, title, body, onClose, onConfirm }: NewApplicationModalProps) => {
  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={title}
      size='medium'
      middleButtons={[
        <Button
          id='cancel'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onClose}
          key='cancel-button'
        />,
        <Button id='submit' label={strings.SUBMIT} onClick={onConfirm} key='submit-button' />,
      ]}
    >
      <Typography
        justifyContent={'center'}
        fontSize={'14px'}
        lineHeight={'20px'}
        fontWeight={400}
        whiteSpace='pre-wrap'
        sx={{ wordBreak: 'break-word' }}
      >
        {body}
      </Typography>
    </DialogBox>
  );
};

export default ConfirmModal;
