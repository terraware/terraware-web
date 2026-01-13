import React, { useMemo } from 'react';

import BarChart from 'src/components/common/Chart/BarChart';
import { ObservationSpeciesResults } from 'src/types/Observations';

export type SpeciesTotalPlantsChartProps = {
  chartId: string;
  minHeight?: string;
  species?: ObservationSpeciesResults[];
};

export default function SpeciesTotalPlantsChart({
  chartId,
  minHeight,
  species,
}: SpeciesTotalPlantsChartProps): JSX.Element {
  type Data = {
    labels: string[];
    values: number[];
  };

  const totals = useMemo((): Data => {
    const data: Data = { labels: [], values: [] };

    species?.forEach((speciesData) => {
      const { speciesName, speciesScientificName, totalLive } = speciesData;
      const label: string = speciesScientificName || speciesName || '';

      data.labels.push(label);
      data.values.push(totalLive);
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

  return <BarChart chartId={chartId} chartData={chartData} barWidth={0} minHeight={minHeight} />;
}
