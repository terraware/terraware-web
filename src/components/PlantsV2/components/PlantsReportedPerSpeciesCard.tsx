import React, { useEffect, useState } from 'react';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import strings from 'src/strings';
import { Box, Typography, useTheme } from '@mui/material';
import { useAppSelector } from 'src/redux/store';
import { selectSitePopulation } from 'src/redux/features/tracking/sitePopulationSelector';
import BarChart from 'src/components/common/Chart/BarChart';

const MAX_SPECIES_NAME_LENGTH = 20;

const truncateToLength = (s: string, length: number): string => {
  if (s.length <= length) {
    return s;
  }

  return s.slice(0, length - 3) + '...';
};

type PlantsReportedPerSpeciesCardProps = {
  plantingSiteId?: number;
};

export default function PlantsReportedPerSpeciesCard({
  plantingSiteId,
}: PlantsReportedPerSpeciesCardProps): JSX.Element {
  const theme = useTheme();
  const populationSelector = useAppSelector((state) => selectSitePopulation(state));
  const [labels, setLabels] = useState<string[]>();
  const [values, setValues] = useState<number[]>();
  const [tooltipTitles, setTooltipTitles] = useState<string[]>();
  useEffect(() => {
    if (populationSelector) {
      const speciesQuantities: Record<string, number> = {};
      populationSelector?.forEach((zone) =>
        zone.plantingSubzones?.forEach((subzone) =>
          subzone.populations?.forEach((population) => {
            const numPlants = Number(population.totalPlants);
            if (isNaN(numPlants)) {
              return;
            }
            if (speciesQuantities[population.species_scientificName]) {
              speciesQuantities[population.species_scientificName] += numPlants;
            } else {
              speciesQuantities[population.species_scientificName] = numPlants;
            }
          })
        )
      );
      setLabels(Object.keys(speciesQuantities).map((name) => truncateToLength(name, MAX_SPECIES_NAME_LENGTH)));
      setValues(Object.values(speciesQuantities));
      setTooltipTitles(Object.keys(speciesQuantities));
    } else {
      setLabels([]);
      setValues([]);
      setTooltipTitles([]);
    }
  }, [populationSelector]);

  return (
    <OverviewItemCard
      isEditable={false}
      contents={
        <Box display='flex' flexDirection='column'>
          <Typography fontSize='16px' fontWeight={600} marginBottom={theme.spacing(5)}>
            {strings.REPORTED_PLANTS_PER_SPECIES_CARD_TITLE}
          </Typography>
          <Box>
            <BarChart
              chartId='plantsBySpecies'
              chartLabels={labels}
              chartValues={values}
              customTooltipTitles={tooltipTitles}
              maxWidth='100%'
            />
          </Box>
        </Box>
      }
    />
  );
}
