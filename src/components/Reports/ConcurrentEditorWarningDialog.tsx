import React from 'react';
import strings from 'src/strings';
import { Button, DialogBox } from '@terraware/web-components';
import { Typography, useTheme } from '@mui/material';

export type ConcurrentEditorWarningDialogProps = {
  open: boolean;
  lockedBy: string;
  onClose: () => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConcurrentEditorWarningDialog({
  open,
  lockedBy,
  onCancel,
  onClose,
  onConfirm,
}: ConcurrentEditorWarningDialogProps): JSX.Element {
  const theme = useTheme();

  return (
    <DialogBox
      open={open}
      title={strings.REPORT_CONCURRENT_EDITOR}
      size='medium'
      onClose={onClose}
      middleButtons={[
        <Button
          id='cancelEditReport'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onCancel}
          key='button-1'
        />,
        <Button id='confirmEdit' label={strings.REPORT_EDIT} onClick={onConfirm} key='button-2' />,
      ]}
    >
      <Typography fontSize='16px' fontWeight={400}>
        {strings.formatString(strings.REPORT_CONCURRENT_EDITOR_WARNING_1, lockedBy ?? '')}
      </Typography>
      <Typography fontSize='16px' fontWeight={400} marginTop={theme.spacing(3)}>
        {strings.REPORT_CONCURRENT_EDITOR_WARNING_2}
      </Typography>
    </DialogBox>
  );
}
