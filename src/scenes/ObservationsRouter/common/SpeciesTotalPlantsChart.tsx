import { useMemo } from 'react';

import BarChart from 'src/components/common/Chart/BarChart';
import { ObservationSpeciesResults } from 'src/types/Observations';

export type SpeciesTotalPlantsChartProps = {
  minHeight?: string;
  species?: ObservationSpeciesResults[];
};

export default function SpeciesTotalPlantsChart({ minHeight, species }: SpeciesTotalPlantsChartProps): JSX.Element {
  type Data = {
    labels: string[];
    values: number[];
  };

  const totals = useMemo((): Data => {
    const data: Data = { labels: [], values: [] };

    species?.forEach((speciesData) => {
      const { speciesName, speciesScientificName, totalPlants } = speciesData;
      const label: string = speciesScientificName || speciesName || '';

      data.labels.push(label);
      data.values.push(totalPlants);
    });

    return data;
  }, [species]);

  const chartData = useMemo(
    () => ({
      labels: totals.labels,
      datasets: [
        {
          values: totals.values,
        },
      ],
    }),
    [totals]
  );

  return (
    <BarChart chartId='observationsTotalPlantsBySpecies' chartData={chartData} barWidth={0} minHeight={minHeight} />
  );
}
