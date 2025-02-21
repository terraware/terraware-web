import React, { useMemo } from 'react';

import BarChart from 'src/components/common/Chart/BarChart';
import { ExistingTreePayload } from 'src/types/Observations';

import { useSpecies } from '../InventoryRouter/form/useSpecies';

export type LiveTreesPerSpeciesProps = {
  trees?: ExistingTreePayload[];
};

export default function LiveTreesPerSpecies({ trees }: LiveTreesPerSpeciesProps): JSX.Element {
  const species: Record<string, number> = {};
  const { availableSpecies } = useSpecies();

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
      labels: Object.keys(species).map(
        (speciesId) =>
          availableSpecies?.find((sp) => sp.id.toString() === speciesId.toString())?.scientificName || speciesId
      ),
      datasets: [
        {
          values: Object.values(species),
        },
      ],
    }),
    [species]
  );

  return <BarChart chartId='observationsMortalityRateBySpecies' chartData={chartData} barWidth={0} minHeight='360px' />;
}
