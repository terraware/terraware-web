import { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@mui/styles';
import { Theme, useTheme } from '@mui/material';
import { generateTerrawareRandomColors } from 'src/utils/generateRandomColor';
import { useLocalization } from 'src/providers';
import { newChart } from '.';
import { Chart as ChartJS, ChartTypeRegistry } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { AnnotationPluginOptions } from 'chartjs-plugin-annotation/types/options';

ChartJS.register(annotationPlugin);

type ChartDataset = {
  color?: string;
  values: (number | null)[];
  // Dataset label which will appear in legends and tooltips
  label?: string;
};

export type ChartData = {
  labels: string[];
  datasets: ChartDataset[];
};

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

export interface ChartProps {
  type: keyof ChartTypeRegistry;
  chartId: string;
  chartData?: ChartData;
  customTooltipTitles?: string[];
  minHeight?: string;
  maxWidth?: string;
  barWidth?: number;
  elementColor?: string;
  barAnnotations?: AnnotationPluginOptions;
  yLimits?: { min?: number; max?: number };
  showLegend?: boolean;
}

export default function Chart(props: ChartProps): JSX.Element | null {
  const { chartData } = props;
  const { activeLocale } = useLocalization();
  const [locale, setLocale] = useState<string | null>(null);

  useEffect(() => {
    setLocale(activeLocale);
  }, [activeLocale]);

  if (!locale || !chartData?.labels) {
    return null;
  }

  return <ChartContent {...props} chartData={chartData} locale={locale} />;
}

interface ChartContentProps {
  type: keyof ChartTypeRegistry;
  chartId: string;
  chartData: ChartData;
  customTooltipTitles?: string[];
  minHeight?: string;
  maxWidth?: string;
  locale: string;
  barWidth?: number;
  elementColor?: string;
  barAnnotations?: AnnotationPluginOptions;
  yLimits?: { min?: number; max?: number };
  showLegend?: boolean;
}

function ChartContent(props: ChartContentProps): JSX.Element {
  const {
    type,
    chartId,
    chartData,
    customTooltipTitles,
    minHeight,
    maxWidth,
    locale,
    barWidth,
    elementColor,
    barAnnotations,
    yLimits,
    showLegend,
  } = props;
  const classes = useStyles({ minHeight, maxWidth });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chart, setChart] = useState<ChartJS | null>(null);
  const theme = useTheme();

  const barThickness: number | 'flex' | undefined = barWidth === undefined ? 50 : barWidth === 0 ? 'flex' : barWidth;

  useEffect(() => {
    const createChart = async () => {
      if (chart) {
        chart.destroy();
      }

      const ctx = canvasRef?.current?.getContext('2d');
      if (ctx) {
        setChart(
          await newChart(locale, ctx, {
            type,
            data: {
              labels: [],
              datasets: [],
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
              scales: {
                x: {
                  display: type === 'pie' ? false : undefined,
                },
                y: {
                  ticks: {
                    precision: 0,
                  },
                  min: yLimits?.min,
                  max: yLimits?.max,
                  display: type === 'pie' ? false : undefined,
                },
              },
            },
          })
        );
        // when component unmounts
        return () => {
          chart?.destroy();
        };
      }
    };
    createChart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  useEffect(() => {
    const colors = elementColor ?? generateTerrawareRandomColors(theme, chartData?.labels?.length || 0);
    const newLabels = chartData.labels;
    const newDatasets = chartData.datasets.map((ds) => ({
      label: ds.label,
      data: ds.values,
      barThickness,
      backgroundColor: ds.color ?? colors,
      minBarLength: 3,
    }));
    const newPlugins = {
      annotation: barAnnotations,
      legend: {
        display: !!showLegend,
      },
      tooltip: {
        displayColors: false,
        callbacks: {
          title: customTooltipTitles
            ? ([context]: any) => {
                return customTooltipTitles[context.dataIndex];
              }
            : undefined,
        },
      },
    };
    if (chart) {
      chart.data.labels = newLabels;
      chart.data.datasets = newDatasets;
      chart.options.plugins = newPlugins;
      chart.update();
    }
  }, [chart, chartData, showLegend, barAnnotations, customTooltipTitles, barThickness, elementColor, theme]);

  return <canvas id={chartId} ref={canvasRef} className={classes.chart} />;
}
