import React from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { IconTooltip } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { useLocalization } from 'src/providers/hooks';
import { ObservationSpeciesResults } from 'src/types/Observations';
import { getObservationSpeciesLivePlantsCount } from 'src/utils/observation';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import SpeciesSurvivalRateChart from './SpeciesSurvivalRateChart';
import SpeciesTotalPlantsChart from './SpeciesTotalPlantsChart';

export type AggregatedPlantsStatsProps = {
  completedTime?: string;
  totalPlants?: number;
  totalSpecies?: number;
  plantingDensity?: number;
  survivalRate?: number;
  species?: ObservationSpeciesResults[];
  hasObservedPermanentPlots?: boolean;
};

export default function AggregatedPlantsStats({
  completedTime,
  totalSpecies,
  plantingDensity,
  survivalRate,
  species,
  hasObservedPermanentPlots,
}: AggregatedPlantsStatsProps): JSX.Element {
  const { strings } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const infoCardGridSize = isMobile ? 12 : 3;
  const chartGridSize = isMobile ? 12 : 6;

  const livePlants = getObservationSpeciesLivePlantsCount(species);

  const handleMissingData = (num?: number) => (!completedTime && !num ? '' : num);

  const getData = () => [
    { label: strings.LIVE_PLANTS, tooltip: strings.TOOLTIP_LIVE_PLANTS, value: handleMissingData(livePlants) },
    { label: strings.SPECIES, value: handleMissingData(totalSpecies) },
    {
      label: strings.PLANT_DENSITY,
      tooltip: strings.PLANT_DENSITY_MISSING_TOOLTIP,
      value: plantingDensity,
    },
    {
      label: strings.SURVIVAL_RATE,
      value: hasObservedPermanentPlots ? (survivalRate ? `${survivalRate}%` : '') : '',
      tooltip: hasObservedPermanentPlots && strings.SURVIVAL_RATE_COLUMN_TOOLTIP,
    },
  ];

  return (
    <Box display='flex' flexDirection='column'>
      <Grid container spacing={3} marginBottom={3}>
        {getData().map((data) => (
          <Grid item xs={infoCardGridSize} key={data.label}>
            <OverviewItemCard
              isEditable={false}
              title={data.label}
              contents={data.value?.toString() ?? null}
              titleInfoTooltip={data.tooltip}
            />
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={chartGridSize}>
          <ChartWrapper
            title={
              <Box display='flex'>
                {strings.NUMBER_OF_LIVE_PLANTS_PER_SPECIES}
                <IconTooltip title={strings.NUMBER_OF_LIVE_PLANTS_PER_SPECIES_TOOLTIP} />
              </Box>
            }
          >
            <SpeciesTotalPlantsChart species={species} minHeight='170px' />
          </ChartWrapper>
        </Grid>
        <Grid item xs={chartGridSize}>
          <ChartWrapper
            title={strings.SURVIVAL_RATE_PER_SPECIES_AS_OF_THIS_OBSERVATION}
            tooltip={strings.SURVIVAL_RATE_PER_SPECIES_AS_OF_THIS_OBSERVATION_TOOLTIP}
          >
            <SpeciesSurvivalRateChart
              species={hasObservedPermanentPlots ? species : []}
              minHeight='170px'
              isNotCompleted={!completedTime}
            />
          </ChartWrapper>
        </Grid>
      </Grid>
    </Box>
  );
}

type ChartWrapperProps = {
  title: string | React.ReactNode;
  children: React.ReactNode;
  tooltip?: string;
};

const ChartWrapper = ({ title, children, tooltip }: ChartWrapperProps): JSX.Element => {
  const theme = useTheme();

  return (
    <Card style={{ height: '240px', padding: 1 }}>
      <Box height='220px' marginLeft={-0.5} display='flex' flexDirection='column'>
        <Box display='flex' alignItems={'center'} margin={theme.spacing(2, 2, 2, 2.5)}>
          <Typography fontSize='14px' lineHeight='20px' fontWeight={400} color={theme.palette.TwClrTxtSecondary}>
            {title}
          </Typography>
          {tooltip && <IconTooltip title={tooltip} />}
        </Box>
        <Box height='170px' display='flex' flexDirection='column' margin={theme.spacing(0, 1)}>
          {children}
        </Box>
      </Box>
    </Card>
  );
};
