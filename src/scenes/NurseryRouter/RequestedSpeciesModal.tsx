import React, { type JSX, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import DialogBox from '@terraware/web-components/components/DialogBox/DialogBox';

import Button from 'src/components/common/button/Button';
import { useLocalization } from 'src/providers';
import { PlantingDateRequestRow, PlantingDateRequestStatus } from 'src/queries/search/plantingDateRequests';
import { getMediumDate } from 'src/utils/dateFormatter';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

import PlantingDateRequestFulfillmentBadge from './PlantingDateRequestFulfillmentBadge';

const gridTemplateColumns = '2fr 1fr 1fr 2fr';

const speciesStatus = (requestedQuantity: number, withdrawnQuantity: number): PlantingDateRequestStatus => {
  if (withdrawnQuantity <= 0) {
    return 'Pending';
  }
  return withdrawnQuantity >= requestedQuantity ? 'Fulfilled' : 'Partial';
};

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
  const { activeLocale, strings } = useLocalization();
  const { format } = useNumberFormatter();
  const { isDesktop } = useDeviceInfo();

  const subtitle = useMemo(
    () =>
      [
        strings.formatString(strings.X_SPECIES, format(request.speciesCount)).toString(),
        getMediumDate(request.date, activeLocale),
        request.plantingSeasonName,
        request.plantingSiteName,
      ].join(' · '),
    [activeLocale, format, request, strings]
  );

  const species = useMemo(
    () =>
      request.species.toSorted((a, b) => a.scientificName.localeCompare(b.scientificName, activeLocale || undefined)),
    [activeLocale, request.species]
  );

  const remainingPlants = useMemo(
    () =>
      species.reduce(
        (total, speciesDetail) =>
          total + Math.max(0, speciesDetail.requestedQuantity - speciesDetail.withdrawnQuantity),
        0
      ),
    [species]
  );

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={strings.VIEW_REQUESTED_SPECIES_QUANTITIES}
      size='x-large'
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
        ...(request.status === 'Fulfilled'
          ? []
          : [
              <Button
                key='withdraw-requested-species'
                id='withdrawRequestedSpecies'
                label={strings.WITHDRAW}
                onClick={onWithdrawClick}
                size='medium'
              />,
            ]),
      ]}
    >
      <Box textAlign='left'>
        <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
          {subtitle}
        </Typography>

        <Box
          display='grid'
          gridTemplateColumns={gridTemplateColumns}
          gap={theme.spacing(1)}
          padding={theme.spacing(1, 0)}
          marginTop={theme.spacing(2)}
          sx={{ borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}` }}
        >
          <Typography fontSize='14px' fontWeight={600}>
            {strings.SPECIES}
          </Typography>
          <Typography fontSize='14px' fontWeight={600} textAlign='right'>
            {strings.REQUESTED}
          </Typography>
          <Typography fontSize='14px' fontWeight={600} textAlign='right'>
            {strings.WITHDRAWN}
          </Typography>
          <Typography fontSize='14px' fontWeight={600} textAlign='right'>
            {strings.STATUS}
          </Typography>
        </Box>

        <Box maxHeight='320px' sx={{ overflowY: 'auto' }}>
          {species.map((speciesDetail) => (
            <Box
              key={speciesDetail.speciesId}
              display='grid'
              gridTemplateColumns={gridTemplateColumns}
              gap={theme.spacing(1)}
              alignItems='center'
              padding={theme.spacing(1.5, 0)}
              sx={{ borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}` }}
            >
              <Typography fontSize='16px' fontStyle='italic'>
                {speciesDetail.scientificName}
              </Typography>
              <Typography fontSize='16px' textAlign='right'>
                {format(speciesDetail.requestedQuantity)}
              </Typography>
              <Typography fontSize='16px' textAlign='right'>
                {format(speciesDetail.withdrawnQuantity)}
              </Typography>
              <Box display='flex' justifyContent='flex-end'>
                <PlantingDateRequestFulfillmentBadge
                  status={speciesStatus(speciesDetail.requestedQuantity, speciesDetail.withdrawnQuantity)}
                />
              </Box>
            </Box>
          ))}
        </Box>

        <Box
          display='grid'
          gridTemplateColumns={gridTemplateColumns}
          gap={theme.spacing(1)}
          alignItems='center'
          padding={theme.spacing(1.5, 1)}
          marginLeft={theme.spacing(-1)}
          marginRight={theme.spacing(-1)}
          sx={{ backgroundColor: theme.palette.TwClrBgSecondary }}
        >
          <Typography fontSize='16px' fontWeight={600}>
            {strings.TOTAL}
          </Typography>
          <Typography fontSize='16px' fontWeight={600} textAlign='right'>
            {format(request.requestedPlants)}
          </Typography>
          <Typography fontSize='16px' fontWeight={600} textAlign='right'>
            {format(request.withdrawnPlants)}
          </Typography>
          <Box display='flex' justifyContent='flex-end' alignItems='center' gap={theme.spacing(1)}>
            {isDesktop && remainingPlants > 0 && (
              <Typography fontSize='14px' color={theme.palette.TwClrTxtWarning} noWrap>
                {strings.formatString(strings.X_LEFT, format(remainingPlants))}
              </Typography>
            )}
            <PlantingDateRequestFulfillmentBadge status={request.status} />
          </Box>
        </Box>
      </Box>
    </DialogBox>
  );
};

export default RequestedSpeciesModal;
