import { AnnotationPluginOptions } from 'chartjs-plugin-annotation/types/options';
import Chart, { ChartData } from './Chart';

export interface PieChartProps {
  chartId: string;
  chartData?: ChartData;
  customTooltipTitles?: string[];
  minHeight?: string;
  maxWidth?: string;
  barWidth?: number;
  barAnnotations?: AnnotationPluginOptions;
  yLimits?: { min?: number; max?: number };
  showLegend?: boolean;
}

export default function PieChart(props: PieChartProps): JSX.Element | null {
  return <Chart {...props} type='pie' showLegend={true} />;
}
