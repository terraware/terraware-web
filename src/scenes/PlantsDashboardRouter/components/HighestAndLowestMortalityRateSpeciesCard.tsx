import { Box, Divider, Typography, useTheme } from '@mui/material';

import FormattedNumber from 'src/components/common/FormattedNumber';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { selectLatestObservation } from 'src/redux/features/observations/observationsSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

type HighestAndLowestMortalityRateSpeciesCardProps = {
  plantingSiteId: number;
};

export default function HighestAndLowestMortalityRateSpeciesCard({
  plantingSiteId,
}: HighestAndLowestMortalityRateSpeciesCardProps): JSX.Element {
  const theme = useTheme();
  const defaultTimeZone = useDefaultTimeZone();
  const observation = useAppSelector((state) =>
    selectLatestObservation(state, plantingSiteId, defaultTimeZone.get().id)
  );

  let highestMortalityRate = 0;
  let highestSpecies = '';

  observation?.species.forEach((sp) => {
    if (sp.mortalityRate !== undefined && sp.mortalityRate !== null && sp.mortalityRate >= highestMortalityRate) {
      highestMortalityRate = sp.mortalityRate;
      highestSpecies = sp.speciesScientificName || sp.speciesName || '';
    }
  });

  let lowestMortalityRate = 100;
  let lowestSpecies = '';

  observation?.species.forEach((sp) => {
    if (sp.mortalityRate !== undefined && sp.mortalityRate !== null && sp.mortalityRate <= lowestMortalityRate) {
      lowestMortalityRate = sp.mortalityRate;
      lowestSpecies = sp.speciesScientificName || sp.speciesName || '';
    }
  });

  return (
    <OverviewItemCard
      isEditable={false}
      contents={
        <Box display='flex' flexDirection='column'>
          <Typography fontSize='16px' fontWeight={600} marginBottom={theme.spacing(3)}>
            {strings.HIGHEST_AND_LOWEST_MORTALITY_RATE_SPECIES_CARD_TITLE}
          </Typography>
          <Typography fontSize='12px' fontWeight={400}>
            {strings.HIGHEST}
          </Typography>
          {highestSpecies && (
            <>
              <Typography fontSize='24px' fontWeight={600} paddingY={theme.spacing(2)}>
                {highestSpecies}
              </Typography>
              <Typography fontSize='24px' fontWeight={600}>
                <FormattedNumber value={highestMortalityRate || 0} />%
              </Typography>
              {(!lowestSpecies || lowestSpecies === highestSpecies) && (
                <Typography
                  fontWeight={400}
                  fontSize='12px'
                  lineHeight='16px'
                  color={theme.palette.gray[800]}
                  marginTop={2}
                >
                  {strings.SINGLE_SPECIES_MORTALITY_RATE_MESSAGE}
                </Typography>
              )}
            </>
          )}
          {lowestSpecies && lowestSpecies !== highestSpecies && (
            <>
              <Divider sx={{ marginY: theme.spacing(2) }} />
              <Typography fontSize='12px' fontWeight={400}>
                {strings.LOWEST}
              </Typography>
              <Typography fontSize='24px' fontWeight={600} paddingY={theme.spacing(2)}>
                {lowestSpecies}
              </Typography>
              <Typography fontSize='24px' fontWeight={600}>
                <FormattedNumber value={lowestMortalityRate || 0} />%
              </Typography>
            </>
          )}
        </Box>
      }
    />
  );
}
