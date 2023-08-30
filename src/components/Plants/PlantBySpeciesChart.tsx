import React, { useEffect, useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { cardTitleStyle } from './PlantingSiteDetails';
import strings from 'src/strings';
import BarChart from 'src/components/common/Chart/BarChart';

export interface PlantBySpeciesChartProps {
  plantsBySpecies?: { [key: string]: number } | undefined;
}

export default function PlantBySpeciesChart({ plantsBySpecies }: PlantBySpeciesChartProps): JSX.Element {
  const theme = useTheme();
  const [labels, setLabels] = useState<string[]>();
  const [values, setValues] = useState<number[]>();

  useEffect(() => {
    if (plantsBySpecies) {
      setLabels(Object.keys(plantsBySpecies));
      setValues(Object.values(plantsBySpecies));
    } else {
      setLabels([]);
      setValues([]);
    }
  }, [plantsBySpecies]);

  return (
    <>
      <Typography sx={cardTitleStyle}>{strings.NUMBER_OF_PLANTS_BY_SPECIES}</Typography>
      <Box sx={{ marginTop: theme.spacing(3), display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <BarChart
          chartId='plantsBySpecies'
          chartData={{
            labels: labels ?? [],
            datasets: [
              {
                values: values ?? [],
              },
            ],
          }}
        />
      </Box>
    </>
  );
}
