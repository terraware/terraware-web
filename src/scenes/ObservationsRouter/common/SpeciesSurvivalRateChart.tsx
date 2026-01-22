import React, { type JSX, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';

import BarChart from 'src/components/common/Chart/BarChart';
import strings from 'src/strings';
import { ObservationSpeciesResults } from 'src/types/Observations';

export type SpeciesSurvivalRateChartProps = {
  minHeight?: string;
  species?: ObservationSpeciesResults[];
  isNotCompleted?: boolean;
  isTemporary?: boolean;
};

export default function SpeciesSurvivalRateChart({
  minHeight,
  species,
  isNotCompleted,
  isTemporary,
}: SpeciesSurvivalRateChartProps): JSX.Element {
  type Data = {
    labels: string[];
    values: number[];
  };
  const theme = useTheme();

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
          values: !isNotCompleted && !isTemporary ? data.values : [],
        },
      ],
    };
  }, [species, isNotCompleted, isTemporary]);

  return (
    <Box position='relative'>
      {(isTemporary || isNotCompleted) && (
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
        <BarChart
          chartId='observationsSurvivalRateBySpecies'
          chartData={chartData}
          barWidth={0}
          minHeight={minHeight}
        />
      </Box>
    </Box>
  );
}
