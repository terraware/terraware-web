import React, { type JSX, useMemo } from 'react';

import { Box } from '@mui/material';

import BarChart from 'src/components/common/Chart/BarChart';
import ChartMessage from 'src/components/common/Chart/ChartMessage';
import { useOrganizationSpecies } from 'src/hooks/useOrganizationSpecies';
import { useLocalization } from 'src/providers';
import { BiomassTreeSpeciesResultsPayload } from 'src/queries/generated/observations';

export type LiveTreesPerSpeciesProps = {
  treeSpecies?: BiomassTreeSpeciesResultsPayload[];
};

export default function LiveTreesPerSpecies({ treeSpecies }: LiveTreesPerSpeciesProps): JSX.Element {
  const { species: availableSpecies } = useOrganizationSpecies();
  const { strings } = useLocalization();

  const liveTreesBySpecies = useMemo(() => {
    const counts: Record<string | number, number> = {};
    treeSpecies?.forEach((species) => {
      if (species.totalLive > 0) {
        if (species.speciesId) {
          counts[species.speciesId] = species.totalLive;
        } else if (species.speciesName) {
          counts[species.speciesName] = species.totalLive;
        }
      }
    });
    return counts;
  }, [treeSpecies]);

  const chartData = useMemo(
    () => ({
      labels: Object.keys(liveTreesBySpecies).map(
        (speciesId) =>
          availableSpecies?.find((sp) => sp.id.toString() === speciesId.toString())?.scientificName || speciesId
      ),
      datasets: [
        {
          values: Object.values(liveTreesBySpecies),
        },
      ],
    }),
    [availableSpecies, liveTreesBySpecies]
  );

  const hasData = chartData.datasets[0].values.length > 0;

  return (
    <Box position='relative' height='100%'>
      {!hasData && <ChartMessage message={strings.DATA_IS_NOT_YET_AVAILABLE} />}
      <BarChart chartId='liveTreeSpecies' chartData={chartData} barWidth={0} minHeight='300px' />
    </Box>
  );
}
