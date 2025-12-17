import React, { useMemo } from 'react';

import BarChart from 'src/components/common/Chart/BarChart';
import { ObservationSpeciesResults } from 'src/types/Observations';

export type SpeciesTotalPlantsChartProps = {
  minHeight?: string;
  species?: ObservationSpeciesResults[];
  isCompleted: boolean;
};

export default function SpeciesTotalPlantsChart({
  minHeight,
  species,
  isCompleted,
}: SpeciesTotalPlantsChartProps): JSX.Element {
  type Data = {
    labels: string[];
    values: number[];
  };

  const mortalityRates = useMemo((): Data => {
    const data: Data = { labels: [], values: [] };

    species?.forEach((speciesData) => {
      const { speciesName, speciesScientificName, mortalityRate } = speciesData;

      if (mortalityRate !== undefined && mortalityRate !== null) {
        const label: string = speciesScientificName || speciesName || '';
        const value: number = mortalityRate;
        data.labels.push(label);
        data.values.push(value);
      }
    });

    return data;
  }, [species]);

  const chartData = useMemo(
    () => ({
      labels: mortalityRates.labels,
      datasets: [
        {
          values: isCompleted ? mortalityRates.values : [],
        },
      ],
    }),
    [mortalityRates, isCompleted]
  );

  return (
    <BarChart chartId='observationsMortalityRateBySpecies' chartData={chartData} barWidth={0} minHeight={minHeight} />
  );
}
