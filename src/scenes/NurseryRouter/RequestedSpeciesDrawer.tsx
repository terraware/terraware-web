import React, { type JSX } from 'react';

import { Box, Drawer, IconButton, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';

import Button from 'src/components/common/button/Button';
import { useLocalization } from 'src/providers';
import { PlantingDateRequestRow } from 'src/queries/search/plantingDateRequests';

import { RequestedSpeciesTable, useRequestedSpecies } from './RequestedSpeciesTable';
import { useRequestedSpeciesSubtitle } from './requestedSpeciesSubtitle';

type RequestedSpeciesDrawerProps = {
  open: boolean;
  onClose: () => void;
  onWithdrawClick: () => void;
  request: PlantingDateRequestRow;
};

/**
 * The quantities for a planting date request, as the tablet drawer. It keeps the dialog's table but
 * drops the remaining count from the total row, which the narrower status column can't hold.
 */
const RequestedSpeciesDrawer = ({
  open,
  onClose,
  onWithdrawClick,
  request,
}: RequestedSpeciesDrawerProps): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const { species } = useRequestedSpecies(request);
  const subtitle = useRequestedSpeciesSubtitle(request);

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '500px',
          maxWidth: '100vw',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box
        display='flex'
        alignItems='flex-start'
        justifyContent='space-between'
        gap={theme.spacing(1)}
        padding={theme.spacing(2, 3)}
        sx={{ borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}` }}
      >
        <Box>
          <Typography fontSize='20px' fontWeight={600}>
            {strings.VIEW_SPECIES_QUANTITIES}
          </Typography>
          <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
            {subtitle}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size='small' aria-label={strings.CLOSE}>
          <Icon name='close' size='medium' fillColor={theme.palette.TwClrIcnSecondary} />
        </IconButton>
      </Box>

      <Box flex={1} minHeight={0} padding={theme.spacing(0, 3)} sx={{ overflowY: 'auto' }}>
        <RequestedSpeciesTable
          species={species}
          requestedPlants={request.requestedPlants}
          withdrawnPlants={request.withdrawnPlants}
          status={request.status}
        />
      </Box>

      <Box display='flex' alignItems='center' justifyContent='center' gap={theme.spacing(1)} padding={theme.spacing(3)}>
        <Button
          id='closeRequestedSpecies'
          label={strings.CLOSE}
          priority='secondary'
          type='passive'
          onClick={onClose}
          size='medium'
        />
        <Button id='withdrawRequestedSpecies' label={strings.WITHDRAW} onClick={onWithdrawClick} size='medium' />
      </Box>
    </Drawer>
  );
};

export default RequestedSpeciesDrawer;
