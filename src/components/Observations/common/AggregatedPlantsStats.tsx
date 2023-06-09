import { Box, Grid } from '@mui/material';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import Card from 'src/components/common/Card';

export type SpeciesStats = {
  totalDead: number;
  totalExisting: number;
  totalLive: number;
  speciesName?: string;
  speciesCommonName?: string;
  speciesScientificName?: string;
};

export type AggregatedPlantsStatsProps = {
  totalPlants?: number;
  totalSpecies?: number;
  plantingDensity?: number;
  mortalityRate?: number;
  species?: SpeciesStats[];
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
          <Card style={{ height: '240px' }}>add chart for {species?.length} species # plants</Card>
        </Grid>
        <Grid item xs={chartGridSize}>
          <Card style={{ height: '240px' }}>add chart for {species?.length} species mortality rate</Card>
        </Grid>
      </Grid>
    </Box>
  );
}
