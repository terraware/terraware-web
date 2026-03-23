import React, { useMemo } from 'react';

import { useTheme } from '@mui/material';

import strings from 'src/strings';
import { IndicatorProgress } from 'src/types/AcceleratorProject';

import InvertedCard from './InvertedCard';

type ReportIndicatorCardProps = {
  indicatorProgress: IndicatorProgress[];
  indicatorName: IndicatorProgress['indicator'];
  label: string;
  units?: string;
  formatter?: (value: number | undefined) => string;
};

const ReportIndicatorCard = ({
  label,
  indicatorProgress,
  indicatorName,
  units,
  formatter,
}: ReportIndicatorCardProps) => {
  const theme = useTheme();

  const value = useMemo(() => {
    return indicatorProgress.find(({ indicator }) => indicator === indicatorName)?.progress ?? 0;
  }, [indicatorName, indicatorProgress]);

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

export default ReportIndicatorCard;
