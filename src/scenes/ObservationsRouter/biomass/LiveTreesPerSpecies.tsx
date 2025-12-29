import React, { useMemo } from 'react';

import BarChart from 'src/components/common/Chart/BarChart';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { ExistingTreePayload } from 'src/types/Observations';

export type LiveTreesPerSpeciesProps = {
  trees?: ExistingTreePayload[];
};

export default function LiveTreesPerSpecies({ trees }: LiveTreesPerSpeciesProps): JSX.Element {
  const { species: availableSpecies } = useSpeciesData();

  const treeSpecies = useMemo(() => {
    const _treeSpecies: Record<string | number, number> = {};
    trees?.forEach((tree) => {
      if (!tree.isDead) {
        if (tree.speciesId) {
          _treeSpecies[tree.speciesId] = (_treeSpecies[tree.speciesId] || 0) + 1;
        } else if (tree.speciesName) {
          _treeSpecies[tree.speciesName] = (_treeSpecies[tree.speciesName] || 0) + 1;
        }
      }
    });
    return _treeSpecies;
  }, [trees]);

  const chartData = useMemo(
    () => ({
      labels: Object.keys(treeSpecies).map(
        (speciesId) =>
          availableSpecies?.find((sp) => sp.id.toString() === speciesId.toString())?.scientificName || speciesId
      ),
      datasets: [
        {
          values: Object.values(treeSpecies),
        },
      ],
    }),
    [availableSpecies, treeSpecies]
  );

  return <BarChart chartId='observationsSurvivalRateBySpecies' chartData={chartData} barWidth={0} minHeight='300px' />;
}
