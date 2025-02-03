import React, { useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import BarChart from 'src/components/common/Chart/BarChart';
import PieChart from 'src/components/common/Chart/PieChart';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { selectPlantingsForSite } from 'src/redux/features/plantings/plantingsSelectors';
import { selectSitePopulationZones } from 'src/redux/features/tracking/sitePopulationSelector';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { truncate } from 'src/utils/text';

const MAX_SPECIES_NAME_LENGTH = 20;

type PlantsReportedPerSpeciesCardProps = {
  plantingSiteId: number;
  newVersion?: boolean;
};

export default function PlantsReportedPerSpeciesCard({
  plantingSiteId,
  newVersion,
}: PlantsReportedPerSpeciesCardProps): JSX.Element {
  const plantingSite = useAppSelector((state) => selectPlantingSite(state, plantingSiteId));

  if (!plantingSite?.plantingZones?.length) {
    return <SiteWithoutZonesCard plantingSiteId={plantingSiteId} newVersion={newVersion} />;
  } else {
    return <SiteWithZonesCard plantingSiteId={plantingSiteId} newVersion={newVersion} />;
  }
}

const SiteWithoutZonesCard = ({
  plantingSiteId,
  newVersion,
}: {
  plantingSiteId: number;
  newVersion?: boolean;
}): JSX.Element => {
  const [labels, setLabels] = useState<string[]>();
  const [values, setValues] = useState<number[]>();
  const [tooltipTitles, setTooltipTitles] = useState<string[]>();

  const plantings = useAppSelector((state) => selectPlantingsForSite(state, plantingSiteId));

  useEffect(() => {
    const speciesQuantities: Record<string, number> = {};
    plantings.forEach((planting) => {
      const plants = Number(planting['numPlants(raw)']);
      const { scientificName } = planting.species;

      if (newVersion) {
        if (!speciesQuantities[scientificName] && Object.keys(speciesQuantities).length >= 4) {
          speciesQuantities[strings.OTHER_SPECIES] = speciesQuantities[strings.OTHER_SPECIES]
            ? speciesQuantities[strings.OTHER_SPECIES] + plants
            : plants;
        } else {
          if (!speciesQuantities[scientificName]) {
            speciesQuantities[scientificName] = plants;
          } else {
            speciesQuantities[scientificName] += plants;
          }
        }
      } else {
        if (!speciesQuantities[scientificName]) {
          speciesQuantities[scientificName] = plants;
        } else {
          speciesQuantities[scientificName] += plants;
        }
      }
    });

    setLabels(Object.keys(speciesQuantities).map((name) => truncate(name, MAX_SPECIES_NAME_LENGTH)));
    setValues(Object.values(speciesQuantities));
    setTooltipTitles(Object.keys(speciesQuantities));
  }, [plantings]);

  return (
    <ChartData
      plantingSiteId={plantingSiteId}
      tooltipTitles={tooltipTitles}
      labels={labels}
      values={values}
      newVersion={newVersion}
    />
  );
};

const SiteWithZonesCard = ({
  plantingSiteId,
  newVersion,
}: {
  plantingSiteId: number;
  newVersion?: boolean;
}): JSX.Element => {
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
            if (newVersion) {
              if (!speciesQuantities[population.species_scientificName] && Object.keys(speciesQuantities).length >= 4) {
                speciesQuantities[strings.OTHER_SPECIES] = speciesQuantities[strings.OTHER_SPECIES]
                  ? speciesQuantities[strings.OTHER_SPECIES] + numPlants
                  : numPlants;
              } else {
                if (!speciesQuantities[population.species_scientificName]) {
                  speciesQuantities[population.species_scientificName] = numPlants;
                } else {
                  speciesQuantities[population.species_scientificName] += numPlants;
                }
              }
            } else {
              if (speciesQuantities[population.species_scientificName]) {
                speciesQuantities[population.species_scientificName] += numPlants;
              } else {
                speciesQuantities[population.species_scientificName] = numPlants;
              }
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

  return (
    <ChartData
      plantingSiteId={plantingSiteId}
      tooltipTitles={tooltipTitles}
      labels={labels}
      values={values}
      newVersion={newVersion}
    />
  );
};

type ChartDataProps = {
  plantingSiteId: number;
  tooltipTitles?: string[];
  labels?: string[];
  values?: number[];
  newVersion?: boolean;
};

const ChartData = ({ plantingSiteId, tooltipTitles, labels, values, newVersion }: ChartDataProps): JSX.Element => {
  const theme = useTheme();

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

  return newVersion ? (
    <Box>
      <Typography fontSize={'20px'} fontWeight={600} marginRight={1}>
        {strings.PLANTED_SPECIES}
      </Typography>
      <Box height={'250px'} marginTop={3} marginBottom={6}>
        <PieChart
          key={`${plantingSiteId}_${values?.length}`}
          chartId='plantsBySpecies'
          chartData={{
            labels: labels ?? [],
            datasets: [
              {
                values: values ?? [],
              },
            ],
          }}
          maxWidth='100%'
        />
      </Box>
    </Box>
  ) : (
    <OverviewItemCard
      isEditable={false}
      contents={
        <Box display='flex' flexDirection='column'>
          <Typography fontSize='16px' fontWeight={600} marginBottom={theme.spacing(5)}>
            {strings.REPORTED_PLANTS_PER_SPECIES_CARD_TITLE}
          </Typography>
          <Box>
            <BarChart
              key={`${plantingSiteId}_${values?.length}`}
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
};
