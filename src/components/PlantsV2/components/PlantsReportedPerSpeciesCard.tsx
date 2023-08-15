import React, { useEffect, useMemo, useState } from 'react';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import strings from 'src/strings';
import { Box, Typography, useTheme } from '@mui/material';
import { useAppSelector } from 'src/redux/store';
import { selectSitePopulationZones } from 'src/redux/features/tracking/sitePopulationSelector';
import BarChart from 'src/components/common/Chart/BarChart';
import { truncate } from 'src/utils/text';

const MAX_SPECIES_NAME_LENGTH = 20;

type PlantsReportedPerSpeciesCardProps = {
  plantingSiteId?: number;
};

export default function PlantsReportedPerSpeciesCard({
  plantingSiteId,
}: PlantsReportedPerSpeciesCardProps): JSX.Element {
  const theme = useTheme();
  const populationSelector = useAppSelector((state) => selectSitePopulationZones(state));
  const [labels, setLabels] = useState<string[]>();
  const [values, setValues] = useState<number[]>();
  const [tooltipTitles, setTooltipTitles] = useState<string[]>();

  useEffect(() => {
    if (populationSelector) {
      const speciesQuantities: Record<string, number> = {};
      populationSelector?.forEach((zone) =>
        zone.plantingSubzones?.forEach((subzone) =>
          subzone.populations?.forEach((population) => {
            const numPlants = +population['totalPlants(raw)'];
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
      setLabels(Object.keys(speciesQuantities).map((name) => truncate(name, MAX_SPECIES_NAME_LENGTH)));
      setValues(Object.values(speciesQuantities));
      setTooltipTitles(Object.keys(speciesQuantities));
    } else {
      setLabels([]);
      setValues([]);
      setTooltipTitles([]);
    }
  }, [populationSelector]);

  const chartData = useMemo(() => {
    if (!labels?.length || !values?.length) {
      return {
        labels: [],
        datasets: [
          {
            values: [],
          },
        ],
      };
    }

    return {
      labels: labels ?? [],
      datasets: [
        {
          values: values ?? [],
        },
      ],
    };
  }, [labels, values]);

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
              key={values?.length}
              elementColor={theme.palette.TwClrBasePurple300}
              chartId='plantsBySpecies'
              chartData={chartData}
              customTooltipTitles={tooltipTitles}
              maxWidth='100%'
              minHeight='127px'
              yLimits={!values?.length ? { min: 0, max: 200 } : undefined}
              barWidth={0}
            />
          </Box>
        </Box>
      }
    />
  );
}
