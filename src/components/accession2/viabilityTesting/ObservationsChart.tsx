import { useTheme } from '@mui/material';
import { Chart } from 'chart.js';
import { useEffect, useRef } from 'react';
import { makeStyles } from '@mui/styles';
import { TestResult } from 'src/api/types/accessions';
import { useLocalization } from '../../../providers';
import { newChart } from '../../common/Chart';
import moment from 'moment-timezone';

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const { loadedStringsForLocale } = useLocalization();
  const theme = useTheme();

  useEffect(() => {
    const createChart = async () => {
      const ctx = canvasRef?.current?.getContext('2d');
      if (ctx && loadedStringsForLocale) {
        if (chartRef.current) {
          chartRef.current?.destroy();
          chartRef.current = null;
        }

        const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const data = observations.reverse().map((entry) => ({
          x: moment.tz(entry.recordingDate, localTimeZone).toDate(),
          y: entry.seedsGerminated,
        }));

        chartRef.current = await newChart(loadedStringsForLocale, ctx, {
          type: 'line',
          data: {
            datasets: [
              {
                backgroundColor: theme.palette.accent[4],
                data,
                fill: false,
              },
            ],
          },
          options: {
            maintainAspectRatio: false,
            layout: {
              padding: {
                left: 0,
                right: 50,
                top: 10,
              },
            },
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                // enabled: false,
              },
            },
            scales: {
              x: {
                type: 'time',
                border: {
                  display: true,
                  color: theme.palette.TwClrBrdrTertiary,
                  width: 2,
                },
                grid: {
                  display: false,
                },
                ticks: {
                  source: 'data',
                },
                time: {
                  minUnit: 'day',
                  round: 'day',
                  tooltipFormat: 'PP',
                },
                max: data ? data[data.length - 1].x.getTime() : undefined,
                min: data ? data[0].x.getTime() : undefined,
              },
              y: {
                border: {
                  display: true,
                  color: theme.palette.TwClrBrdrTertiary,
                  width: 2,
                },
                display: true,
                // For some reason if we don't explicitly set min and max, on each call to
                // createChart(), Chart.js alternates between automatically choosing the correct
                // min/max based on the data and choosing {min: 0, max: 1}.
                max: data.length > 1 ? Math.max(...data.map((entry) => entry.y)) : undefined,
                min: data.length > 1 ? Math.min(...data.map((entry) => entry.y)) : undefined,
                ticks: {
                  stepSize: 1,
                },
              },
            },
          },
        });
      }
    };

    createChart();

    return () => chartRef.current?.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedStringsForLocale, observations]);

  return <canvas id='myChart' ref={canvasRef} className={classes.chart} />;
}
