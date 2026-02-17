import React, { useMemo } from 'react';

import { useTheme } from '@mui/material';

import strings from 'src/strings';
import { MetricProgress } from 'src/types/AcceleratorProject';
import { SystemMetricName } from 'src/types/AcceleratorReport';

import InvertedCard from './InvertedCard';

type ReportMetricCardProps = {
  metricProgress: MetricProgress[];
  metricName: SystemMetricName;
  label: string;
  units?: string;
  formatter?: (value: number | undefined) => string;
};

const ReportMetricCard = ({ label, metricProgress, metricName, units, formatter }: ReportMetricCardProps) => {
  const theme = useTheme();

  const value = useMemo(() => {
    return metricProgress.find(({ metric }) => metric === metricName)?.progress ?? 0;
  }, [metricName, metricProgress]);

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
