import Chart from 'chart.js/auto';
import React from 'react';
import { makeStyles } from '@mui/styles';
import { Population } from '.';
import { generateRandomColors } from 'src/utils/generateRandomColor';
import { Box } from '@mui/material';

const useStyles = makeStyles(() => ({
  chart: {
    height: '180px',
  },
}));

export interface Props {
  chartData?: Population[];
}

export default function SpeciesByPlotChart({ chartData }: Props): JSX.Element {
  const classes = useStyles();
  const chartRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const ctx = chartRef?.current?.getContext('2d');
    if (ctx && chartData) {
      const colors = generateRandomColors(chartData.length);
      const data = chartData;
      const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map((population) => population.species_scientificName),
          datasets: [
            {
              data: data.map((population) => population.totalPlants),
              barThickness: 50,
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
  }, [chartData]);

  return (
    <Box sx={{ height: '180px', marginTop: 2 }}>
      <canvas id='speciesByPlotChart' ref={chartRef} className={classes.chart} />
    </Box>
  );
}
