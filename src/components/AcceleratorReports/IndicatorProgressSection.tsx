import React, { type JSX, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import IndicatorProgressRow, { ProgressIndicator } from 'src/components/AcceleratorReports/IndicatorProgressRow';
import useOneAcceleratorReport from 'src/hooks/useOneAcceleratorReport';
import { useLocalization } from 'src/providers';

// Reference ids read like 11.2.3, so compare them segment by segment as numbers rather than as text,
// which would order 11.10 before 11.2.
const compareRefIds = (a: string, b: string) => {
  const aSegments = a.split('.');
  const bSegments = b.split('.');

  for (let index = 0; index < Math.max(aSegments.length, bSegments.length); index++) {
    const difference = (Number(aSegments[index]) || 0) - (Number(bSegments[index]) || 0);

    if (difference !== 0) {
      return difference;
    }
  }

  return 0;
};

export type IndicatorProgressSectionContentProps = {
  indicators: ProgressIndicator[];
  quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  year?: number;
};

export const IndicatorProgressSectionContent = ({
  indicators,
  quarter,
  year,
}: IndicatorProgressSectionContentProps): JSX.Element | null => {
  const theme = useTheme();
  const { strings } = useLocalization();

  const sortedIndicators = useMemo(() => [...indicators].sort((a, b) => compareRefIds(a.refId, b.refId)), [indicators]);

  if (indicators.length === 0) {
    return null;
  }

  return (
    <Box marginBottom={theme.spacing(3)} padding={theme.spacing(2)}>
      <Typography fontSize='20px' fontWeight={600} marginBottom={theme.spacing(2)}>
        {strings.PROGRESS}
      </Typography>

      {sortedIndicators.map((indicator, index) => (
        <IndicatorProgressRow indicator={indicator} key={`${indicator.refId}-${index}`} quarter={quarter} year={year} />
      ))}
    </Box>
  );
};

export type IndicatorProgressSectionProps = {
  reportId?: number;
};

const IndicatorProgressSection = ({ reportId }: IndicatorProgressSectionProps): JSX.Element | null => {
  const { report } = useOneAcceleratorReport(reportId);

  const indicators = useMemo<ProgressIndicator[]>(
    () => [
      ...(report?.commonIndicators ?? []),
      ...(report?.projectIndicators ?? []),
      ...(report?.autoCalculatedIndicators ?? []).map((indicator) => ({
        ...indicator,
        name: indicator.indicator,
        value: indicator.overrideValue ?? indicator.systemValue,
      })),
    ],
    [report]
  );

  const year = report?.startDate ? Number(report.startDate.split('-')[0]) : undefined;

  return <IndicatorProgressSectionContent indicators={indicators} quarter={report?.quarter} year={year} />;
};

export default IndicatorProgressSection;
