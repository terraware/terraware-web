import React from 'react';

import { Typography } from '@mui/material';
import { Confirm } from '@terraware/web-components';

import strings from 'src/strings';

export type CannotDeleteApplicationProjectProps = {
  open: boolean;
  onClose: () => void;
};

export default function CannotDeleteApplicationProject({
  open,
  onClose,
}: CannotDeleteApplicationProjectProps): JSX.Element {
  return (
    <Confirm
      confirmButtonId='confirmDeleteProject'
      confirmButtonPriority='primary'
      confirmButtonText={strings.CANCEL}
      message={
        <Typography fontSize='16px' fontWeight={400}>
          {strings.CANNOT_DELETE_APPLICATION_PROJECT}
        </Typography>
      }
      onClose={onClose}
      onConfirm={onClose}
      open={open}
      title={strings.DELETE_PROJECT}
    />
  );
}
