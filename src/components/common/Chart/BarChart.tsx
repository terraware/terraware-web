import { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@mui/styles';
import { Theme, useTheme } from '@mui/material';
import { generateTerrawareRandomColors } from 'src/utils/generateRandomColor';
import { useLocalization } from 'src/providers';
import { newChart } from './';
import { Chart, ChartTypeRegistry } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { AnnotationPluginOptions } from 'chartjs-plugin-annotation/types/options';

Chart.register(annotationPlugin);

export interface StyleProps {
  minHeight?: string;
  maxWidth?: string;
}

const useStyles = makeStyles<Theme, StyleProps>(() => ({
  chart: {
    minHeight: (props) => props.minHeight ?? '200px',
    maxWidth: (props) => props.maxWidth ?? undefined,
  },
}));

export interface BarChartProps {
  type?: keyof ChartTypeRegistry;
  chartId: string;
  chartLabels?: string[];
  chartValues?: number[];
  customTooltipTitles?: string[];
  minHeight?: string;
  maxWidth?: string;
  barWidth?: number;
  barAnnotations?: AnnotationPluginOptions;
  yLimits?: { min?: number; max?: number };
}

export default function BarChart(props: BarChartProps): JSX.Element | null {
  const { chartLabels, chartValues, type } = props;
  const { activeLocale } = useLocalization();
  const [locale, setLocale] = useState<string | null>(null);

  useEffect(() => {
    setLocale(activeLocale);
  }, [activeLocale]);

  if (!locale || !chartLabels || !chartValues) {
    return null;
  }

  return (
    <BarChartContent
      {...props}
      locale={locale}
      chartLabels={chartLabels}
      chartValues={chartValues}
      key={`${locale}_${chartLabels.length}_${chartValues.length}`}
    />
  );
}

interface BarChartContentProps {
  type?: keyof ChartTypeRegistry;
  chartId: string;
  chartLabels: string[];
  chartValues: number[];
  customTooltipTitles?: string[];
  minHeight?: string;
  maxWidth?: string;
  locale: string;
  barWidth?: number;
  barAnnotations?: AnnotationPluginOptions;
  yLimits?: { min?: number; max?: number };
}

function BarChartContent(props: BarChartContentProps): JSX.Element {
  const {
    type,
    chartId,
    chartLabels,
    chartValues,
    customTooltipTitles,
    minHeight,
    maxWidth,
    locale,
    barWidth,
    barAnnotations,
    yLimits,
  } = props;
  const classes = useStyles({ minHeight, maxWidth });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const theme = useTheme();

  const barThickness = barWidth === undefined ? 50 : barWidth === 0 ? 'flex' : barWidth;

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
          type: type || 'bar',
          data: {
            labels: chartLabels,
            datasets: [
              {
                data: chartValues,
                barThickness,
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
              annotation: barAnnotations,
              legend: {
                display: false,
              },
              tooltip: {
                displayColors: false,
                callbacks: {
                  title: customTooltipTitles
                    ? ([context]) => {
                        return customTooltipTitles[context.dataIndex];
                      }
                    : undefined,
                },
              },
            },
            scales: {
              y: {
                ticks: {
                  precision: 0,
                },
                min: yLimits?.min,
                max: yLimits?.max,
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
