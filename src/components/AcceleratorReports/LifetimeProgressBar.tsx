import React, { type JSX, useCallback, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import { useLocalization } from 'src/providers';

const BAR_HEIGHT = 8;
const TICK_OVERHANG = 3;
const TICK_LABEL_HEIGHT = '16px';

type LifetimeProgressBarProps = {
  baseline?: number;
  currentProgress: number;
  endOfProjectTarget?: number;
  previousYearCumulativeTotal?: number;
  yearTarget?: number;
  year?: number;
};

const LifetimeProgressBar = ({
  baseline,
  currentProgress,
  endOfProjectTarget,
  previousYearCumulativeTotal,
  yearTarget,
  year,
}: LifetimeProgressBarProps): JSX.Element | null => {
  const theme = useTheme();
  const { strings } = useLocalization();

  const baselineValue = baseline ?? 0;
  const lifetimeSpan = endOfProjectTarget !== undefined ? endOfProjectTarget - baselineValue : 0;

  const toPercent = useCallback(
    (value: number) => ((value - baselineValue) / lifetimeSpan) * 100,
    [baselineValue, lifetimeSpan]
  );

  // positions stay inside the track even when progress runs past the end-of-project target
  const toBarPercent = useCallback((value: number) => Math.min(100, Math.max(0, toPercent(value))), [toPercent]);

  const ticks = useMemo(() => {
    if (lifetimeSpan <= 0 || year === undefined) {
      return [];
    }

    return [
      previousYearCumulativeTotal !== undefined
        ? { key: 'previousYear', label: String(year - 1), percent: toBarPercent(previousYearCumulativeTotal) }
        : undefined,
      yearTarget !== undefined
        ? {
            key: 'yearTarget',
            label: strings.formatString(strings.X_TARGET, String(year)).toString(),
            percent: toBarPercent(yearTarget),
          }
        : undefined,
    ].filter((tick): tick is { key: string; label: string; percent: number } => tick !== undefined);
  }, [lifetimeSpan, previousYearCumulativeTotal, strings, toBarPercent, year, yearTarget]);

  if (lifetimeSpan <= 0) {
    return null;
  }

  const percentComplete = Math.round(toPercent(currentProgress));

  return (
    // the tick labels hang below the bar so they do not pull the row's centre off the bar itself
    <Box
      alignItems='center'
      columnGap={theme.spacing(1)}
      display='flex'
      marginTop={theme.spacing(2)}
      paddingBottom={ticks.length > 0 ? TICK_LABEL_HEIGHT : 0}
    >
      <Typography color={theme.palette.TwClrTxtSecondary} fontSize='12px' whiteSpace='nowrap'>
        {strings.LIFETIME}
      </Typography>

      <Typography fontSize='12px' fontWeight={600} whiteSpace='nowrap'>
        {`${percentComplete}%`}
      </Typography>

      <Box flexGrow={1} minWidth={0} position='relative'>
        <Box
          borderRadius='4px'
          height={`${BAR_HEIGHT}px`}
          overflow='hidden'
          position='relative'
          sx={{ backgroundColor: theme.palette.TwClrBaseGray100 }}
        >
          <Box
            sx={{
              backgroundColor: theme.palette.TwClrBaseGray300,
              height: '100%',
              width: `${toBarPercent(currentProgress)}%`,
            }}
          />
        </Box>

        {ticks.map((tick) => (
          <Box
            key={tick.key}
            sx={{
              backgroundColor: theme.palette.TwClrTxtSecondary,
              height: `${BAR_HEIGHT + TICK_OVERHANG * 2}px`,
              left: `${tick.percent}%`,
              position: 'absolute',
              top: `-${TICK_OVERHANG}px`,
              transform: 'translateX(-50%)',
              width: '1px',
            }}
          />
        ))}

        {ticks.map((tick) => (
          <Typography
            color={theme.palette.TwClrTxtSecondary}
            fontSize='10px'
            key={`label-${tick.key}`}
            position='absolute'
            sx={{ left: `${tick.percent}%`, top: '100%', transform: 'translateX(-50%)' }}
            whiteSpace='nowrap'
          >
            {tick.label}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

export default LifetimeProgressBar;
