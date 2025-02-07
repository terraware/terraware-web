import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import FormattedNumber from 'src/components/common/FormattedNumber';
import useObservationSummaries from 'src/hooks/useObservationSummaries';
import { selectPlantingZone } from 'src/redux/features/observations/plantingSiteDetailsSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { PlantingZoneObservationSummary } from 'src/types/Observations';

type HighestAndLowestMortalityRateCardProps = {
  plantingSiteId: number;
};

export default function TotalMortalityRateCard({
  plantingSiteId,
}: HighestAndLowestMortalityRateCardProps): JSX.Element {
  const theme = useTheme();
  const summaries = useObservationSummaries(plantingSiteId);

  let highestMortalityRate: number | undefined = undefined;
  let highestZoneId: number;

  let lowestMortalityRate = 100;
  let lowestZoneId: number;

  summaries?.[0]?.plantingZones.forEach((zone: PlantingZoneObservationSummary) => {
    if (
      zone.mortalityRate !== undefined &&
      zone.mortalityRate !== null &&
      zone.mortalityRate >= (highestMortalityRate || 0)
    ) {
      highestMortalityRate = zone.mortalityRate;
      highestZoneId = zone.plantingZoneId;
    }
  });

  summaries?.[0]?.plantingZones.forEach((zone: PlantingZoneObservationSummary) => {
    if (
      zone.mortalityRate !== undefined &&
      zone.mortalityRate !== null &&
      zone.mortalityRate <= lowestMortalityRate &&
      zone.plantingZoneId !== highestZoneId
    ) {
      lowestMortalityRate = zone.mortalityRate;
      lowestZoneId = zone.plantingZoneId;
    }
  });

  const highestPlantingZone = useAppSelector((state) =>
    selectPlantingZone(state, plantingSiteId, Number(highestZoneId))
  );

  const lowestPlantingZone = useAppSelector((state) => selectPlantingZone(state, plantingSiteId, Number(lowestZoneId)));

  return (
    <Box>
      {highestPlantingZone && highestMortalityRate !== undefined && (
        <>
          <Box sx={{ backgroundColor: '#CB4D4533', padding: 1, borderRadius: 1, marginBottom: 1 }}>
            <Typography fontSize='16px' fontWeight={400}>
              {strings.HIGHEST}
            </Typography>
            <Typography fontSize='24px' fontWeight={600} paddingY={theme.spacing(1)}>
              {highestPlantingZone.name}
            </Typography>
            <Typography fontSize='24px' fontWeight={600}>
              <FormattedNumber value={highestMortalityRate} />%
            </Typography>
          </Box>
          {(!lowestPlantingZone || lowestPlantingZone.id === highestPlantingZone.id) && (
            <Typography fontWeight={400} fontSize='14px' color={theme.palette.TwClrTxtSecondary} marginTop={1}>
              {strings.SINGLE_ZONE_MORTALITY_RATE_MESSAGE}
            </Typography>
          )}
        </>
      )}
      {lowestPlantingZone && lowestPlantingZone.id !== highestPlantingZone?.id && (
        <Box sx={{ backgroundColor: ' #5D822B33', padding: 1, borderRadius: 1 }}>
          <Typography fontSize='16px' fontWeight={400}>
            {strings.LOWEST}
          </Typography>
          <Typography fontSize='24px' fontWeight={600} paddingY={theme.spacing(1)}>
            {lowestPlantingZone.name}
          </Typography>
          <Typography fontSize='24px' fontWeight={600}>
            <FormattedNumber value={lowestMortalityRate || 0} />%
          </Typography>
        </Box>
      )}
      {highestMortalityRate === undefined && (
        <Box sx={{ backgroundColor: theme.palette.TwClrBgSecondary, padding: 1, borderRadius: 1, marginBottom: 1 }}>
          <Typography fontSize='16px' fontWeight={400}>
            {strings.INSUFFICIENT_DATA}
          </Typography>
          <Typography fontSize='24px' fontWeight={600} paddingY={theme.spacing(1)}>
            {highestPlantingZone?.name || ''}
          </Typography>
          <Typography fontSize='24px' fontWeight={600}>
            -
          </Typography>
        </Box>
      )}
    </Box>
  );
}
