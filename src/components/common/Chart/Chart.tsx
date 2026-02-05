import React, { type JSX, useCallback, useEffect, useRef, useState } from 'react';

import { useTheme } from '@mui/material';
import {
  CartesianScaleTypeRegistry,
  Chart as ChartJS,
  ChartTypeRegistry,
  PluginOptionsByType,
  ScaleOptionsByType,
  ScaleType,
  TimeUnit,
  TooltipItem,
  TooltipModel,
} from 'chart.js';
import { _DeepPartialObject } from 'chart.js/dist/types/utils';
import annotationPlugin from 'chartjs-plugin-annotation';
import { AnnotationPluginOptions } from 'chartjs-plugin-annotation/types/options';

import { useLocalization } from 'src/providers';
import { htmlLegendPlugin } from 'src/scenes/PlantsDashboardRouter/components/htmlLegendPlugin';
import { WithRequired } from 'src/types/utils';
import { generateTerrawareRandomColors } from 'src/utils/generateRandomColor';

import { newChart } from '.';
import { emptyDoughnutPlugin } from './emptyDoughnutPlugin';

ChartJS.register(annotationPlugin);

export type ChartDataset = {
  color?: string;
  values: (number | null)[] | [number, number][];
  // Dataset label which will appear in legends and tooltips
  label?: string;
  showLine?: boolean;
  fill?: any;
  pointRadius?: number;
  borderWidth?: number;
  xAxisID?: string;
  minBarLength?: number;
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
  pointRadius?: number;
  customScales?: _DeepPartialObject<{
    [key: string]: ScaleOptionsByType<'radialLinear' | keyof CartesianScaleTypeRegistry>;
  }>;
  customTooltipLabel?: (
    this: TooltipModel<keyof ChartTypeRegistry>,
    tooltipItem: TooltipItem<keyof ChartTypeRegistry>
  ) => string | void | string[];
  customLegend?: boolean;
  customLegendContainerId?: string;
  pluginsOptions?: _DeepPartialObject<PluginOptionsByType<keyof ChartTypeRegistry>> & {
    emptyDoughnut?: {
      color?: string;
      radiusDecrease?: number;
      width?: number;
    };
  };
};

export type ChartProps = BaseChartProps & {
  type: keyof ChartTypeRegistry;
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
    customScales,
    customTooltipLabel,
    customLegendContainerId,
    pointRadius,
    pluginsOptions,
  } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chart, setChart] = useState<ChartJS | null>(null);
  const theme = useTheme();
  const initialized = useRef(false);
  const isRecreating = useRef(false);
  const currentLocale = useRef(locale);

  const barThickness: number | 'flex' | undefined = barWidth === undefined ? 50 : barWidth === 0 ? 'flex' : barWidth;

  const getPlugins = useCallback(() => {
    const plugins = [];
    if (type === 'pie') {
      plugins.push(emptyDoughnutPlugin);
    }
    if (customLegend) {
      plugins.push(htmlLegendPlugin);
    }
    return plugins;
  }, [customLegend, type]);

  // destroy and recreate chart when locale changes to apply new number formatting
  useEffect(() => {
    if (initialized.current && currentLocale.current !== locale) {
      isRecreating.current = true;
      initialized.current = false;
      currentLocale.current = locale;
      if (chart) {
        chart.destroy();
        setChart(null);
      }
    }
  }, [locale, chart]);

  useEffect(() => {
    // used to prevent double render on dev scope (react 18)
    if (!initialized.current) {
      initialized.current = true;

      const getAxisType = () => {
        if (!xAxisType) {
          return {};
        }
        if (xAxisType === 'time') {
          return {
            type: xAxisType,
            time: {
              unit: 'month' as TimeUnit,
            },
            ticks: {
              stepSize: 4,
            },
          };
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
          const newChartInstance = await newChart(locale, ctx, {
            type,
            data: {
              labels: [],
              datasets: [],
            },
            options: {
              elements: {
                point: {
                  radius: pointRadius || 0,
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
              scales: customScales ?? {
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
              plugins: pluginsOptions,
            },
            plugins: getPlugins() ?? undefined,
          });
          setChart(newChartInstance);

          // reset recreating flag after chart is created
          isRecreating.current = false;

          // when component unmounts
          return () => {
            chart?.destroy();
          };
        }
      };
      void createChart();
    }
  }, [
    locale,
    chart,
    customScales,
    getPlugins,
    lineColor,
    pluginsOptions,
    pointRadius,
    type,
    xAxisType,
    yLimits?.max,
    yLimits?.min,
    yStepSize,
  ]);

  useEffect(() => {
    const colors = elementColor ?? generateTerrawareRandomColors(theme, chartData?.labels?.length || 0);
    const newLabels = chartData.labels;
    const newDatasets = chartData.datasets.map((ds) => ({
      label: ds.label,
      data: ds.values,
      showLine: ds.showLine,
      barThickness,
      backgroundColor: ds.color ?? colors,
      minBarLength: ds.minBarLength || 3,
      fill: ds.fill,
      pointRadius: ds.pointRadius,
      borderWidth: ds.borderWidth,
      xAxisID: ds.xAxisID,
    }));
    const newPlugins = {
      ...pluginsOptions,
      annotation: barAnnotations,
      legend: {
        ...(pluginsOptions?.legend ?? {}),
        display: customLegend ? false : !!showLegend,
      },
      htmlLegend: {
        containerID: customLegendContainerId ? customLegendContainerId : undefined,
      },
      tooltip: {
        displayColors: false,
        callbacks: {
          title: customTooltipTitles
            ? ([context]: any) => {
                return customTooltipTitles[context.dataIndex];
              }
            : undefined,
          label: customTooltipLabel,
        },
      },
    };
    if (chart && !isRecreating.current) {
      chart.data.labels = newLabels;
      chart.data.datasets = newDatasets;
      chart.options.plugins = newPlugins;
      chart.update();
    }
  }, [
    chart,
    chartData,
    showLegend,
    barAnnotations,
    customTooltipTitles,
    barThickness,
    elementColor,
    theme,
    customLegend,
    customLegendContainerId,
    customTooltipLabel,
    pluginsOptions,
  ]);

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
