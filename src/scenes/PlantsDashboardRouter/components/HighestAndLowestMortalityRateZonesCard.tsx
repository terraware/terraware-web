import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import FormattedNumber from 'src/components/common/FormattedNumber';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { selectPlantingZone } from 'src/redux/features/observations/plantingSiteDetailsSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { PlantingZoneObservationSummary } from 'src/types/Observations';

export default function TotalMortalityRateCard(): JSX.Element {
  const theme = useTheme();
  const { observationSummaries, plantingSite } = usePlantingSiteData();

  let highestMortalityRate: number | undefined;
  let highestZoneId: number;

  let lowestMortalityRate = 100;
  let lowestZoneId: number;

  observationSummaries?.[0]?.plantingZones.forEach((zone: PlantingZoneObservationSummary) => {
    if (
      zone.mortalityRate !== undefined &&
      zone.mortalityRate !== null &&
      zone.mortalityRate >= (highestMortalityRate || 0)
    ) {
      highestMortalityRate = zone.mortalityRate;
      highestZoneId = zone.plantingZoneId;
    }
  });

  observationSummaries?.[0]?.plantingZones.forEach((zone: PlantingZoneObservationSummary) => {
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
    selectPlantingZone(state, plantingSite?.id || -1, Number(highestZoneId))
  );

  const lowestPlantingZone = useAppSelector((state) =>
    selectPlantingZone(state, plantingSite?.id || -1, Number(lowestZoneId))
  );

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
