import { useTheme } from '@mui/material';
import Chart from 'chart.js/auto';
import React from 'react';
import { makeStyles } from '@mui/styles';
import { TestResult } from 'src/api/types/accessions';

const useStyles = makeStyles(() => ({
  chart: {
    height: '180px',
  },
}));

export interface Props {
  observations: TestResult[];
}

export default function ObservationsChart({ observations }: Props): JSX.Element {
  const classes = useStyles();
  const chartRef = React.useRef<HTMLCanvasElement>(null);
  const theme = useTheme();

  React.useEffect(() => {
    const ctx = chartRef?.current?.getContext('2d');
    if (ctx) {
      const data = observations.reverse();
      // tslint:disable-next-line:no-unused-expression
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.map((entry) => entry.recordingDate),
          datasets: [
            {
              backgroundColor: theme.palette.accent[4],
              data: data.map((entry) => entry.seedsGerminated),
              fill: false,
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          layout: {
            padding: {
              left: 50,
              right: 50,
              top: 10,
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            // @ts-ignore
            xAxes: [
              {
                gridLines: {
                  display: false,
                },
              },
            ],
            // @ts-ignore
            yAxes: [
              {
                display: true,
                gridLines: {
                  lineWidth: 0,
                  zeroLineWidth: 2,
                  zeroLineColor: '#ccc',
                },
                ticks: {
                  beginAtZero: true,
                  display: false,
                },
              },
            ],
          },
          tooltips: {
            enabled: false,
          },
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas id='myChart' ref={chartRef} className={classes.chart} />;
}
