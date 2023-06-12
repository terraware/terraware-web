import React from 'react';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { ObservationSpeciesResults } from 'src/types/Observations';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import Card from 'src/components/common/Card';
import SpeciesTotalPlantsChart from './SpeciesTotalPlantsChart';
import SpeciesMortalityRateChart from './SpeciesMortalityRateChart';

export type AggregatedPlantsStatsProps = {
  totalPlants?: number;
  totalSpecies?: number;
  plantingDensity?: number;
  mortalityRate?: number;
  species?: ObservationSpeciesResults[];
};

export default function AggregatedPlantsStats({
  totalPlants,
  totalSpecies,
  plantingDensity,
  mortalityRate,
  species,
}: AggregatedPlantsStatsProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const infoCardGridSize = isMobile ? 12 : 3;
  const chartGridSize = isMobile ? 12 : 6;

  const getData = () => [
    { label: strings.PLANTS, value: totalPlants },
    { label: strings.SPECIES, value: totalSpecies },
    { label: strings.PLANTING_DENSITY, value: plantingDensity },
    { label: strings.MORTALITY_RATE, value: mortalityRate },
  ];

  return (
    <Box display='flex' flexDirection='column'>
      <Grid container spacing={3} marginBottom={3}>
        {getData().map((data) => (
          <Grid item xs={infoCardGridSize} key={data.label}>
            <OverviewItemCard isEditable={false} title={data.label} contents={data.value?.toString() ?? null} />
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={chartGridSize}>
          <ChartWrapper title={strings.NUMBER_OF_PLANTS_BY_SPECIES}>
            <SpeciesTotalPlantsChart species={species} />
          </ChartWrapper>
        </Grid>
        <Grid item xs={chartGridSize}>
          <ChartWrapper title={strings.MORTALITY_RATE_BY_SPECIES}>
            <SpeciesMortalityRateChart species={species} />
          </ChartWrapper>
        </Grid>
      </Grid>
    </Box>
  );
}

type ChartWrapperProps = {
  title: string;
  children: React.ReactNode;
};

const ChartWrapper = ({ title, children }: ChartWrapperProps): JSX.Element => {
  const theme = useTheme();

  return (
    <Card style={{ height: '240px', padding: 1 }}>
      <Box height='185px' marginLeft={-0.5}>
        <Typography
          fontSize='14px'
          lineHeight='20px'
          fontWeight={400}
          color={theme.palette.TwClrTxtSecondary}
          margin={theme.spacing(2, 2, 2, 2.5)}
        >
          {title}
        </Typography>
        {children}
      </Box>
    </Card>
  );
};
