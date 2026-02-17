import React, { type JSX } from 'react';

import { Typography, useTheme } from '@mui/material';
import { Confirm } from '@terraware/web-components';

import strings from 'src/strings';

export type PublishModalProps = {
  onClose: () => void;
  onSubmit: () => void;
};

export default function PublishModal({ onClose, onSubmit }: PublishModalProps): JSX.Element {
  const theme = useTheme();

  return (
    <Confirm
      size={'medium'}
      closeButtonId='cancelPublish'
      closeButtonText={strings.CANCEL}
      confirmButtonId='confirmPublish'
      confirmButtonText={strings.PUBLISH}
      message={
        <>
          <Typography fontSize='16px' fontWeight={400} lineHeight='24px' marginBottom={theme.spacing(2)}>
            {strings.YOU_ARE_ABOUT_TO_PUBLISH}
          </Typography>

          <Typography fontSize='16px' fontWeight={600} lineHeight='24px' marginBottom={theme.spacing(2)}>
            {strings.THIS_ACTION_IS_NON_REVERSIBLE}
          </Typography>

          <Typography fontSize='16px' fontWeight={400} lineHeight='24px' marginBottom={theme.spacing(2)}>
            {strings.ARE_YOU_SURE}
          </Typography>
        </>
      }
      onClose={onClose}
      onConfirm={onSubmit}
      open={true}
      title={strings.PUBLISH_TO_FUNDER_PORTAL}
    />
  );
}
