import React, { type JSX } from 'react';

import { Box, Drawer, IconButton, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';

import Button from 'src/components/common/button/Button';
import { useLocalization } from 'src/providers';
import { PlantingDateRequestRow, PlantingDateRequestSpeciesDetail } from 'src/queries/search/plantingDateRequests';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

import PlantingDateRequestFulfillmentBadge from './PlantingDateRequestFulfillmentBadge';
import { speciesStatus, useRequestedSpecies } from './RequestedSpeciesTable';
import { useRequestedSpeciesSubtitle } from './requestedSpeciesSubtitle';

type RequestedSpeciesBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  onWithdrawClick: () => void;
  request: PlantingDateRequestRow;
};

const RequestedSpeciesBottomSheet = ({
  open,
  onClose,
  onWithdrawClick,
  request,
}: RequestedSpeciesBottomSheetProps): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const { format } = useNumberFormatter();
  const { species, remainingPlants } = useRequestedSpecies(request);
  const subtitle = useRequestedSpeciesSubtitle(request);

  return (
    <Drawer
      anchor='bottom'
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: theme.spacing(1.5, 1.5, 0, 0),
          maxHeight: '82vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box display='flex' justifyContent='center' paddingTop={theme.spacing(1)}>
        <Box width='40px' height='4px' borderRadius='2px' sx={{ backgroundColor: theme.palette.TwClrBrdrSecondary }} />
      </Box>

      <Box
        display='flex'
        alignItems='flex-start'
        justifyContent='space-between'
        gap={theme.spacing(1)}
        padding={theme.spacing(1, 2, 2)}
        sx={{ borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}` }}
      >
        <Box>
          <Typography fontSize='20px' fontWeight={600}>
            {strings.VIEW_REQUESTED_SPECIES_QUANTITIES}
          </Typography>
          <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
            {subtitle}
          </Typography>
        </Box>
        <IconButton onClick={onClose} aria-label={strings.CLOSE} sx={{ minWidth: '44px', minHeight: '44px' }}>
          <Icon name='close' size='medium' fillColor={theme.palette.TwClrIcnSecondary} />
        </IconButton>
      </Box>

      <Box flex={1} sx={{ overflowY: 'auto' }}>
        {species.map((speciesDetail) => (
          <SpeciesEntry key={speciesDetail.speciesId} species={speciesDetail} />
        ))}
      </Box>

      <Box
        display='flex'
        alignItems='center'
        justifyContent='space-between'
        gap={theme.spacing(2)}
        padding={theme.spacing(2)}
        sx={{
          backgroundColor: theme.palette.TwClrBgSecondary,
          borderTop: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
        }}
      >
        <Typography fontSize='14px'>
          {strings.formatString(strings.X_REQUESTED, <b>{format(request.requestedPlants)}</b>)}
          {' · '}
          {strings.formatString(strings.X_WITHDRAWN, <b>{format(request.withdrawnPlants)}</b>)}
          {remainingPlants > 0 && (
            <Typography component='span' fontSize='14px' color={theme.palette.TwClrTxtWarning}>
              {' \u00b7 '}
              {strings.formatString(strings.X_LEFT, <b>{format(remainingPlants)}</b>)}
            </Typography>
          )}
        </Typography>
        <Button id='withdrawRequestedSpecies' label={strings.WITHDRAW} onClick={onWithdrawClick} size='medium' />
      </Box>
    </Drawer>
  );
};

const SpeciesEntry = ({ species }: { species: PlantingDateRequestSpeciesDetail }): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const { format } = useNumberFormatter();

  const remaining = Math.max(0, species.requestedQuantity - species.withdrawnQuantity);

  return (
    <Box padding={theme.spacing(2)} sx={{ borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}` }}>
      <Box display='flex' alignItems='center' justifyContent='space-between' gap={theme.spacing(1)}>
        <Typography fontSize='16px' fontStyle='italic'>
          {species.scientificName}
        </Typography>
        <PlantingDateRequestFulfillmentBadge
          status={speciesStatus(species.requestedQuantity, species.withdrawnQuantity)}
        />
      </Box>
      <Box display='flex' gap={theme.spacing(2)} marginTop={theme.spacing(0.5)} flexWrap='wrap'>
        <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
          {strings.formatString(strings.REQUESTED_X, <b>{format(species.requestedQuantity)}</b>)}
        </Typography>
        <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
          {strings.formatString(strings.WITHDRAWN_X, <b>{format(species.withdrawnQuantity)}</b>)}
        </Typography>
        {remaining > 0 && species.withdrawnQuantity > 0 && (
          <Typography fontSize='14px' color={theme.palette.TwClrTxtWarning}>
            {strings.formatString(strings.X_LEFT, format(remaining))}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default RequestedSpeciesBottomSheet;
