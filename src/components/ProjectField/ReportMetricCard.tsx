import React, { useMemo } from 'react';

import { useTheme } from '@mui/material';

import strings from 'src/strings';
import { PublishedReportMetric, ReportSystemMetric, SystemMetricName } from 'src/types/AcceleratorReport';

import InvertedCard from './InvertedCard';

type ReportMetricCardProps = {
  metrics?: ReportSystemMetric[];
  publishedMetrics?: PublishedReportMetric[];
  metricName: SystemMetricName;
  label: string;
  units?: string;
  formatter?: (value: number | undefined) => string;
};

const ReportMetricCard = ({
  label,
  metrics,
  publishedMetrics,
  metricName,
  units,
  formatter,
}: ReportMetricCardProps) => {
  const theme = useTheme();
  if (metrics === undefined && publishedMetrics === undefined) {
    return <></>;
  }

  const value = useMemo(() => {
    if (metrics) {
      const metric = metrics.find((m) => m.metric === metricName);
      return metric?.overrideValue || metric?.systemValue;
    } else if (publishedMetrics) {
      return publishedMetrics.find((m) => m.name === metricName)?.value;
    }
  }, [metrics, publishedMetrics]);

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
