import React, { type JSX, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';

import BarChart from 'src/components/common/Chart/BarChart';
import { useLocalization } from 'src/providers';
import { ObservationSpeciesResults } from 'src/types/Observations';

export type SpeciesSurvivalRateChartProps = {
  chartId: string;
  minHeight?: string;
  species?: ObservationSpeciesResults[];
  isCompleted: boolean;
  isTemporary: boolean;
};

export default function SpeciesSurvivalRateChart({
  chartId,
  minHeight,
  species,
  isCompleted,
  isTemporary,
}: SpeciesSurvivalRateChartProps): JSX.Element {
  type Data = {
    labels: string[];
    values: number[];
  };
  const theme = useTheme();
  const { strings } = useLocalization();

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
          values: isCompleted && !isTemporary ? data.values : [],
        },
      ],
    };
  }, [species, isCompleted, isTemporary]);

  return (
    <Box position='relative'>
      {(isTemporary || !isCompleted) && (
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
          {isTemporary ? strings.SURVIVAL_RATE_NOT_CALCULATED_FOR_TEMPORARY_PLOTS : strings.DATA_IS_NOT_YET_AVAILABLE}
        </Box>
      )}
      <Box>
        <BarChart chartId={chartId} chartData={chartData} barWidth={0} minHeight={minHeight} />
      </Box>
    </Box>
  );
}
