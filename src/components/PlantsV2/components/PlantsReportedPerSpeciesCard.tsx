import React, { useEffect, useState } from 'react';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import strings from 'src/strings';
import { Box, Typography, useTheme } from '@mui/material';
import { useAppSelector } from 'src/redux/store';
import { selectSitePopulation } from 'src/redux/features/tracking/sitePopulationSelector';
import BarChart from 'src/components/common/Chart/BarChart';

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
      setLabels(Object.keys(speciesQuantities));
      setValues(Object.values(speciesQuantities));
    } else {
      setLabels([]);
      setValues([]);
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
            <BarChart chartId='plantsBySpecies' chartLabels={labels} chartValues={values} maxWidth='100%' />
          </Box>
        </Box>
      }
    />
  );
}
