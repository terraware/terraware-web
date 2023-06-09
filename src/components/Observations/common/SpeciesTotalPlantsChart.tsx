import { useMemo } from 'react';
import { ObservationSpeciesResults } from 'src/types/Observations';
import BarChart from 'src/components/common/Chart/BarChart';

export type SpeciesTotalPlantsChartProps = {
  species?: ObservationSpeciesResults[];
};

export default function SpeciesTotalPlantsChart({ species }: SpeciesTotalPlantsChartProps): JSX.Element {
  type Data = {
    labels: string[];
    values: number[];
  };

  const totals = useMemo((): Data => {
    const data: Data = { labels: [], values: [] };

    species?.forEach((specie) => {
      const { speciesCommonName, speciesName, speciesScientificName, totalDead, totalExisting, totalLive } = specie;

      const label: string = speciesName ?? speciesCommonName ?? speciesScientificName;
      const totalPlants: number = totalDead + totalExisting + totalLive;

      data.labels.push(label);
      data.values.push(totalPlants);
    });

    return data;
  }, [species]);

  return (
    <BarChart
      chartId='observationsTotalPlantsBySpecies'
      chartLabels={totals.labels}
      chartValues={totals.values}
      barWidth={0}
    />
  );
}
