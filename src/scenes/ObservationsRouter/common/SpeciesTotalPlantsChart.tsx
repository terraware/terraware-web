import React, { useMemo } from 'react';

import { Box, useTheme } from '@mui/material';

import BarChart from 'src/components/common/Chart/BarChart';
import isEnabled from 'src/features';
import strings from 'src/strings';
import { ObservationSpeciesResults } from 'src/types/Observations';

export type SpeciesTotalPlantsChartProps = {
  minHeight?: string;
  species?: ObservationSpeciesResults[];
  isNotCompleted?: boolean;
};

export default function SpeciesTotalPlantsChart({
  minHeight,
  species,
  isNotCompleted,
}: SpeciesTotalPlantsChartProps): JSX.Element {
  type Data = {
    labels: string[];
    values: number[];
  };
  const isEditObservationsEnabled = isEnabled('Edit Observations');
  const theme = useTheme();

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

  return (
    <Box position='relative'>
      {isEditObservationsEnabled && isNotCompleted && (
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
      <BarChart chartId='observationsTotalPlantsBySpecies' chartData={chartData} barWidth={0} minHeight={minHeight} />
    </Box>
  );
}
