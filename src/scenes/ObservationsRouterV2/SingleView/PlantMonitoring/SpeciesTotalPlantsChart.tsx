import React, { type JSX, useMemo } from 'react';

import { Box } from '@mui/material';

import BarChart from 'src/components/common/Chart/BarChart';
import ChartMessage from 'src/components/common/Chart/ChartMessage';
import { useLocalization } from 'src/providers';
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
  const { strings } = useLocalization();

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

  const hasData = useMemo(() => totals.values.some((v) => v > 0), [totals.values]);

  const chartData = useMemo(
    () => ({
      labels: hasData ? totals.labels : [],
      datasets: [
        {
          values: hasData ? totals.values : [],
        },
      ],
    }),
    [hasData, totals]
  );

  return (
    <Box position='relative' height='100%'>
      {!hasData && <ChartMessage message={strings.DATA_IS_NOT_YET_AVAILABLE} />}
      <BarChart chartId={chartId} chartData={chartData} barWidth={0} minHeight={minHeight} />
    </Box>
  );
}
