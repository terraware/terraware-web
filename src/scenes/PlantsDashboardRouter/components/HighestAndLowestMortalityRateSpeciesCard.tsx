import React, { useCallback, useEffect, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import FormattedNumber from 'src/components/common/FormattedNumber';
import isEnabled from 'src/features';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import strings from 'src/strings';
import { ObservationSpeciesResultsPayload } from 'src/types/Observations';

export default function HighestAndLowestMortalityRateSpeciesCard(): JSX.Element {
  const theme = useTheme();
  const { observationSummaries } = usePlantingSiteData();
  const { species } = useSpeciesData();

  const [highestMortalityRate, setHighestMortalityRate] = useState<number>();
  const [lowestMortalityRate, setLowestMortalityRate] = useState<number>();
  const [highestSpeciesName, setHighestSpeciesName] = useState<string>();
  const [lowestSpeciesName, setLowestSpeciesName] = useState<string>();

  const isSurvivalRateCalculationEnabled = isEnabled('Survival Rate Calculation');

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

  useEffect(() => {
    let _highestMortalityRate = 0;
    let _lowestMortalityRate = 100;
    let _highestSpeciesName: string | undefined;
    let _lowestSpeciesName: string | undefined;
    observationSummaries?.[0]?.species.forEach((observationSpecies: ObservationSpeciesResultsPayload) => {
      const speciesName = getSpeciesName(observationSpecies);
      if (isSurvivalRateCalculationEnabled) {
        if (observationSpecies.survivalRate !== undefined && speciesName !== undefined) {
          if (observationSpecies.survivalRate >= _highestMortalityRate) {
            _highestMortalityRate = observationSpecies.survivalRate;
            _highestSpeciesName = speciesName;
          }
          if (observationSpecies.survivalRate < _lowestMortalityRate) {
            _lowestMortalityRate = observationSpecies.survivalRate;
            _lowestSpeciesName = speciesName;
          }
        }
      } else {
        if (observationSpecies.mortalityRate !== undefined && speciesName !== undefined) {
          if (observationSpecies.mortalityRate >= _highestMortalityRate) {
            _highestMortalityRate = observationSpecies.mortalityRate;
            _highestSpeciesName = speciesName;
          }
          if (observationSpecies.mortalityRate < _lowestMortalityRate) {
            _lowestMortalityRate = observationSpecies.mortalityRate;
            _lowestSpeciesName = speciesName;
          }
        }
      }
    });

    setLowestMortalityRate(_lowestSpeciesName ? _lowestMortalityRate : undefined);
    setLowestSpeciesName(_lowestSpeciesName);

    setHighestMortalityRate(_highestSpeciesName ? _highestMortalityRate : undefined);
    setHighestSpeciesName(_highestSpeciesName);
  }, [observationSummaries, getSpeciesName, isSurvivalRateCalculationEnabled]);

  return (
    <Box>
      {highestSpeciesName && highestMortalityRate !== undefined && (
        <>
          <Box
            sx={{
              backgroundColor: isSurvivalRateCalculationEnabled ? '#5D822B33' : '#CB4D4533',
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
              <FormattedNumber value={highestMortalityRate} />%
            </Typography>
          </Box>
          {(!lowestSpeciesName || lowestSpeciesName === highestSpeciesName) && (
            <Typography fontWeight={400} fontSize='14px' color={theme.palette.TwClrTxtSecondary} marginTop={1}>
              {isSurvivalRateCalculationEnabled
                ? strings.SINGLE_SPECIES_SURVIVAL_RATE_MESSAGE
                : strings.SINGLE_SPECIES_MORTALITY_RATE_MESSAGE}
            </Typography>
          )}
        </>
      )}
      {lowestSpeciesName && lowestSpeciesName !== highestSpeciesName && (
        <Box
          sx={{
            backgroundColor: isSurvivalRateCalculationEnabled ? '#CB4D4533' : ' #5D822B33',
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
            <FormattedNumber value={lowestMortalityRate || 0} />%
          </Typography>
        </Box>
      )}
      {highestMortalityRate === undefined && !isSurvivalRateCalculationEnabled && (
        <Box sx={{ backgroundColor: theme.palette.TwClrBgSecondary, padding: 1, borderRadius: 1, marginBottom: 1 }}>
          <Typography fontSize='16px' fontWeight={400}>
            {strings.INSUFFICIENT_DATA}
          </Typography>
          <Typography fontSize='24px' fontWeight={600} paddingY={theme.spacing(1)}>
            {strings.NO_SPECIES}
          </Typography>
          <Typography fontSize='24px' fontWeight={600}>
            -
          </Typography>
        </Box>
      )}
      {highestMortalityRate === undefined && lowestMortalityRate === undefined && isSurvivalRateCalculationEnabled && (
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
