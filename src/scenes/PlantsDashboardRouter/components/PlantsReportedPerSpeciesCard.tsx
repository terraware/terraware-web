import React, { useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Icon, Tooltip } from '@terraware/web-components';

import BarChart from 'src/components/common/Chart/BarChart';
import PieChart from 'src/components/common/Chart/PieChart';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { useProjectPlantings } from 'src/hooks/useProjectPlantings';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { selectPlantingsForSite } from 'src/redux/features/plantings/plantingsSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { truncate } from 'src/utils/text';

const MAX_SPECIES_NAME_LENGTH = 20;

type PlantsReportedPerSpeciesCardProps = {
  newVersion?: boolean;
  projectId?: number;
};

export default function PlantsReportedPerSpeciesCard({
  newVersion,
  projectId,
}: PlantsReportedPerSpeciesCardProps): JSX.Element | undefined {
  const { plantingSite } = usePlantingSiteData();

  if (projectId && plantingSite?.id === -1) {
    return <RolledUpCard projectId={projectId} />;
  }

  if (!plantingSite) {
    return <RolledUpCard projectId={projectId} />;
  } else if (!plantingSite.strata?.length) {
    return <SiteWithoutStrataCard plantingSiteId={plantingSite.id} newVersion={newVersion} />;
  } else {
    return <SiteWithStrataCard plantingSiteId={plantingSite.id} newVersion={newVersion} />;
  }
}

const calculateSpeciesQuantities = (plantings: { plants: number; scientificName: string }[], newVersion?: boolean) => {
  const speciesQuantities: Record<string, number> = {};
  plantings?.forEach((planting) => {
    const { scientificName, plants } = planting;
    if (newVersion) {
      if (!speciesQuantities[scientificName] && Object.keys(speciesQuantities).length >= 4) {
        const minSpecies = Object.keys(speciesQuantities).reduce((currentMin, sp) => {
          if (sp !== strings.OTHER_SPECIES && speciesQuantities[sp] < speciesQuantities[currentMin]) {
            return sp;
          }
          return currentMin;
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

const RolledUpCard = ({ projectId }: { projectId?: number }): JSX.Element => {
  const [labels, setLabels] = useState<string[]>();
  const [values, setValues] = useState<number[]>();
  const [tooltipTitles, setTooltipTitles] = useState<string[]>();

  const { reportedPlants } = useProjectPlantings(projectId);
  const { species: orgSpecies } = useSpeciesData();

  const speciesQuantities = useMemo(() => {
    const transformedPlantings = reportedPlants
      .flatMap((site) => site.species)
      .map((sp) => ({
        plants: sp.totalPlants,
        scientificName: orgSpecies.find((s) => s.id === sp.id)?.scientificName || '',
      }));
    return calculateSpeciesQuantities(transformedPlantings, true);
  }, [reportedPlants, orgSpecies]);

  useEffect(() => {
    setLabels(Object.keys(speciesQuantities).map((name) => truncate(name, MAX_SPECIES_NAME_LENGTH)));
    setValues(Object.values(speciesQuantities));
    setTooltipTitles(Object.keys(speciesQuantities));
  }, [speciesQuantities]);

  return (
    <ChartData plantingSiteId={-1} tooltipTitles={tooltipTitles} labels={labels} values={values} newVersion={true} />
  );
};

const SiteWithoutStrataCard = ({
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

  const speciesQuantities = useMemo(() => {
    const transformedPlantings = plantings?.map((planting) => ({
      plants: Number(planting['numPlants(raw)']),
      scientificName: planting.species.scientificName,
    }));
    return calculateSpeciesQuantities(transformedPlantings, newVersion);
  }, [plantings, newVersion]);

  useEffect(() => {
    setLabels(Object.keys(speciesQuantities).map((name) => truncate(name, MAX_SPECIES_NAME_LENGTH)));
    setValues(Object.values(speciesQuantities));
    setTooltipTitles(Object.keys(speciesQuantities));
  }, [speciesQuantities]);

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

const SiteWithStrataCard = ({
  plantingSiteId,
  newVersion,
}: {
  plantingSiteId: number;
  newVersion?: boolean;
  organizationId?: number;
}): JSX.Element => {
  const { plantingSiteReportedPlants } = usePlantingSiteData();
  const { species: orgSpecies } = useSpeciesData();

  const [labels, setLabels] = useState<string[]>();
  const [values, setValues] = useState<number[]>();
  const [tooltipTitles, setTooltipTitles] = useState<string[]>();

  const speciesQuantities = useMemo(() => {
    if (plantingSiteReportedPlants && orgSpecies) {
      const transformedPlantings = plantingSiteReportedPlants.species
        .map((population) => {
          const speciesName = orgSpecies.find((species) => species.id === population.id)?.scientificName ?? '';
          return {
            plants: population.totalPlants,
            scientificName: speciesName,
          };
        })
        .filter((tp) => tp !== undefined);
      return calculateSpeciesQuantities(transformedPlantings, newVersion);
    } else {
      return [];
    }
  }, [plantingSiteReportedPlants, orgSpecies, newVersion]);

  useEffect(() => {
    setLabels(Object.keys(speciesQuantities).map((name) => truncate(name, MAX_SPECIES_NAME_LENGTH)));
    setValues(Object.values(speciesQuantities));
    setTooltipTitles(Object.keys(speciesQuantities));
  }, [speciesQuantities]);

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

const ChartData = ({
  plantingSiteId,
  tooltipTitles,
  labels,
  values,
  newVersion,
}: ChartDataProps): JSX.Element | undefined => {
  const theme = useTheme();

  const chartData = useMemo(() => {
    return {
      labels: labels ?? [],
      datasets: [
        {
          values: values ?? [],
        },
      ],
    };
  }, [labels, values]);

  if (!chartData) {
    return undefined;
  }

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
          chartData={chartData}
          maxWidth='100%'
          pluginsOptions={{
            emptyDoughnut: {
              color: theme.palette.TwClrBaseGray050,
              width: 100,
              radiusDecrease: 70,
            },
          }}
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
