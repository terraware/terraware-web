import { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@mui/styles';
import { Theme, useTheme } from '@mui/material';
import { generateTerrawareRandomColors } from 'src/utils/generateRandomColor';
import { useLocalization } from '../../providers';
import { newChart } from '../common/Chart';
import { Chart } from 'chart.js';

export interface StyleProps {
  minHeight?: string;
}

const useStyles = makeStyles<Theme, StyleProps>(() => ({
  chart: {
    minHeight: (props) => props.minHeight ?? '200px',
  },
}));

export interface DashboardChartProps {
  chartId: string;
  chartLabels?: string[];
  chartValues?: number[];
  minHeight?: string;
}

export default function DashboardChart(props: DashboardChartProps): JSX.Element | null {
  const { chartLabels, chartValues } = props;
  const { activeLocale } = useLocalization();
  const [locale, setLocale] = useState<string | null>(null);

  useEffect(() => {
    setLocale(activeLocale);
  }, [activeLocale]);

  if (!locale || !chartLabels || !chartValues) {
    return null;
  }

  return (
    <DashboardChartContent
      {...props}
      locale={locale}
      chartLabels={chartLabels}
      chartValues={chartValues}
      key={`${locale}_${chartLabels.length}_${chartValues.length}`}
    />
  );
}

interface DashboardChartContentProps {
  chartId: string;
  chartLabels: string[];
  chartValues: number[];
  minHeight?: string;
  locale: string;
}

function DashboardChartContent(props: DashboardChartContentProps): JSX.Element {
  const { chartId, chartLabels, chartValues, minHeight, locale } = props;
  const classes = useStyles({ minHeight });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const createChart = async () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }

      const ctx = canvasRef?.current?.getContext('2d');
      if (ctx) {
        const colors = generateTerrawareRandomColors(theme, chartLabels?.length || 0);
        chartRef.current = await newChart(locale, ctx, {
          type: 'bar',
          data: {
            labels: chartLabels,
            datasets: [
              {
                data: chartValues,
                barThickness: 50, // number (pixels) or 'flex'
                backgroundColor: colors,
                minBarLength: 3,
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
                  precision: 0,
                },
              },
            },
          },
        });
        // when component unmounts
        return () => {
          chartRef.current?.destroy();
        };
      }
    };
    createChart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartLabels, chartValues, locale]);

  return <canvas id={chartId} ref={canvasRef} className={classes.chart} />;
}
