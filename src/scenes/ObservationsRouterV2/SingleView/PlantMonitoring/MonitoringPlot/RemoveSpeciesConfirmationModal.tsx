import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, DialogBox } from '@terraware/web-components';

import { useLocalization } from 'src/providers';

export type RemoveSpeciesConfirmationModalProps = {
  /** The counts about to be discarded, already labelled and joined for display. */
  countsSummary: string;
  onClose: () => void;
  onConfirm: () => void;
  speciesName: string;
};

const RemoveSpeciesConfirmationModal = ({
  countsSummary,
  onClose,
  onConfirm,
  speciesName,
}: RemoveSpeciesConfirmationModalProps): JSX.Element => {
  const { strings } = useLocalization();
  const theme = useTheme();

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.formatString(strings.REMOVE_SPECIES_CONFIRMATION, speciesName) as string}
      size='medium'
      middleButtons={[
        <Button
          id='cancelRemoveSpecies'
          key='button-1'
          label={strings.CANCEL}
          onClick={onClose}
          priority='secondary'
          size='medium'
          type='passive'
        />,
        <Button
          id='confirmRemoveSpecies'
          key='button-2'
          label={strings.REMOVE}
          onClick={onConfirm}
          size='medium'
          type='destructive'
        />,
      ]}
      skrim={true}
    >
      <Typography fontSize='16px' textAlign='left'>
        {strings.REMOVE_SPECIES_CONFIRMATION_MESSAGE}
      </Typography>
      <Box
        borderRadius={theme.spacing(1)}
        marginTop={2}
        padding={2}
        sx={{ backgroundColor: theme.palette.TwClrBgSecondary }}
        textAlign='left'
      >
        <Typography fontSize='16px' fontWeight={600}>
          {speciesName}
        </Typography>
        <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px'>
          {countsSummary}
        </Typography>
      </Box>
    </DialogBox>
  );
};

export default RemoveSpeciesConfirmationModal;
