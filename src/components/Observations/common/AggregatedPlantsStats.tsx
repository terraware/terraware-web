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
  const theme = useTheme();
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
          <Card style={{ height: '240px' }}>
            <Box height='240px'>
              <Typography
                fontSize='14px'
                lineHeight='20px'
                fontWeight={400}
                color={theme.palette.TwClrTxtSecondary}
                marginBottom={2}
              >
                {strings.NUMBER_OF_PLANTS_BY_SPECIES}
              </Typography>
              <SpeciesTotalPlantsChart species={species} />
            </Box>
          </Card>
        </Grid>
        <Grid item xs={chartGridSize}>
          <Card style={{ height: '240px' }}>
            <Box height='240px'>
              <Typography
                fontSize='14px'
                lineHeight='20px'
                fontWeight={400}
                color={theme.palette.TwClrTxtSecondary}
                marginBottom={1}
              >
                {strings.MORTALITY_RATE_BY_SPECIES}
              </Typography>
              <SpeciesMortalityRateChart species={species} />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
