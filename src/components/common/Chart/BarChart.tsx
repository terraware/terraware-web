import React, { type JSX } from 'react';

import Chart, { BaseChartProps } from './Chart';

export type BarChartProps = BaseChartProps;

export default function BarChart(props: BarChartProps): JSX.Element | null {
  return <Chart {...props} type='bar' />;
}
