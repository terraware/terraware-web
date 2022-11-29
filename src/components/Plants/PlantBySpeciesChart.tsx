import Chart from 'chart.js/auto';
import React from 'react';
import { makeStyles } from '@mui/styles';
import { Box, Typography, useTheme } from '@mui/material';
import { cardTitleStyle } from './PlantingSiteDetails';
import strings from 'src/strings';
import { generateTerrawareRandomColors } from 'src/utils/generateRandomColor';

const useStyles = makeStyles(() => ({
  chart: {
    height: '180px',
  },
}));

export interface PlantBySpeciesChartProps {
  plantsBySpecies?: { [key: string]: number } | undefined;
}

export default function PlantBySpeciesChart({ plantsBySpecies }: PlantBySpeciesChartProps): JSX.Element {
  const classes = useStyles();
  const chartRef = React.useRef<HTMLCanvasElement>(null);
  const theme = useTheme();

  React.useEffect(() => {
    const ctx = chartRef?.current?.getContext('2d');
    if (ctx && plantsBySpecies) {
      const colors = generateTerrawareRandomColors(theme, Object.keys(plantsBySpecies).length);
      const data = plantsBySpecies;
      const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(data),
          datasets: [
            {
              data: Object.values(data),
              barThickness: 50, // number (pixels) or 'flex'
              backgroundColor: colors,
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          layout: {
            padding: {
              left: 0,
              right: 0,
              top: 10,
            },
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              displayColors: false,
            },
          },
          scales: {
            y: {
              ticks: {
                callback: (value, index, ticks) => {
                  if (+value % 1 === 0) {
                    return value;
                  }
                },
              },
            },
          },
        },
      });
      // when component unmounts
      return () => {
        myChart.destroy();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plantsBySpecies]);

  return (
    <>
      <Typography sx={cardTitleStyle}>{strings.NUMBER_OF_PLANTS_BY_SPECIES}</Typography>
      <Box sx={{ marginTop: theme.spacing(3) }}>
        <canvas id='plantsBySpecies' ref={chartRef} className={classes.chart} />
      </Box>
    </>
  );
}
