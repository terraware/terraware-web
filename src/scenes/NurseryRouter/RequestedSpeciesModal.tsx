import React, { type JSX, useEffect } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import DialogBox from '@terraware/web-components/components/DialogBox/DialogBox';

import Button from 'src/components/common/button/Button';
import { useLocalization } from 'src/providers';
import { PlantingDateRequestRow } from 'src/queries/search/plantingDateRequests';

import { RequestedSpeciesTable, useRequestedSpecies } from './RequestedSpeciesTable';
import { useRequestedSpeciesSubtitle } from './requestedSpeciesSubtitle';

type RequestedSpeciesModalProps = {
  open: boolean;
  onClose: () => void;
  onWithdrawClick: () => void;
  request: PlantingDateRequestRow;
};

const RequestedSpeciesModal = ({
  open,
  onClose,
  onWithdrawClick,
  request,
}: RequestedSpeciesModalProps): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const { species, remainingPlants } = useRequestedSpecies(request);
  const subtitle = useRequestedSpeciesSubtitle(request);

  useEffect(() => {
    if (!open) {
      return;
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose, open]);

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={strings.VIEW_SPECIES_QUANTITIES}
      size='x-large'
      scrolled={true}
      skrim={true}
      middleButtons={[
        <Button
          key='close-requested-species'
          id='closeRequestedSpecies'
          label={strings.CLOSE}
          priority='secondary'
          type='passive'
          onClick={onClose}
          size='medium'
        />,
        <Button
          key='withdraw-requested-species'
          id='withdrawRequestedSpecies'
          label={strings.WITHDRAW}
          onClick={onWithdrawClick}
          size='medium'
        />,
      ]}
    >
      <Box textAlign='left'>
        <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
          {subtitle}
        </Typography>

        <Box marginTop={theme.spacing(2)}>
          <RequestedSpeciesTable
            species={species}
            requestedPlants={request.requestedPlants}
            withdrawnPlants={request.withdrawnPlants}
            remainingPlants={remainingPlants}
            status={request.status}
          />
        </Box>
      </Box>
    </DialogBox>
  );
};

export default RequestedSpeciesModal;
