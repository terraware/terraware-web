import React, { useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import FormattedNumber from 'src/components/common/FormattedNumber';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import strings from 'src/strings';
import { PlantingZoneObservationSummary } from 'src/types/Observations';

export default function HighestAndLowestSurvivalRateZonesCard(): JSX.Element {
  const theme = useTheme();
  const { observationSummaries, plantingSite } = usePlantingSiteData();

  const [highestSurvivalRate, setHighestSurvivalRate] = useState<number>();
  const [lowestSurvivalRate, setLowestSurvivalRate] = useState<number>();
  const [highestZoneId, setHighestZoneId] = useState<number>();
  const [lowestZoneId, setLowestZoneId] = useState<number>();

  useEffect(() => {
    let _highestSurvivalRate = 0;
    let _lowestSurvivalRate = Infinity;
    let _highestZoneId: number | undefined;
    let _lowestZoneId: number | undefined;
    observationSummaries?.[0]?.plantingZones.forEach((zone: PlantingZoneObservationSummary) => {
      if (zone.survivalRate !== undefined) {
        if (zone.survivalRate >= _highestSurvivalRate) {
          _highestSurvivalRate = zone.survivalRate;
          _highestZoneId = zone.plantingZoneId;
        }
        if (zone.survivalRate < _lowestSurvivalRate) {
          _lowestSurvivalRate = zone.survivalRate;
          _lowestZoneId = zone.plantingZoneId;
        }
      }
    });

    setLowestSurvivalRate(_lowestZoneId ? _lowestSurvivalRate : undefined);
    setLowestZoneId(_lowestZoneId);

    setHighestSurvivalRate(_highestZoneId ? _highestSurvivalRate : undefined);
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
      {highestPlantingZone && highestSurvivalRate !== undefined && (
        <>
          <Box
            sx={{
              backgroundColor: '#5D822B33',
              padding: 1,
              borderRadius: 1,
              marginBottom: 1,
            }}
          >
            <Typography fontSize='16px' fontWeight={400}>
              {strings.HIGHEST}
            </Typography>
            <Typography fontSize='24px' fontWeight={600} paddingY={theme.spacing(1)}>
              {highestPlantingZone.name}
            </Typography>
            <Typography fontSize='24px' fontWeight={600}>
              <FormattedNumber value={highestSurvivalRate} />%
            </Typography>
          </Box>
          {(!lowestPlantingZone || lowestPlantingZone.id === highestPlantingZone.id) && (
            <Typography fontWeight={400} fontSize='14px' color={theme.palette.TwClrTxtSecondary} marginTop={1}>
              {strings.SINGLE_ZONE_SURVIVAL_RATE_MESSAGE}
            </Typography>
          )}
        </>
      )}
      {lowestPlantingZone && lowestPlantingZone.id !== highestPlantingZone?.id && (
        <Box
          sx={{
            backgroundColor: '#CB4D4533',
            padding: 1,
            borderRadius: 1,
          }}
        >
          <Typography fontSize='16px' fontWeight={400}>
            {strings.LOWEST}
          </Typography>
          <Typography fontSize='24px' fontWeight={600} paddingY={theme.spacing(1)}>
            {lowestPlantingZone.name}
          </Typography>
          <Typography fontSize='24px' fontWeight={600}>
            <FormattedNumber value={lowestSurvivalRate || 0} />%
          </Typography>
        </Box>
      )}
      {highestSurvivalRate === undefined && lowestSurvivalRate === undefined && (
        <>
          <Box
            sx={{
              backgroundColor: '#5D822B33',
              padding: 1,
              borderRadius: 1,
              marginBottom: 1,
            }}
          >
            <Typography fontSize='16px' fontWeight={400}>
              {strings.HIGHEST}
            </Typography>
            <Typography fontSize='24px' fontWeight={600} paddingY={theme.spacing(1)}>
              {strings.CANNOT_BE_CALCULATED}
            </Typography>
            <Box height={'36px'} />
          </Box>
          <Box
            sx={{
              backgroundColor: '#CB4D4533',
              padding: 1,
              borderRadius: 1,
            }}
          >
            <Typography fontSize='16px' fontWeight={400}>
              {strings.LOWEST}
            </Typography>
            <Typography fontSize='24px' fontWeight={600} paddingY={theme.spacing(1)}>
              {strings.CANNOT_BE_CALCULATED}
            </Typography>
            <Box height={'36px'} />
          </Box>
        </>
      )}
    </Box>
  );
}
