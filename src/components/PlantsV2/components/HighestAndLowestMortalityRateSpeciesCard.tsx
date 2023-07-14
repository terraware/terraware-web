import OverviewItemCard from 'src/components/common/OverviewItemCard';
import strings from 'src/strings';
import { Box, Divider, Typography, useTheme } from '@mui/material';
import { selectSpecies } from 'src/redux/features/species/speciesSelectors';
import { useAppSelector } from 'src/redux/store';
import FormattedNumber from 'src/components/common/FormattedNumber';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';
import { selectLatestObservation } from 'src/redux/features/observations/observationsSelectors';

type HighestAndLowestMortalityRateSpeciesCardProps = {
  plantingSiteId: number;
};

export default function HighestAndLowestMortalityRateSpeciesCard({
  plantingSiteId,
}: HighestAndLowestMortalityRateSpeciesCardProps): JSX.Element {
  const theme = useTheme();
  const species = useAppSelector(selectSpecies);
  const defaultTimeZone = useDefaultTimeZone();
  const observation = useAppSelector((state) =>
    selectLatestObservation(state, plantingSiteId, defaultTimeZone.get().id)
  );

  let highestMortalityRate = 0;
  let highestSpecies = '';

  observation?.species.forEach((sp) => {
    if (sp.mortalityRate !== undefined && sp.mortalityRate !== null && sp.mortalityRate >= highestMortalityRate) {
      highestMortalityRate = sp.mortalityRate;
      highestSpecies = species?.find((iSpecies) => iSpecies.id === sp.speciesId)?.scientificName ?? '';
    }
  });

  let lowestMortalityRate = 100;
  let lowestSpecies = '';

  observation?.species.forEach((sp) => {
    if (sp.mortalityRate !== undefined && sp.mortalityRate !== null && sp.mortalityRate <= lowestMortalityRate) {
      lowestMortalityRate = sp.mortalityRate;
      lowestSpecies = species?.find((iSpecies) => iSpecies.id === sp.speciesId)?.scientificName ?? '';
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
            </>
          )}
          <Divider sx={{ marginY: theme.spacing(2) }} />
          <Typography fontSize='12px' fontWeight={400}>
            {strings.LOWEST}
          </Typography>
          {lowestSpecies && (
            <>
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
