import React from 'react';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import strings from 'src/strings';
import { Box, Divider, Typography, useTheme } from '@mui/material';
import { ObservationResults } from 'src/types/Observations';
import { useAppSelector } from 'src/redux/store';
import { selectObservationPlantingZone } from 'src/redux/features/observations/observationPlantingZoneSelectors';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

type HighestAndLowestMortalityRateCardProps = {
  observation?: ObservationResults;
};

export default function TotalMortalityRateCard({ observation }: HighestAndLowestMortalityRateCardProps): JSX.Element {
  const theme = useTheme();
  const defaultTimeZone = useDefaultTimeZone();

  let highestMortalityRate = 0;
  let highestZoneId: number;
  observation?.plantingZones.forEach((zone) => {
    if (zone.mortalityRate !== undefined && zone.mortalityRate !== null && zone.mortalityRate >= highestMortalityRate) {
      highestMortalityRate = zone.mortalityRate;
      highestZoneId = zone.plantingZoneId;
    }
  });

  let lowestMortalityRate = 100;
  let lowestZoneId: number;
  observation?.plantingZones.forEach((zone) => {
    if (zone.mortalityRate !== undefined && zone.mortalityRate !== null && zone.mortalityRate <= lowestMortalityRate) {
      lowestMortalityRate = zone.mortalityRate;
      lowestZoneId = zone.plantingZoneId;
    }
  });

  const highestPlantingZone = useAppSelector((state) =>
    selectObservationPlantingZone(
      state,
      {
        plantingSiteId: Number(observation?.plantingSiteId),
        observationId: Number(observation?.observationId),
        plantingZoneId: Number(highestZoneId),
      },
      defaultTimeZone.get().id
    )
  );

  const lowestPlantingZone = useAppSelector((state) =>
    selectObservationPlantingZone(
      state,
      {
        plantingSiteId: Number(observation?.plantingSiteId),
        observationId: Number(observation?.observationId),
        plantingZoneId: Number(lowestZoneId),
      },
      defaultTimeZone.get().id
    )
  );

  return (
    <OverviewItemCard
      isEditable={false}
      contents={
        <Box display='flex' flexDirection='column'>
          <Typography fontSize='16px' fontWeight={600} marginBottom={theme.spacing(3)}>
            {strings.HIGHEST_AND_LOWEST_MORTALITY_RATE_CARD_TITLE}
          </Typography>
          <Typography fontSize='12px' fontWeight={400}>
            {strings.HIGHEST}
          </Typography>
          {highestPlantingZone && (
            <>
              <Typography fontSize='24px' fontWeight={600} paddingY={theme.spacing(2)}>
                {highestPlantingZone.plantingZoneName}
              </Typography>
              <Typography fontSize='24px' fontWeight={600}>
                {highestMortalityRate + '%'}
              </Typography>
            </>
          )}
          <Divider sx={{ marginY: theme.spacing(2) }} />
          <Typography fontSize='12px' fontWeight={400}>
            {strings.LOWEST}
          </Typography>
          {lowestPlantingZone && (
            <>
              <Typography fontSize='24px' fontWeight={600} paddingY={theme.spacing(2)}>
                {lowestPlantingZone.plantingZoneName}
              </Typography>
              <Typography fontSize='24px' fontWeight={600}>
                {lowestMortalityRate + '%'}
              </Typography>
            </>
          )}
        </Box>
      }
    />
  );
}
