import React from 'react';

import { useTheme } from '@mui/material';

import strings from 'src/strings';
import { ReportSystemMetric, SystemMetricName } from 'src/types/AcceleratorReport';

import InvertedCard from './InvertedCard';

type ReportMetricCardProps = {
  metrics: ReportSystemMetric[];
  metricName: SystemMetricName;
  label: string;
  units?: string;
  formatter?: (value: number | undefined) => string;
};

const ReportMetricCard = ({ label, metrics, metricName, units, formatter }: ReportMetricCardProps) => {
  const theme = useTheme();

  const metric = metrics.find((m) => m.metric === metricName);
  const value = metric?.overrideValue || metric?.systemValue;

  return (
    <InvertedCard
      md={4}
      label={label}
      backgroundColor={theme.palette.TwClrBaseGray200}
      value={formatter ? formatter(value) : value}
      units={units}
      rightLabel={strings.PROGRESS_REPORT}
    />
  );
};

export default ReportMetricCard;
