import React, { type JSX } from 'react';

import { Typography, useTheme } from '@mui/material';
import { Confirm } from '@terraware/web-components';

import strings from 'src/strings';

export type ConcurrentEditorWarningDialogProps = {
  open: boolean;
  lockedBy: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ConcurrentEditorWarningDialog({
  open,
  lockedBy,
  onClose,
  onConfirm,
}: ConcurrentEditorWarningDialogProps): JSX.Element {
  const theme = useTheme();

  return (
    <Confirm
      closeButtonId='cancelEditReport'
      closeButtonText={strings.CANCEL}
      confirmButtonId='confirmEdit'
      confirmButtonText={strings.REPORT_EDIT}
      message={
        <>
          <Typography fontSize='16px' fontWeight={400}>
            {strings.formatString(strings.REPORT_CONCURRENT_EDITOR_WARNING_1, lockedBy ?? '')}
          </Typography>
          <Typography fontSize='16px' fontWeight={400} marginTop={theme.spacing(3)}>
            {strings.REPORT_CONCURRENT_EDITOR_WARNING_2}
          </Typography>
        </>
      }
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title={strings.REPORT_CONCURRENT_EDITOR}
    />
  );
}
