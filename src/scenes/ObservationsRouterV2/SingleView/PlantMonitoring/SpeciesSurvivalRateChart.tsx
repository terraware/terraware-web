import React, { type JSX, useMemo } from 'react';

import BarChart from 'src/components/common/Chart/BarChart';
import { ObservationSpeciesResults } from 'src/types/Observations';

export type SpeciesSurvivalRateChartProps = {
  chartId: string;
  minHeight?: string;
  species?: ObservationSpeciesResults[];
  isCompleted: boolean;
};

export default function SpeciesSurvivalRateChart({
  chartId,
  minHeight,
  species,
  isCompleted,
}: SpeciesSurvivalRateChartProps): JSX.Element {
  type Data = {
    labels: string[];
    values: number[];
  };

  const chartData = useMemo(() => {
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

    return {
      labels: data.labels,
      datasets: [
        {
          values: isCompleted ? data.values : [],
        },
      ],
    };
  }, [species, isCompleted]);

  return <BarChart chartId={chartId} chartData={chartData} barWidth={0} minHeight={minHeight} />;
}
