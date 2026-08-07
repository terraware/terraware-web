import React, { type JSX, useCallback, useMemo, useState } from 'react';

import { Box, Collapse, IconButton, Link, Tooltip, Typography, useTheme } from '@mui/material';
import { Badge, Icon, IconTooltip } from '@terraware/web-components';

import LifetimeProgressBar from 'src/components/AcceleratorReports/LifetimeProgressBar';
import MetricStatusBadge from 'src/components/AcceleratorReports/MetricStatusBadge';
import { useLocalization } from 'src/providers';
import { MetricStatus } from 'src/types/AcceleratorReport';
import { formatPrecision } from 'src/utils/numbers';

const TITLE_COLUMN_WIDTH = 300;
const BAR_HEIGHT = 12;
const TICK_OVERHANG = 3;
const MIN_TARGET_PERCENT = 50;
const TICK_HOVER_WIDTH = 9;

export type ProgressIndicator = {
  baseline?: number;
  classId: 'Cumulative' | 'Level';
  endOfProjectTarget?: number;
  description?: string;
  currentYearProgress?: { quarter: string; value: number }[];
  name: string;
  precision?: number;
  previousYearCumulativeTotal?: number;
  progressNotes?: string;
  projectsComments?: string;
  refId: string;
  status?: MetricStatus;
  supportingDocumentUrl?: string;
  target?: number;
  unit?: string;
  value?: number;
};

export type IndicatorProgressRowProps = {
  indicator: ProgressIndicator;
  quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  year?: number;
};

