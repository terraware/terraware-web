import React from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { IconTooltip } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import strings from 'src/strings';
import { ObservationSpeciesResults } from 'src/types/Observations';
import { getObservationSpeciesLivePlantsCount } from 'src/utils/observation';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import SpeciesMortalityRateChart from './SpeciesMortalityRateChart';
import SpeciesTotalPlantsChart from './SpeciesTotalPlantsChart';

export type AggregatedPlantsStatsProps = {
  completedTime?: string;
  totalPlants?: number;
  totalSpecies?: number;
  plantingDensity?: number;
  mortalityRate?: number;
  species?: ObservationSpeciesResults[];
  hasObservedPermanentPlots?: boolean;
};

export default function AggregatedPlantsStats({
  completedTime,
  totalSpecies,
  plantingDensity,
  mortalityRate,
  species,
  hasObservedPermanentPlots,
}: AggregatedPlantsStatsProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const infoCardGridSize = isMobile ? 12 : 3;
  const chartGridSize = isMobile ? 12 : 6;

  const livePlants = getObservationSpeciesLivePlantsCount(species);

  const handleMissingData = (num?: number) => (!completedTime && !num ? '' : num);

  const getData = () => [
    { label: strings.LIVE_PLANTS, value: handleMissingData(livePlants) },
    { label: strings.SPECIES, value: handleMissingData(totalSpecies) },
    {
      label: strings.PLANTING_DENSITY,
      value: plantingDensity,
      toolTip: strings.PLANTING_DENSITY_MISSING_TOOLTIP,
    },
    { label: strings.MORTALITY_RATE, value: hasObservedPermanentPlots ? handleMissingData(mortalityRate) : '' },
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
              titleInfoTooltip={data.toolTip}
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
          <ChartWrapper title={strings.MORTALITY_RATE_PER_SPECIES}>
            <SpeciesMortalityRateChart species={hasObservedPermanentPlots ? species : []} minHeight='170px' />
          </ChartWrapper>
        </Grid>
      </Grid>
    </Box>
  );
}

type ChartWrapperProps = {
  title: string | React.ReactNode;
  children: React.ReactNode;
};

const ChartWrapper = ({ title, children }: ChartWrapperProps): JSX.Element => {
  const theme = useTheme();

  return (
    <Card style={{ height: '240px', padding: 1 }}>
      <Box height='220px' marginLeft={-0.5} display='flex' flexDirection='column'>
        <Typography
          fontSize='14px'
          lineHeight='20px'
          fontWeight={400}
          color={theme.palette.TwClrTxtSecondary}
          margin={theme.spacing(2, 2, 2, 2.5)}
        >
          {title}
        </Typography>
        <Box height='170px' display='flex' flexDirection='column' margin={theme.spacing(0, 1)}>
          {children}
        </Box>
      </Box>
    </Card>
  );
};
