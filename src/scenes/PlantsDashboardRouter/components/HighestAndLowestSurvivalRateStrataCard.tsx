import React, { type JSX, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import FormattedNumber from 'src/components/common/FormattedNumber';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import strings from 'src/strings';
import { StratumObservationSummary } from 'src/types/Observations';

export default function HighestAndLowestSurvivalRateStrataCard(): JSX.Element {
  const theme = useTheme();
  const { observationSummaries, plantingSite } = usePlantingSiteData();

  const survivalRateData = useMemo(() => {
    type Acc = {
      highestRate: number;
      lowestRate: number;
      highestId: number | undefined;
      lowestId: number | undefined;
    };
    const initial: Acc = { highestRate: 0, lowestRate: Infinity, highestId: undefined, lowestId: undefined };
    const result = (observationSummaries?.[0]?.strata ?? []).reduce((acc: Acc, stratum: StratumObservationSummary) => {
      if (stratum.survivalRate === undefined) {
        return acc;
      }
      return {
        highestRate: stratum.survivalRate >= acc.highestRate ? stratum.survivalRate : acc.highestRate,
        highestId: stratum.survivalRate >= acc.highestRate ? stratum.stratumId : acc.highestId,
        lowestRate: stratum.survivalRate < acc.lowestRate ? stratum.survivalRate : acc.lowestRate,
        lowestId: stratum.survivalRate < acc.lowestRate ? stratum.stratumId : acc.lowestId,
      };
    }, initial);

    return {
      lowestSurvivalRate: result.lowestId !== undefined ? result.lowestRate : undefined,
      highestSurvivalRate: result.highestId !== undefined ? result.highestRate : undefined,
      highestStratum: plantingSite?.strata?.find((s) => s.id === result.highestId),
      lowestStratum: plantingSite?.strata?.find((s) => s.id === result.lowestId),
    };
  }, [observationSummaries, plantingSite]);

  const highestSurvivalRate = survivalRateData.highestSurvivalRate;
  const lowestSurvivalRate = survivalRateData.lowestSurvivalRate;
  const highestStratum = survivalRateData.highestStratum;
  const lowestStratum = survivalRateData.lowestStratum;

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
