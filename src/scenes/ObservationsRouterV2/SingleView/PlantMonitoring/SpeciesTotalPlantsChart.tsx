import React, { type JSX, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';

import BarChart from 'src/components/common/Chart/BarChart';
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
  const theme = useTheme();
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

  const hasData = totals.values.some((v) => v > 0);

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
      {!hasData && (
        <Box
          sx={{
            backgroundColor: theme.palette.TwClrBgSecondary,
            padding: '10px',
            color: theme.palette.TwClrBaseBlack,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
            borderRadius: '4px',
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          {strings.DATA_IS_NOT_YET_AVAILABLE}
        </Box>
      )}
      <BarChart chartId={chartId} chartData={chartData} barWidth={0} minHeight={minHeight} />
    </Box>
  );
}
