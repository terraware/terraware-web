import React, { useMemo } from 'react';

import BarChart from 'src/components/common/Chart/BarChart';
import { ObservationSpeciesResults } from 'src/types/Observations';

export type SpeciesSurvivalRateChartProps = {
  minHeight?: string;
  species?: ObservationSpeciesResults[];
};

export default function SpeciesSurvivalRateChart({ minHeight, species }: SpeciesSurvivalRateChartProps): JSX.Element {
  type Data = {
    labels: string[];
    values: number[];
  };

  const survivalRates = useMemo((): Data => {
    const data: Data = { labels: [], values: [] };

    species?.forEach((speciesData) => {
      const { speciesName, speciesScientificName, survivalRate } = speciesData;

      if (survivalRate !== undefined && survivalRate !== null) {
        const label: string = speciesScientificName || speciesName || '';
        const value: number = survivalRate;
        data.labels.push(label);
        data.values.push(value);
      }
    });

    return data;
  }, [species]);

  const chartData = useMemo(
    () => ({
      labels: survivalRates.labels,
      datasets: [
        {
          values: survivalRates.values,
        },
      ],
    }),
    [survivalRates]
  );

  return (
    <BarChart chartId='observationsSurvivalRateBySpecies' chartData={chartData} barWidth={0} minHeight={minHeight} />
  );
}
