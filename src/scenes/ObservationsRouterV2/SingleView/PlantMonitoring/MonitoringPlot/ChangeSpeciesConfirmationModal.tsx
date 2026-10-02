import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, DialogBox } from '@terraware/web-components';

import { useLocalization } from 'src/providers';

export type ChangeSpeciesConfirmationModalProps = {
  /** The counts carried over to the new species, already labelled and joined for display. */
  countsSummary: string;
  fromSpeciesName: string;
  onClose: () => void;
  onConfirm: () => void;
  toSpeciesName: string;
};

const ChangeSpeciesConfirmationModal = ({
  countsSummary,
  fromSpeciesName,
  onClose,
  onConfirm,
  toSpeciesName,
}: ChangeSpeciesConfirmationModalProps): JSX.Element => {
  const { strings } = useLocalization();
  const theme = useTheme();

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.CHANGE_SPECIES_CONFIRMATION}
      size='medium'
      middleButtons={[
        <Button
          id='cancelChangeSpecies'
          key='button-1'
          label={strings.CANCEL}
          onClick={onClose}
          priority='secondary'
          size='medium'
          type='passive'
        />,
        <Button
          id='confirmChangeSpecies'
          key='button-2'
          label={strings.CHANGE_SPECIES}
          onClick={onConfirm}
          size='medium'
        />,
      ]}
      skrim={true}
    >
      <Typography fontSize='16px' textAlign='left'>
        {strings.formatString(strings.CHANGE_SPECIES_CONFIRMATION_MESSAGE, fromSpeciesName, toSpeciesName)}
      </Typography>
      <Box
        borderRadius={theme.spacing(1)}
        marginTop={2}
        padding={2}
        sx={{ backgroundColor: theme.palette.TwClrBgSecondary }}
        textAlign='left'
      >
        <Typography fontSize='16px' fontWeight={600}>
          {`${fromSpeciesName} → ${toSpeciesName}`}
        </Typography>
        <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px'>
          {countsSummary}
        </Typography>
      </Box>
    </DialogBox>
  );
};

export default ChangeSpeciesConfirmationModal;
