import React, { type JSX } from 'react';

import { Box, Typography } from '@mui/material';
import { Button, DialogBox } from '@terraware/web-components';

import ErrorMessage from 'src/components/DocumentProducer/ErrorMessage';
import strings from 'src/strings';

export type PartialErrorsDialogProps = {
  onClose: () => void;
  partialError: string;
};

const PartialErrorsDialog = ({ onClose, partialError }: PartialErrorsDialogProps): JSX.Element => (
  <Box
    sx={{
      '& >.dialog-box-container--skrim': {
        zIndex: 2000,
      },
    }}
  >
    <DialogBox
      skrim={true}
      onClose={onClose}
      open={true}
      title={strings.PARTIAL_ERRORS_TITLE}
      size='medium'
      middleButtons={[
        <Button
          id='partial-error'
          label={strings.OK}
          priority='secondary'
          type='passive'
          onClick={onClose}
          key='button-1'
        />,
      ]}
    >
      <Typography marginBottom={2}>{strings.PARTIAL_ERRORS}</Typography>
      <ErrorMessage error={partialError} fontSize={14} />
    </DialogBox>
  </Box>
);

export default PartialErrorsDialog;
