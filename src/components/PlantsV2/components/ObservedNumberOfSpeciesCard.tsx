import React, { useEffect, useState } from 'react';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import strings from 'src/strings';
import { Box, Typography, useTheme } from '@mui/material';
import { useAppSelector } from 'src/redux/store';
import { selectSitePopulation } from 'src/redux/features/tracking/sitePopulationSelector';
import FormattedNumber from 'src/components/common/FormattedNumber';
import { ObservationResults } from 'src/types/Observations';
import { getShortDate } from 'src/utils/dateFormatter';
import { useLocalization } from 'src/providers';

type ObservedNumberOfSpeciesCardProps = {
  observation: ObservationResults;
};

export default function ObservedNumberOfSpeciesCard({ observation }: ObservedNumberOfSpeciesCardProps): JSX.Element {
  const theme = useTheme();
  const locale = useLocalization();
  const populationSelector = useAppSelector((state) => selectSitePopulation(state));
  const [numReportedSpecies, setNumReportedSpecies] = useState(0);
  const [numObservedSpecies, setNumObservedSpecies] = useState(0);
  useEffect(() => {
    const results = new Set<number>();
    const species = observation.species.map((s) => s.speciesId).filter((sid) => sid !== undefined);
    species.forEach((s) => results.add(s!));

    setNumObservedSpecies(results.size);
  }, [observation]);

  useEffect(() => {
    if (populationSelector) {
      const results = new Set<string>();
      const species = populationSelector
        .flatMap((zone) => zone.plantingSubzones)
        .flatMap((sz) => sz.populations)
        .filter((pop) => pop !== undefined)
        .map((pop) => pop.species_scientificName);
      species.forEach((s) => results.add(s));

      setNumReportedSpecies(results.size);
    }
  }, [populationSelector]);

  const countsDiffer = numObservedSpecies !== numReportedSpecies;

  return (
    <OverviewItemCard
      isEditable={false}
      contents={
        <Box display='flex' flexDirection='column'>
          <Typography fontSize='16px' fontWeight={600} marginBottom={theme.spacing(5)}>
            {strings.formatString(
              strings.OBSERVED_PLANTS_CARD_TITLE,
              observation?.completedTime ? getShortDate(observation.completedTime, locale.activeLocale) : ''
            )}
          </Typography>
          <Box display='flex' alignItems='flex-end' flexWrap='wrap' marginBottom={theme.spacing(3)}>
            <Typography fontSize='48px' fontWeight={600} lineHeight={1}>
              <FormattedNumber value={numObservedSpecies} />
            </Typography>
            &nbsp;
            <Typography fontSize='24px' fontWeight={600}>
              {strings.SPECIES}
            </Typography>
          </Box>
          <Typography fontSize='12px' fontWeight={400}>
            {strings.OBSERVED_PLANTS_CARD_DESCRIPTION_1}
          </Typography>
          {countsDiffer && (
            <Typography fontSize='12px' fontWeight={400} marginTop={theme.spacing(1.5)}>
              {strings.formatString(strings.OBSERVED_PLANTS_CARD_DESCRIPTION_2, numReportedSpecies)}
            </Typography>
          )}
        </Box>
      }
    />
  );
}
