import React, { useMemo } from 'react';

import BarChart from 'src/components/common/Chart/BarChart';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { ExistingTreePayload } from 'src/types/Observations';

export type LiveTreesPerSpeciesProps = {
  trees?: ExistingTreePayload[];
};

export default function LiveTreesPerSpecies({ trees }: LiveTreesPerSpeciesProps): JSX.Element {
  const species: Record<string | number, number> = {};
  const { species: availableSpecies } = useSpeciesData();

  trees?.forEach((tree) => {
    if (!tree.isDead) {
      if (tree.speciesId) {
        species[tree.speciesId] = (species[tree.speciesId] || 0) + 1;
      } else if (tree.speciesName) {
        species[tree.speciesName] = (species[tree.speciesName] || 0) + 1;
      }
    }
  });

  const chartData = useMemo(
    () => ({
      labels: Object.keys(species).map((idOrName) => {
        if (typeof idOrName === 'number') {
          return availableSpecies.find((_speices) => _speices.id === idOrName)?.scientificName ?? '';
        } else {
          return idOrName;
        }
      }),
      datasets: [
        {
          values: Object.values(species),
        },
      ],
    }),
    [availableSpecies]
  );

  return <BarChart chartId='observationsMortalityRateBySpecies' chartData={chartData} barWidth={0} minHeight='360px' />;
}
