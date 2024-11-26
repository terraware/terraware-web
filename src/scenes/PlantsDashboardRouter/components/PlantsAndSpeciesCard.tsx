import React, { useEffect, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Icon, Tooltip } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import FormattedNumber from 'src/components/common/FormattedNumber';
import { selectLatestObservation } from 'src/redux/features/observations/observationsSelectors';
import { selectSiteReportedPlants } from 'src/redux/features/tracking/trackingSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import NumberOfSpeciesPlantedCard from './NumberOfSpeciesPlantedCard';
import PlantsReportedPerSpeciesCard from './PlantsReportedPerSpeciesCard';

type PlantsAndSpeciesCardProps = {
  plantingSiteId: number;
  hasObservations: boolean;
};

export default function PlantsAndSpeciesCard({
  plantingSiteId,
  hasObservations,
}: PlantsAndSpeciesCardProps): JSX.Element {
  const siteReportedPlants = useAppSelector((state) => selectSiteReportedPlants(state, plantingSiteId));
  const theme = useTheme();
  const defaultTimeZone = useDefaultTimeZone();
  const observation = useAppSelector((state) =>
    selectLatestObservation(state, plantingSiteId, defaultTimeZone.get().id)
  );
  const [numObservedSpecies, setNumObservedSpecies] = useState(0);
  useEffect(() => {
    setNumObservedSpecies(observation?.species?.length ?? 0);
  }, [observation]);

  const separatorStyles = {
    width: '1px',
    height: 'auto',
    backgroundColor: theme.palette.TwClrBrdrTertiary,
    marginRight: '16px',
    marginLeft: '16px',
  };

  return (
    <Card radius='8px' style={{ display: 'flex' }}>
      <Box flexBasis='100%'>
        <Box>
          <Box display={'flex'} alignItems={'center'}>
            <Typography fontSize={'20px'} fontWeight={600} marginRight={1}>
              {strings.TOTAL_PLANTS_PLANTED}
            </Typography>
            <Tooltip title={strings.TOTAL_PLANTS_PLANTED_TOOLTIP}>
              <Box display='flex'>
                <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
              </Box>
            </Tooltip>
          </Box>
          <Typography fontSize={'48px'} fontWeight={600} marginTop={1}>
            {siteReportedPlants?.totalPlants}
          </Typography>
        </Box>
        <Box marginTop={3}>
          <Box display={'flex'} alignItems={'center'}>
            <Typography fontSize={'20px'} fontWeight={600} marginRight={1}>
              {strings.TOTAL_SPECIES_PLANTED}
            </Typography>
            <Tooltip title={strings.TOTAL_SPECIES_PLANTED_TOOLTIP}>
              <Box display='flex'>
                <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
              </Box>
            </Tooltip>
          </Box>
          <Typography fontSize={'48px'} fontWeight={600} marginTop={1}>
            <FormattedNumber value={numObservedSpecies} />
          </Typography>
        </Box>
      </Box>
      <div style={separatorStyles} />
      {hasObservations && (
        <>
          <Box flexBasis='100%'>
            <PlantsReportedPerSpeciesCard plantingSiteId={plantingSiteId} newVersion />
          </Box>
          <div style={separatorStyles} />
        </>
      )}
      <Box flexBasis='100%'>
        <NumberOfSpeciesPlantedCard plantingSiteId={plantingSiteId} newVersion />
      </Box>
    </Card>
  );
}
