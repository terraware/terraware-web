import Chart from 'chart.js/auto';
import React from 'react';
import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material';
import { generateTerrawareRandomColors } from 'src/utils/generateRandomColor';

const useStyles = makeStyles(() => ({
  chart: {
    height: '180px',
  },
}));

export interface DashboardChartProps {
  chartId: string;
  chartLabels: string[];
  chartValues: number[];
}

export default function DashboardChart(props: DashboardChartProps): JSX.Element {
  const { chartId, chartLabels, chartValues } = props;
  const classes = useStyles();
  const chartRef = React.useRef<HTMLCanvasElement>(null);
  const theme = useTheme();

  React.useEffect(() => {
    const ctx = chartRef?.current?.getContext('2d');
    if (ctx && chartLabels && chartValues) {
      const colors = generateTerrawareRandomColors(theme, chartLabels.length);
      const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: chartLabels,
          datasets: [
            {
              data: chartValues,
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
  }, [chartLabels, chartValues]);

  return <canvas id={chartId} ref={chartRef} className={classes.chart} />;
}
