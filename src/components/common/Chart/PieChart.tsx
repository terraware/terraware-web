import React, { type JSX } from 'react';

import Chart, { BaseChartProps } from './Chart';

export type PieChartProps = Omit<BaseChartProps, 'elementColor | xAxisLabel | yAxisLabel'>;

export default function PieChart(props: PieChartProps): JSX.Element | null {
  return <Chart {...props} type='pie' showLegend={true} />;
}
