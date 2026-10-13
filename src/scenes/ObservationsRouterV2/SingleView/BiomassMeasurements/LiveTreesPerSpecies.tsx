import React, { type JSX, useMemo } from 'react';

import BarChart from 'src/components/common/Chart/BarChart';
import { useOrganizationSpecies } from 'src/hooks/useOrganizationSpecies';
import { BiomassTreeSpeciesResultsPayload } from 'src/queries/generated/observations';

export type LiveTreesPerSpeciesProps = {
  treeSpecies?: BiomassTreeSpeciesResultsPayload[];
};

export default function LiveTreesPerSpecies({ treeSpecies }: LiveTreesPerSpeciesProps): JSX.Element {
  const { species: availableSpecies } = useOrganizationSpecies();

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

  return <BarChart chartId='liveTreeSpecies' chartData={chartData} barWidth={0} minHeight='300px' />;
}
