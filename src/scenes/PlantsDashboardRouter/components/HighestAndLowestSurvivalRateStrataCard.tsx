import React, { type JSX, useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import FormattedNumber from 'src/components/common/FormattedNumber';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import strings from 'src/strings';
import { StratumObservationSummary } from 'src/types/Observations';

export default function HighestAndLowestSurvivalRateStrataCard(): JSX.Element {
  const theme = useTheme();
  const { observationSummaries, plantingSite } = usePlantingSiteData();

  const [highestSurvivalRate, setHighestSurvivalRate] = useState<number>();
  const [lowestSurvivalRate, setLowestSurvivalRate] = useState<number>();
  const [highestStratumId, setHighestStratumId] = useState<number>();
  const [lowestStratumId, setLowestStratumId] = useState<number>();

  useEffect(() => {
    let _highestSurvivalRate = 0;
    let _lowestSurvivalRate = Infinity;
    let _highestStratumId: number | undefined;
    let _lowestStratumId: number | undefined;
    observationSummaries?.[0]?.strata.forEach((stratum: StratumObservationSummary) => {
      if (stratum.survivalRate !== undefined) {
        if (stratum.survivalRate >= _highestSurvivalRate) {
          _highestSurvivalRate = stratum.survivalRate;
          _highestStratumId = stratum.stratumId;
        }
        if (stratum.survivalRate < _lowestSurvivalRate) {
          _lowestSurvivalRate = stratum.survivalRate;
          _lowestStratumId = stratum.stratumId;
        }
      }
    });

    setLowestSurvivalRate(_lowestStratumId ? _lowestSurvivalRate : undefined);
    setLowestStratumId(_lowestStratumId);

    setHighestSurvivalRate(_highestStratumId ? _highestSurvivalRate : undefined);
    setHighestStratumId(_highestStratumId);
  }, [observationSummaries]);

  const highestStratum = useMemo(() => {
    return plantingSite?.strata?.find((stratum) => stratum.id === highestStratumId);
  }, [plantingSite, highestStratumId]);

  const lowestStratum = useMemo(() => {
    return plantingSite?.strata?.find((stratum) => stratum.id === lowestStratumId);
  }, [plantingSite, lowestStratumId]);

  return (
    <Box>
      {highestStratum && highestSurvivalRate !== undefined && (
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
              {highestStratum.name}
            </Typography>
            <Typography fontSize='24px' fontWeight={600}>
              <FormattedNumber value={highestSurvivalRate} />%
            </Typography>
          </Box>
          {(!lowestStratum || lowestStratum.id === highestStratum.id) && (
            <Typography fontWeight={400} fontSize='14px' color={theme.palette.TwClrTxtSecondary} marginTop={1}>
              {strings.SINGLE_STRATUM_SURVIVAL_RATE_MESSAGE}
            </Typography>
          )}
        </>
      )}
      {lowestStratum && lowestStratum.id !== highestStratum?.id && (
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
            {lowestStratum.name}
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
