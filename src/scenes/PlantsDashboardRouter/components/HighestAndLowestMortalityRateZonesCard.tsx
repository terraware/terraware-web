import React, { useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import FormattedNumber from 'src/components/common/FormattedNumber';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import strings from 'src/strings';
import { PlantingZoneObservationSummary } from 'src/types/Observations';

export default function TotalMortalityRateCard(): JSX.Element {
  const theme = useTheme();
  const { observationSummaries, plantingSite } = usePlantingSiteData();

  const [highestMortalityRate, setHighestMortalityRate] = useState<number>();
  const [lowestMortalityRate, setLowestMortalityRate] = useState<number>();
  const [highestZoneId, setHighestZoneId] = useState<number>();
  const [lowestZoneId, setLowestZoneId] = useState<number>();

  useEffect(() => {
    let _highestMortalityRate = 0;
    let _lowestMortalityRate = 100;
    let _highestZoneId: number | undefined;
    let _lowestZoneId: number | undefined;
    observationSummaries?.[0]?.plantingZones.forEach((zone: PlantingZoneObservationSummary) => {
      if (zone.mortalityRate !== undefined) {
        if (zone.mortalityRate >= _highestMortalityRate) {
          _highestMortalityRate = zone.mortalityRate;
          _highestZoneId = zone.plantingZoneId;
        }
        if (zone.mortalityRate <= _lowestMortalityRate) {
          _lowestMortalityRate = zone.mortalityRate;
          _lowestZoneId = zone.plantingZoneId;
        }
      }
    });

    setLowestMortalityRate(_lowestZoneId ? _lowestMortalityRate : undefined);
    setLowestZoneId(_lowestZoneId);

    setHighestMortalityRate(_highestZoneId ? _highestMortalityRate : undefined);
    setHighestZoneId(_highestZoneId);
  }, [observationSummaries]);

  const highestPlantingZone = useMemo(() => {
    return plantingSite?.plantingZones?.find((zone) => zone.id === highestZoneId);
  }, [plantingSite, highestZoneId]);

  const lowestPlantingZone = useMemo(() => {
    return plantingSite?.plantingZones?.find((zone) => zone.id === lowestZoneId);
  }, [plantingSite, lowestZoneId]);

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