const IndicatorProgressRow = ({ indicator, quarter, year }: IndicatorProgressRowProps): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const [expanded, setExpanded] = useState(false);

  const isCumulative = indicator.classId === 'Cumulative';
  const precision = indicator.precision ?? 0;
  const baselineValue = indicator.baseline ?? 0;

  const startingTotal = indicator.previousYearCumulativeTotal ?? baselineValue;

  const startingTotalLabel =
    indicator.previousYearCumulativeTotal !== undefined && year !== undefined ? String(year - 1) : strings.BASELINE;

  const currentYearProgress = useMemo(() => indicator.currentYearProgress ?? [], [indicator.currentYearProgress]);

  const cumulativeValue = useMemo(() => {
    if (!isCumulative) {
      return indicator.value;
    }

    return currentYearProgress.reduce((total, progress) => total + progress.value, startingTotal);
  }, [currentYearProgress, indicator.value, isCumulative, startingTotal]);

  const quarterlyValue = useMemo(
    () => (isCumulative ? currentYearProgress.find((progress) => progress.quarter === quarter)?.value : undefined),
    [currentYearProgress, isCumulative, quarter]
  );

  // Caps the target mark at the halfway line for visibility
  const { segments, targetPercent } = useMemo(() => {
    const barMin = isCumulative ? startingTotal : 0;
    const total = cumulativeValue ?? 0;
    const target = indicator.target;
    const barMax = Math.max(total, target ?? 0, barMin);
    const range = barMax - barMin;

    const anchorPercent =
      target !== undefined && range > 0 ? Math.max(MIN_TARGET_PERCENT, ((target - barMin) / range) * 100) : undefined;

    const toPercent = (value: number) => {
      if (range <= 0) {
        return 0;
      }

      if (anchorPercent === undefined || target === undefined) {
        return ((value - barMin) / range) * 100;
      }

      if (value <= target) {
        const belowTarget = target - barMin;
        return belowTarget > 0 ? ((value - barMin) / belowTarget) * anchorPercent : 0;
      }

      const aboveTarget = barMax - target;
      return aboveTarget > 0 ? anchorPercent + ((value - target) / aboveTarget) * (100 - anchorPercent) : anchorPercent;
    };

    let runningTotal = barMin;
    const barSegments =
      isCumulative && currentYearProgress.length > 0
        ? currentYearProgress.map((progress) => {
            const startPercent = toPercent(runningTotal);
            runningTotal += progress.value;

            return {
              key: progress.quarter,
              quarter: progress.quarter,
              startPercent,
              widthPercent: toPercent(runningTotal) - startPercent,
            };
          })
        : [{ key: 'total', quarter: undefined, startPercent: 0, widthPercent: toPercent(total) }];

    return { segments: barSegments, targetPercent: anchorPercent };
  }, [cumulativeValue, currentYearProgress, indicator.target, isCumulative, startingTotal]);

  const fillColor =
    indicator.status === 'Unlikely'
      ? theme.palette.TwClrTxtDanger
      : indicator.status === 'Off-Track'
        ? theme.palette.TwClrTxtWarning
        : theme.palette.TwClrBgBrand;

  const statusColor =
    indicator.status === 'Unlikely'
      ? theme.palette.TwClrTxtDanger
      : indicator.status === 'Off-Track'
        ? theme.palette.TwClrTxtWarning
        : indicator.status === undefined
          ? theme.palette.TwClrTxtBrand
          : theme.palette.TwClrTxtSuccess;

  const targetPercentComplete = useMemo(() => {
    const target = indicator.target;

    if (target === undefined || target <= 0) {
      return undefined;
    }

    const denominator = target - baselineValue;

    if (denominator <= 0) {
      return undefined;
    }

    return Math.round((((cumulativeValue ?? 0) - baselineValue) / denominator) * 100);
  }, [baselineValue, cumulativeValue, indicator.target]);

  const onToggle = useCallback(() => setExpanded((previous) => !previous), []);

  const unitSuffix = indicator.unit ? (
    <Typography component='span' color={theme.palette.TwClrTxtSecondary} fontSize='14px' fontWeight={400}>
      {` ${indicator.unit}`}
    </Typography>
  ) : null;

  return (
    <Box borderTop={`1px solid ${theme.palette.TwClrBgTertiary}`} padding={theme.spacing(2, 0)}>
      <Box display='flex'>
        <Box flexShrink={0} paddingRight={theme.spacing(2)} width={`${TITLE_COLUMN_WIDTH}px`}>
          <Box alignItems='center' display='flex'>
            <Typography fontSize='14px' fontWeight={600} lineHeight='20px'>
              {indicator.name}
            </Typography>

            {indicator.description && <IconTooltip title={indicator.description} />}
          </Box>

          <Box columnGap={theme.spacing(1)} display='flex' flexWrap='wrap' marginTop={theme.spacing(1)} rowGap={1}>
            {indicator.status && <MetricStatusBadge status={indicator.status} />}

            <Badge
              backgroundColor={theme.palette.TwClrBgSecondary}
              borderColor={theme.palette.TwClrBaseGray300}
              label={isCumulative ? strings.CUMULATIVE : strings.LEVEL}
              labelColor={theme.palette.TwClrTxtSecondary}
            />
          </Box>
        </Box>

        <Box flexGrow={1} minWidth={0}>
          <Box marginBottom={theme.spacing(1)} position='relative'>
            <Box alignItems='baseline' columnGap={theme.spacing(1)} display='flex'>
              <Typography fontSize='20px' fontWeight={600} lineHeight='28px'>
                {cumulativeValue !== undefined ? formatPrecision(cumulativeValue, precision) : '--'}
                {cumulativeValue !== undefined && unitSuffix}
              </Typography>

              {quarterlyValue !== undefined && (
                <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px'>
                  {strings.formatString(
                    strings.X_THIS_QUARTER,
                    `+${formatPrecision(quarterlyValue, precision)}${indicator.unit ? ` ${indicator.unit}` : ''}`
                  )}
                </Typography>
              )}
            </Box>

            <Typography
              color={theme.palette.TwClrTxtSecondary}
              fontSize='14px'
              position='absolute'
              sx={
                targetPercent !== undefined
                  ? { left: `${targetPercent}%`, transform: 'translateX(-100%)' }
                  : { right: 0 }
              }
              top={0}
              whiteSpace='nowrap'
            >
              {indicator.target !== undefined && (
                <>
                  {`${isCumulative ? strings.CUMULATIVE_TARGET : strings.TARGET} `}
                  <Typography component='span' fontSize='14px' fontWeight={600}>
                    {formatPrecision(indicator.target, precision)}
                  </Typography>
                  {unitSuffix}
                </>
              )}
            </Typography>
          </Box>

          {indicator.target === undefined ? (
            <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px' fontStyle='italic'>
              {strings.NO_TARGET_SET}
            </Typography>
          ) : (
            <Box position='relative'>
              <Box
                borderRadius='4px'
                height={`${BAR_HEIGHT}px`}
                overflow='hidden'
                position='relative'
                sx={{ backgroundColor: theme.palette.TwClrBaseGray100 }}
              >
                {segments.map((segment) => (
                  <Box
                    key={segment.key}
                    sx={{
                      backgroundColor: fillColor,
                      height: '100%',
                      left: `${segment.startPercent}%`,
                      position: 'absolute',
                      width: `${segment.widthPercent}%`,
                    }}
                  />
                ))}
              </Box>

              {segments.map((segment) => (
                <Tooltip key={`tick-${segment.key}`} title={segment.quarter ?? ''}>
                  <Box
                    sx={{
                      display: 'flex',
                      height: `${BAR_HEIGHT}px`,
                      justifyContent: 'center',
                      left: `${segment.startPercent + segment.widthPercent}%`,
                      position: 'absolute',
                      top: 0,
                      transform: 'translateX(-50%)',
                      width: `${TICK_HOVER_WIDTH}px`,
                    }}
                  >
                    <Box sx={{ backgroundColor: theme.palette.TwClrBaseWhite, height: '100%', width: '1px' }} />
                  </Box>
                </Tooltip>
              ))}

              {isCumulative && (
                <Tooltip title={startingTotalLabel}>
                  <Box
                    sx={{
                      display: 'flex',
                      height: `${BAR_HEIGHT + TICK_OVERHANG * 2}px`,
                      left: 0,
                      position: 'absolute',
                      top: `-${TICK_OVERHANG}px`,
                      width: `${TICK_HOVER_WIDTH}px`,
                    }}
                  >
                    <Box sx={{ backgroundColor: theme.palette.TwClrBaseBlack, height: '100%', width: '2px' }} />
                  </Box>
                </Tooltip>
              )}

              {targetPercent !== undefined && (
                <Box
                  sx={{
                    backgroundColor: theme.palette.TwClrBaseBlack,
                    height: `${BAR_HEIGHT + TICK_OVERHANG * 2}px`,
                    left: `${targetPercent}%`,
                    position: 'absolute',
                    top: `-${TICK_OVERHANG}px`,
                    transform: 'translateX(-50%)',
                    width: '2px',
                  }}
                />
              )}
            </Box>
          )}

          {targetPercentComplete !== undefined && (
            <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px' marginTop={theme.spacing(1)}>
              {strings.formatString(
                isCumulative ? strings.X_OF_YEAR_CUMULATIVE_TARGET : strings.X_OF_YEAR_TARGET,
                <Typography component='span' color={statusColor} fontSize='14px' fontWeight={600} key='percent'>
                  {`${targetPercentComplete}%`}
                </Typography>
              )}
            </Typography>
          )}

          {isCumulative && (
            <LifetimeProgressBar
              baseline={indicator.baseline}
              currentProgress={cumulativeValue ?? 0}
              endOfProjectTarget={indicator.endOfProjectTarget}
              previousYearCumulativeTotal={indicator.previousYearCumulativeTotal}
              year={year}
              yearTarget={indicator.target}
            />
          )}
        </Box>

        <Box flexShrink={0} paddingLeft={theme.spacing(1)} width={theme.spacing(5)}>
          <IconButton onClick={onToggle} size='small'>
            <Icon name={expanded ? 'chevronUp' : 'chevronDown'} />
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box display='flex' flexWrap='wrap' gap={theme.spacing(3)} paddingTop={theme.spacing(2)}>
          <Box flex='1 1 45%' minWidth={0}>
            <Typography fontSize='14px' fontWeight={600}>
              {strings.PROJECTS_COMMENTS}
            </Typography>

            {indicator.projectsComments ? (
              <Typography fontSize='14px'>{indicator.projectsComments}</Typography>
            ) : (
              <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px' fontStyle='italic'>
                {strings.NO_COMMENTS_ADDED}
              </Typography>
            )}
          </Box>

          <Box flex='1 1 45%' minWidth={0}>
            <Typography fontSize='14px' fontWeight={600}>
              {strings.PROGRESS_NOTES}
            </Typography>

            {indicator.progressNotes ? (
              <Typography fontSize='14px'>{indicator.progressNotes}</Typography>
            ) : (
              <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px' fontStyle='italic'>
                {strings.NO_NOTES_ADDED}
              </Typography>
            )}
          </Box>

          <Box flexBasis='100%'>
            <Typography fontSize='14px' fontWeight={600}>
              {strings.LINK_TO_SUPPORTING_DOCUMENTS}
            </Typography>

            {indicator.supportingDocumentUrl ? (
              <Link href={indicator.supportingDocumentUrl} rel='noopener noreferrer' target='_blank'>
                <Typography fontSize='14px'>{strings.VIEW_DOCUMENTS}</Typography>
              </Link>
            ) : (
              <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px' fontStyle='italic'>
                {strings.NO_LINK_ADDED}
              </Typography>
            )}
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};

export default IndicatorProgressRow;
