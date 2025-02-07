import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import FormattedNumber from 'src/components/common/FormattedNumber';
import useObservationSummaries from 'src/hooks/useObservationSummaries';
import { useSpecies } from 'src/scenes/InventoryRouter/form/useSpecies';
import strings from 'src/strings';
import { ObservationSpeciesResultsPayload } from 'src/types/Observations';

type HighestAndLowestMortalityRateSpeciesCardProps = {
  plantingSiteId: number;
};

export default function HighestAndLowestMortalityRateSpeciesCard({
  plantingSiteId,
}: HighestAndLowestMortalityRateSpeciesCardProps): JSX.Element {
  const theme = useTheme();
  const summaries = useObservationSummaries(plantingSiteId);

  const { availableSpecies } = useSpecies();

  let highestMortalityRate: number | undefined = undefined;
  let highestSpecies = '';

  let lowestMortalityRate = 100;
  let lowestSpecies = '';

  summaries?.[0]?.species.forEach((sp: ObservationSpeciesResultsPayload) => {
    if (
      sp.mortalityRate !== undefined &&
      sp.mortalityRate !== null &&
      sp.mortalityRate >= (highestMortalityRate || 0)
    ) {
      highestMortalityRate = sp.mortalityRate;
      highestSpecies =
        availableSpecies?.find((spec) => spec.id === sp.speciesId)?.scientificName || sp.speciesName || '';
    }
  });

  summaries?.[0]?.species.forEach((sp: ObservationSpeciesResultsPayload) => {
    if (sp.mortalityRate !== undefined && sp.mortalityRate !== null && sp.mortalityRate <= lowestMortalityRate) {
      lowestMortalityRate = sp.mortalityRate;
      lowestSpecies =
        availableSpecies?.find((spec) => spec.id === sp.speciesId)?.scientificName || sp.speciesName || '';
    }
  });

  return (
    <Box>
      {highestSpecies && highestMortalityRate !== undefined && (
        <>
          <Box sx={{ backgroundColor: '#CB4D4533', padding: 1, borderRadius: 1, marginBottom: 1 }}>
            <Typography fontSize='16px' fontWeight={400}>
              {strings.HIGHEST}
            </Typography>
            <Typography fontSize='24px' fontWeight={600} paddingY={theme.spacing(1)}>
              {highestSpecies}
            </Typography>
            <Typography fontSize='24px' fontWeight={600}>
              <FormattedNumber value={highestMortalityRate} />%
            </Typography>
          </Box>
          {(!lowestSpecies || lowestSpecies === highestSpecies) && (
            <Typography fontWeight={400} fontSize='14px' color={theme.palette.TwClrTxtSecondary} marginTop={1}>
              {strings.SINGLE_SPECIES_MORTALITY_RATE_MESSAGE}
            </Typography>
          )}
        </>
      )}
      {lowestSpecies && lowestSpecies !== highestSpecies && (
        <Box sx={{ backgroundColor: ' #5D822B33', padding: 1, borderRadius: 1 }}>
          <Typography fontSize='16px' fontWeight={400}>
            {strings.LOWEST}
          </Typography>
          <Typography fontSize='24px' fontWeight={600} paddingY={theme.spacing(1)}>
            {lowestSpecies}
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
            {strings.NO_SPECIES}
          </Typography>
          <Typography fontSize='24px' fontWeight={600}>
            -
          </Typography>
        </Box>
      )}
    </Box>
  );
}
