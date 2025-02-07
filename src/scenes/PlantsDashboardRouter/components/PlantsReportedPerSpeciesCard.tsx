import React, { useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Icon, Tooltip } from '@terraware/web-components';

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

const calculateSpeciesQuantities = (plantings: { plants: number; scientificName: string }[], newVersion?: boolean) => {
  const speciesQuantities: Record<string, number> = {};
  plantings?.forEach((planting) => {
    const { scientificName, plants } = planting;
    if (newVersion) {
      if (!speciesQuantities[scientificName] && Object.keys(speciesQuantities).length >= 4) {
        const minSpecies = Object.keys(speciesQuantities).reduce((minSpecies, sp) => {
          if (sp !== strings.OTHER_SPECIES && speciesQuantities[sp] < speciesQuantities[minSpecies]) {
            return sp;
          }
          return minSpecies;
        }, Object.keys(speciesQuantities)[0]);

        if (plants > speciesQuantities[minSpecies]) {
          speciesQuantities[scientificName] = plants;
          speciesQuantities[strings.OTHER_SPECIES] = speciesQuantities[strings.OTHER_SPECIES]
            ? speciesQuantities[strings.OTHER_SPECIES] + speciesQuantities[minSpecies]
            : speciesQuantities[minSpecies];
          delete speciesQuantities[minSpecies];
        } else {
          speciesQuantities[strings.OTHER_SPECIES] = speciesQuantities[strings.OTHER_SPECIES]
            ? speciesQuantities[strings.OTHER_SPECIES] + plants
            : plants;
        }
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

  return speciesQuantities;
};

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
    const transformedPlantings = plantings?.map((planting) => ({
      plants: Number(planting['numPlants(raw)']),
      scientificName: planting.species.scientificName,
    }));
    const speciesQuantities: Record<string, number> = calculateSpeciesQuantities(transformedPlantings, newVersion);
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
      const transformedPlantings = populationSelector
        .flatMap((zone) =>
          zone.plantingSubzones?.flatMap((subZone) =>
            subZone.populations?.map((population) => ({
              plants: +population['totalPlants(raw)'],
              scientificName: population.species_scientificName,
            }))
          )
        )
        .filter((tp) => tp !== undefined);
      const speciesQuantities: Record<string, number> = calculateSpeciesQuantities(transformedPlantings, newVersion);
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
      <Box display={'flex'} alignItems={'center'}>
        <Typography fontSize={'20px'} fontWeight={600} marginRight={1}>
          {strings.PLANTED_SPECIES}
        </Typography>
        <Tooltip title={strings.PLANTED_SPECIES_TOOLTIP}>
          <Box display='flex'>
            <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
          </Box>
        </Tooltip>
      </Box>
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
