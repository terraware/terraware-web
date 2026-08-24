import React, { type JSX, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';

import IndicatorProgressRow from 'src/components/AcceleratorReports/IndicatorProgressRow';
import { ProgressIndicator, getProgressIndicators } from 'src/components/AcceleratorReports/utils';
import useOneAcceleratorReport from 'src/hooks/useOneAcceleratorReport';
import { useLocalization } from 'src/providers';

export type IndicatorProgressSectionContentProps = {
  editing?: boolean;
  indicators: ProgressIndicator[];
  onChangeIndicator?: (indicator: ProgressIndicator, id: string, value: unknown) => void;
  quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  isConsoleView?: boolean;
  year?: number;
};

export const IndicatorProgressSectionContent = ({
  editing,
  indicators,
  onChangeIndicator,
  quarter,
  isConsoleView,
  year,
}: IndicatorProgressSectionContentProps): JSX.Element | null => {
  const theme = useTheme();
  const { strings } = useLocalization();

  if (indicators.length === 0) {
    return null;
  }

  return (
    <Box marginBottom={theme.spacing(3)} padding={theme.spacing(2)}>
      <Box alignItems='center' display='flex' justifyContent='space-between' marginBottom={theme.spacing(2)}>
        <Typography fontSize='20px' fontWeight={600}>
          {strings.PROGRESS}
        </Typography>

        {isConsoleView && (
          <Box alignItems='center' columnGap={theme.spacing(2)} display='flex'>
            {(
              [
                {
                  icon: 'iconEye',
                  iconColor: theme.palette.TwClrIcnBrand,
                  label: strings.SHARED_WITH_FUNDER,
                  labelColor: theme.palette.TwClrTxtBrand,
                },
                {
                  icon: 'lock',
                  iconColor: theme.palette.TwClrIcnSecondary,
                  label: strings.INTERNAL_ONLY,
                  labelColor: theme.palette.TwClrTxtSecondary,
                },
              ] as const
            ).map((entry) => (
              <Box alignItems='center' columnGap={theme.spacing(0.5)} display='flex' key={entry.label}>
                <Icon fillColor={entry.iconColor} name={entry.icon} size='small' />

                <Typography color={entry.labelColor} fontSize='14px'>
                  {entry.label}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {indicators.map((indicator, index) => (
        <IndicatorProgressRow
          editing={editing}
          indicator={indicator}
          key={`${indicator.refId}-${index}`}
          onChange={(id, value) => onChangeIndicator?.(indicator, id, value)}
          quarter={quarter}
          isConsoleView={isConsoleView}
          year={year}
        />
      ))}
    </Box>
  );
};

type IndicatorProgressSectionProps = {
  isConsoleView?: boolean;
  reportId?: number;
};

const IndicatorProgressSection = ({ isConsoleView, reportId }: IndicatorProgressSectionProps): JSX.Element | null => {
  const { report } = useOneAcceleratorReport(reportId);

  const indicators = useMemo<ProgressIndicator[]>(() => getProgressIndicators(report), [report]);

  const year = report?.startDate ? Number(report.startDate.split('-')[0]) : undefined;

  return (
    <IndicatorProgressSectionContent
      indicators={indicators}
      isConsoleView={isConsoleView}
      quarter={report?.quarter}
      year={year}
    />
  );
};

export default IndicatorProgressSection;
