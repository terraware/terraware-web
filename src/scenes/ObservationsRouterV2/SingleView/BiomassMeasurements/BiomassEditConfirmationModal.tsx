import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, DialogBox } from '@terraware/web-components';

import { useLocalization } from 'src/providers';

export type BiomassEditConfirmationModalProps = {
  confirmLabel: string;
  details: string;
  detailsHeading: string;
  destructive?: boolean;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
};

const BiomassEditConfirmationModal = ({
  confirmLabel,
  details,
  detailsHeading,
  destructive,
  message,
  onClose,
  onConfirm,
  title,
}: BiomassEditConfirmationModalProps): JSX.Element => {
  const { strings } = useLocalization();
  const theme = useTheme();

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={title}
      size='medium'
      middleButtons={[
        <Button
          id='cancelBiomassEdit'
          key='button-1'
          label={strings.CANCEL}
          onClick={onClose}
          priority='secondary'
          size='medium'
          type='passive'
        />,
        <Button
          id='confirmBiomassEdit'
          key='button-2'
          label={confirmLabel}
          onClick={onConfirm}
          size='medium'
          type={destructive ? 'destructive' : 'productive'}
        />,
      ]}
      skrim={true}
    >
      <Typography fontSize='16px' textAlign='left'>
        {message}
      </Typography>
      <Box
        borderRadius={theme.spacing(1)}
        marginTop={2}
        padding={2}
        sx={{ backgroundColor: theme.palette.TwClrBgSecondary }}
        textAlign='left'
      >
        <Typography fontSize='16px' fontWeight={600}>
          {detailsHeading}
        </Typography>
        <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px'>
          {details}
        </Typography>
      </Box>
    </DialogBox>
  );
};

export default BiomassEditConfirmationModal;
