import React, { useEffect, useRef, useState } from 'react';

import { useTheme } from '@mui/material';
import { Chart as ChartJS, ChartTypeRegistry, ScaleType } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { AnnotationPluginOptions } from 'chartjs-plugin-annotation/types/options';

import { useLocalization } from 'src/providers';
import { htmlLegendPlugin } from 'src/scenes/PlantsDashboardRouter/components/htmlLegendPlugin';
import { WithRequired } from 'src/types/utils';
import { generateTerrawareRandomColors } from 'src/utils/generateRandomColor';

import { newChart } from '.';

ChartJS.register(annotationPlugin);

type ChartDataset = {
  color?: string;
  values: (number | null)[];
  // Dataset label which will appear in legends and tooltips
  label?: string;
  showLine?: boolean;
  fill?: any;
  pointRadius?: number;
  borderWidth?: number;
};

export type ChartData = {
  labels: string[];
  datasets: ChartDataset[];
};

export interface StyleProps {
  minHeight?: string;
  maxWidth?: string;
}

export type BaseChartProps = {
  chartId: string;
  chartData?: ChartData;
  customTooltipTitles?: string[];
  minHeight?: string;
  maxWidth?: string;
  barWidth?: number;
  elementColor?: string | string[];
  barAnnotations?: AnnotationPluginOptions;
  yLimits?: { min?: number; max?: number };
  showLegend?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  yStepSize?: number;
  xAxisType?: ScaleType;
  lineColor?: string;
};

export type ChartProps = BaseChartProps & {
  type: keyof ChartTypeRegistry;
  customLegend?: boolean;
};

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

type ChartContentProps = WithRequired<ChartProps, 'chartData'> & {
  locale: string;
};

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
    yStepSize,
    xAxisType,
    lineColor,
    customLegend,
  } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chart, setChart] = useState<ChartJS | null>(null);
  const theme = useTheme();
  const initialized = useRef(false);

  const barThickness: number | 'flex' | undefined = barWidth === undefined ? 50 : barWidth === 0 ? 'flex' : barWidth;

  useEffect(() => {
    // used to prevent double render on dev scope (react 18)
    if (!initialized.current) {
      initialized.current = true;

      const getAxisType = () => {
        if (!xAxisType) {
          return {};
        }
        return {
          type: xAxisType,
        };
      };

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
                elements: {
                  point: {
                    radius: 0,
                  },
                  line: {
                    borderColor: lineColor,
                  },
                },
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
                    ...getAxisType(),
                  },
                  y: {
                    grace: '5%',
                    ticks: {
                      precision: 0,
                      stepSize: yStepSize,
                    },
                    min: yLimits?.min,
                    max: yLimits?.max,
                    display: type === 'pie' ? false : undefined,
                  },
                },
              },
              plugins: customLegend ? [htmlLegendPlugin] : undefined,
            })
          );
          // when component unmounts
          return () => {
            chart?.destroy();
          };
        }
      };
      createChart();
    }
    // eslint-disable-next-line
  }, [locale]);

  useEffect(() => {
    const colors = elementColor ?? generateTerrawareRandomColors(theme, chartData?.labels?.length || 0);
    const newLabels = chartData.labels;
    const newDatasets = chartData.datasets.map((ds) => ({
      label: ds.label,
      data: ds.values,
      showLine: ds.showLine,
      barThickness,
      backgroundColor: ds.color ?? colors,
      minBarLength: 3,
      fill: ds.fill,
      pointRadius: ds.pointRadius,
      borderWidth: ds.borderWidth,
    }));
    const newPlugins = {
      annotation: barAnnotations,
      legend: {
        display: customLegend ? false : !!showLegend,
      },
      htmlLegend: {
        containerID: customLegend ? 'legend-container-th' : undefined,
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

  return (
    <canvas
      id={chartId}
      ref={canvasRef}
      style={{
        minHeight: minHeight ?? '200px',
        maxWidth: maxWidth ?? undefined,
      }}
    />
  );
}
