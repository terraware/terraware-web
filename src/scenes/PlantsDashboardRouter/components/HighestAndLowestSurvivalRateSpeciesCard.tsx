import React, { type JSX, useCallback, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import FormattedNumber from 'src/components/common/FormattedNumber';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import strings from 'src/strings';
import { ObservationSpeciesResultsPayload } from 'src/types/Observations';

export default function HighestAndLowestSurvivalRateSpeciesCard(): JSX.Element {
  const theme = useTheme();
  const { observationSummaries } = usePlantingSiteData();
  const { species } = useSpeciesData();

  const getSpeciesName = useCallback(
    (observationSpecies: ObservationSpeciesResultsPayload) => {
      if (observationSpecies.speciesId) {
        const foundSpecies = species.find((_species) => _species.id === observationSpecies.speciesId);
        return foundSpecies?.scientificName;
      } else {
        return observationSpecies.speciesName;
      }
    },
    [species]
  );

  const survivalRateData = useMemo(() => {
    type Acc = {
      highestRate: number;
      lowestRate: number;
      highestName: string | undefined;
      lowestName: string | undefined;
    };
    const initial: Acc = { highestRate: 0, lowestRate: Infinity, highestName: undefined, lowestName: undefined };
    const result = (observationSummaries?.[0]?.species ?? []).reduce(
      (acc: Acc, observationSpecies: ObservationSpeciesResultsPayload) => {
        const speciesName = getSpeciesName(observationSpecies);
        if (observationSpecies.survivalRate === undefined || speciesName === undefined) {
          return acc;
        }
        return {
          highestRate:
            observationSpecies.survivalRate >= acc.highestRate ? observationSpecies.survivalRate : acc.highestRate,
          highestName: observationSpecies.survivalRate >= acc.highestRate ? speciesName : acc.highestName,
          lowestRate:
            observationSpecies.survivalRate < acc.lowestRate ? observationSpecies.survivalRate : acc.lowestRate,
          lowestName: observationSpecies.survivalRate < acc.lowestRate ? speciesName : acc.lowestName,
        };
      },
      initial
    );

    return {
      lowestSurvivalRate: result.lowestName ? result.lowestRate : undefined,
      lowestSpeciesName: result.lowestName,
      highestSurvivalRate: result.highestName ? result.highestRate : undefined,
      highestSpeciesName: result.highestName,
    };
  }, [observationSummaries, getSpeciesName]);

  const highestSurvivalRate = survivalRateData.highestSurvivalRate;
  const lowestSurvivalRate = survivalRateData.lowestSurvivalRate;
  const highestSpeciesName = survivalRateData.highestSpeciesName;
  const lowestSpeciesName = survivalRateData.lowestSpeciesName;

  return (
    <Box>
      {highestSpeciesName && highestSurvivalRate !== undefined && (
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
              {highestSpeciesName}
            </Typography>
            <Typography fontSize='24px' fontWeight={600}>
              <FormattedNumber value={highestSurvivalRate} />%
            </Typography>
          </Box>
          {(!lowestSpeciesName || lowestSpeciesName === highestSpeciesName) && (
            <Typography fontWeight={400} fontSize='14px' color={theme.palette.TwClrTxtSecondary} marginTop={1}>
              {strings.SINGLE_SPECIES_SURVIVAL_RATE_MESSAGE}
            </Typography>
          )}
        </>
      )}
      {lowestSpeciesName && lowestSpeciesName !== highestSpeciesName && (
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
            {lowestSpeciesName}
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
