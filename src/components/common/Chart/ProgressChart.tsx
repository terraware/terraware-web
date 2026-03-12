import React, { type JSX } from 'react';

import { Box, LinearProgress, Typography, useTheme } from '@mui/material';

import { MetricStatus } from 'src/types/AcceleratorReport';

export type QuarterlyProgressItem = {
  quarter: string;
  value: number;
};

export type ProgressChartProps = {
  value: number;
  target: number;
  status?: MetricStatus;
  quarterlyProgress?: QuarterlyProgressItem[];
  reportLabel?: string;
  previousYearValue?: number;
  previousYearLabel?: string;
  yearLabel?: string;
  targetLabel?: string;
};

export default function ProgressChart({
  value,
  target,
  status,
  quarterlyProgress,
  reportLabel,
  previousYearValue,
  previousYearLabel,
  yearLabel,
  targetLabel,
}: ProgressChartProps): JSX.Element {
  const theme = useTheme();

  const fillColor =
    status === 'Unlikely'
      ? theme.palette.TwClrTxtDanger
      : status === 'Off-Track'
        ? theme.palette.TwClrTxtWarning
        : theme.palette.TwClrBgBrand;

  const hasLabels = reportLabel || (quarterlyProgress && quarterlyProgress.length > 0);

  if (quarterlyProgress && quarterlyProgress.length > 0) {
    const prevYear = previousYearValue ?? 0;
    const currentYearTotal = quarterlyProgress.reduce((sum, q) => sum + q.value, 0);
    const totalProgress = prevYear + currentYearTotal;
    const barMax = Math.max(totalProgress, target > 0 ? target : totalProgress);
    const barMin = prevYear;
    const barRange = barMax - barMin;

    const toPercent = (v: number) => (barRange > 0 ? ((v - barMin) / barRange) * 100 : 0);

    const targetPct = toPercent(target);

    let cumulative = prevYear;
    const segments = quarterlyProgress.map((q, i) => {
      const startPct = toPercent(cumulative);
      cumulative += q.value;
      const endPct = toPercent(cumulative);
      return {
        quarter: q.quarter,
        startPct,
        widthPct: endPct - startPct,
        endPct,
        isLast: i === quarterlyProgress.length - 1,
      };
    });

    return (
      <Box>
        <Box position='relative' height='18px'>
          {previousYearLabel && (
            <Box position='absolute' sx={{ left: 0 }}>
              <Typography fontSize='10px' color={theme.palette.TwClrTxtSecondary}>
                {previousYearLabel}
              </Typography>
            </Box>
          )}
          {segments.map(({ quarter, endPct }) => (
            <Box key={quarter} position='absolute' sx={{ left: `${endPct}%`, transform: 'translateX(-50%)' }}>
              <Typography fontSize='10px' color={theme.palette.TwClrTxtSecondary}>
                {quarter}
              </Typography>
            </Box>
          ))}
          {yearLabel && target > 0 && (
            <Box position='absolute' sx={{ left: `${targetPct}%`, transform: 'translateX(-50%)' }}>
              <Typography fontSize='10px' color={theme.palette.TwClrTxtSecondary}>
                {yearLabel}
              </Typography>
            </Box>
          )}
        </Box>

        <Box position='relative'>
          <Box
            sx={{
              position: 'relative',
              height: '12px',
              borderRadius: '4px',
              backgroundColor: theme.palette.TwClrBaseGray100,
              overflow: 'hidden',
            }}
          >
            {segments.map(({ quarter, startPct, widthPct }) => (
              <Box
                key={quarter}
                sx={{
                  position: 'absolute',
                  left: `${startPct}%`,
                  width: `${widthPct}%`,
                  height: '100%',
                  backgroundColor: fillColor,
                }}
              />
            ))}
          </Box>

          {segments.map(({ quarter, endPct }) => (
            <Box
              key={`divider-${quarter}`}
              sx={{
                position: 'absolute',
                left: `${endPct}%`,
                width: '1px',
                height: '18px',
                top: '-3px',
                backgroundColor: theme.palette.TwClrTxtSecondary,
                transform: 'translateX(-50%)',
              }}
            />
          ))}

          {target > 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: '-3px',
                left: `${targetPct}%`,
                width: '1px',
                height: '18px',
                backgroundColor: theme.palette.TwClrTxtSecondary,
                transform: 'translateX(-50%)',
              }}
            />
          )}
        </Box>

        {targetLabel && target > 0 && (
          <Box position='relative' height='18px'>
            <Box position='absolute' sx={{ left: `${targetPct}%`, transform: 'translateX(-50%)' }}>
              <Typography fontSize='10px' color={theme.palette.TwClrTxtSecondary}>
                {targetLabel}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    );
  }

  const percentage = target > 0 ? (100 * value) / target : 0;
  const clampedPct = isNaN(percentage) ? 0 : Math.min(100, percentage);

  return (
    <Box>
      {hasLabels && (
        <Box position='relative' height='18px'>
          {reportLabel && (
            <Box position='absolute' sx={{ left: `${clampedPct}%`, transform: 'translateX(-50%)' }}>
              <Typography fontSize='10px' color={theme.palette.TwClrTxtSecondary}>
                {reportLabel}
              </Typography>
            </Box>
          )}
        </Box>
      )}
      <LinearProgress
        variant='determinate'
        value={clampedPct}
        valueBuffer={100}
        sx={{
          height: '12px',
          borderRadius: '4px',
          backgroundColor: theme.palette.TwClrBaseGray100,
          '& span': { backgroundColor: fillColor },
        }}
      />
    </Box>
  );
}
