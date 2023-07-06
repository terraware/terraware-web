import { AnnotationPluginOptions } from 'chartjs-plugin-annotation/types/options';
import Chart, { ChartData } from './Chart';

export interface BarChartProps {
  chartId: string;
  chartLabels?: string[];
  chartValues?: number[];
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

export default function BarChart(props: BarChartProps): JSX.Element | null {
  return <Chart {...props} type='bar' />;
}
