import { useEffect, useRef } from 'react';

import { useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Chart } from 'chart.js';
import moment from 'moment-timezone';

import { ViabilityTestResult } from 'src/types/Accession';

import { newChart } from '../../../components/common/Chart';
import { useLocalization } from '../../../providers';

const useStyles = makeStyles(() => ({
  chart: {
    height: '180px',
  },
}));

export interface Props {
  observations: ViabilityTestResult[];
}

export default function ObservationsChart({ observations }: Props): JSX.Element {
  const classes = useStyles();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const { activeLocale } = useLocalization();
  const theme = useTheme();

  useEffect(() => {
    const createChart = async () => {
      const ctx = canvasRef?.current?.getContext('2d');
      if (ctx && activeLocale) {
        if (chartRef.current) {
          chartRef.current?.destroy();
          chartRef.current = null;
        }

        // The X axis is the user-entered observation date. Since it's user-entered, we want to
        // display it as-is rather than trying to do a time zone adjustment. Since Chart.js shows
        // dates and times in the browser time zone, we therefore need to adjust the observation
        // dates so they match the user's time zone. That is, if the user is in, say, East Africa
        // Time, we need to take a user-entered date of 2023-01-26 and turn it into a timestamp of
        // 2023-01-26T00:00:00 EAT.
        const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const data = observations.reverse().map((entry) => ({
          x: moment.tz(entry.recordingDate, localTimeZone).toDate(),
          y: entry.seedsGerminated,
        }));

        chartRef.current = await newChart(activeLocale, ctx, {
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
  }, [activeLocale, observations]);

  return <canvas id='myChart' ref={canvasRef} className={classes.chart} />;
}
