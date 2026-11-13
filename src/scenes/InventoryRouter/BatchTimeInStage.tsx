import React, { type JSX, useMemo } from 'react';

import { Box, Grid, Tooltip, Typography, useTheme } from '@mui/material';
import { IconTooltip } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import { BatchStageTimePayload } from 'src/queries/generated/nurseryBatches';
import strings from 'src/strings';
import { Batch } from 'src/types/Batch';

const stageDays = (stageTime?: BatchStageTimePayload): number | undefined => {
  const days = stageTime?.days as number | null | undefined;
  return days === null ? undefined : days;
};

type Stage = {
  key: 'germinating' | 'activeGrowth' | 'hardeningOff' | 'ready';
  label: string;
  backgroundColor: string;
  color: string;
};

const useStages = (): Stage[] => {
  const theme = useTheme();
  const { activeLocale } = useLocalization();

  return useMemo(
    (): Stage[] =>
      activeLocale
        ? [
            {
              key: 'germinating',
              label: strings.GERMINATING,
              backgroundColor: theme.palette.TwClrBaseGreen050 as string,
              color: theme.palette.TwClrTxt as string,
            },
            {
              key: 'activeGrowth',
              label: strings.ACTIVE_GROWTH_SENTENCE_CASE,
              backgroundColor: theme.palette.TwClrBaseGreen200 as string,
              color: theme.palette.TwClrTxt as string,
            },
            {
              key: 'hardeningOff',
              label: strings.HARDENING_OFF_SENTENCE_CASE,
              backgroundColor: theme.palette.TwClrBaseGreen500 as string,
              color: theme.palette.TwClrTxtInverse as string,
            },
            {
              key: 'ready',
              label: strings.READY,
              backgroundColor: theme.palette.TwClrBaseGreen700 as string,
              color: theme.palette.TwClrTxtInverse as string,
            },
          ]
        : [],
    [activeLocale, theme]
  );
};

const daysLabel = (days: number): string =>
  days === 0
    ? strings.LESS_THAN_ONE_DAY
    : strings.formatString(days === 1 ? strings.X_DAY : strings.X_DAYS, days).toString();

/**
 * Seedlings the batch currently holds in a stage. The server derives its own count by replaying the
 * batch's quantity history, so it lands on these same numbers rather than reporting them separately.
 */
const stageQuantity = (batch: Batch, stage: Stage['key']): number => {
  switch (stage) {
    case 'germinating':
      return batch.germinatingQuantity;
    case 'activeGrowth':
      return batch.activeGrowthQuantity;
    case 'hardeningOff':
      return batch.hardeningOffQuantity;
    case 'ready':
      return batch.readyQuantity;
  }
};

/** Wraps its child in a tooltip only when there is a title; MUI renders one unconditionally. */
const TooltipWrapper = ({ title, children }: { title?: string; children: JSX.Element }): JSX.Element => {
  const theme = useTheme();

  if (!title) {
    return children;
  }

  return (
    <Tooltip
      arrow
      describeChild
      placement='top-start'
      slotProps={{
        arrow: { sx: { color: theme.palette.TwClrBaseGray800 } },
        tooltip: {
          sx: {
            backgroundColor: theme.palette.TwClrBaseGray800,
            color: theme.palette.TwClrBaseWhite,
            maxWidth: '464px',
            padding: '8px',
            whiteSpace: 'pre-line',
          },
        },
      }}
      title={title}
    >
      {children}
    </Tooltip>
  );
};

type StageSegmentProps = {
  stage: Stage;
  stageTime?: BatchStageTimePayload;
  fillEvenly: boolean;
  /** Seedlings the batch currently holds in this stage; the server's time-in-stage count matches it. */
  inStage: number;
};

const StageSegment = ({ stage, stageTime, fillEvenly, inStage }: StageSegmentProps): JSX.Element => {
  const theme = useTheme();
  const days = stageDays(stageTime);
  const hasDays = days !== undefined;
  const countedQuantity = stageTime?.countedQuantity ?? 0;

  // The counts explain the average, so they are only offered where there is an average to explain;
  // the other states carry a tooltip saying why they have none.
  const counts = hasDays
    ? [
        strings
          .formatString(
            countedQuantity === 1 ? strings.BASED_ON_X_SEEDLING : strings.BASED_ON_X_SEEDLINGS,
            countedQuantity
          )
          .toString(),
        strings.formatString(strings.X_STILL_IN_THIS_STAGE, inStage).toString(),
      ].join('\n')
    : undefined;

  const valueText = hasDays
    ? [daysLabel(days), stageTime?.inProgress ? strings.SO_FAR : undefined].filter(Boolean).join(' ')
    : stageTime?.cleared
      ? strings.NOT_AVAILABLE
      : '—';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        // Segments with a value share the leftover width in proportion to their days; the rest stay
        // just wide enough for their text.
        flexGrow: fillEvenly ? 1 : hasDays ? days : 0,
        flexShrink: 0,
        flexBasis: 'auto',
        minWidth: 0,
      }}
    >
      <Typography
        sx={{
          color: theme.palette.TwClrTxt,
          fontSize: '14px',
          fontWeight: 600,
          marginBottom: theme.spacing(1),
          whiteSpace: 'nowrap',
        }}
      >
        {stage.label}
      </Typography>
      <TooltipWrapper title={counts}>
        <Box
          aria-label={counts ? `${stage.label}: ${valueText}` : undefined}
          tabIndex={counts ? 0 : undefined}
          sx={{
            alignItems: 'center',
            backgroundColor: stage.backgroundColor,
            borderRadius: '8px',
            color: stage.color,
            display: 'flex',
            fontSize: '16px',
            gap: theme.spacing(0.5),
            minHeight: '56px',
            padding: theme.spacing(0, 2),
            whiteSpace: 'nowrap',
          }}
        >
          {hasDays ? (
            <>
              <Box component='span' fontWeight={600}>
                {daysLabel(days)}
              </Box>
              {stageTime?.inProgress && <Box component='span'>{`${strings.SO_FAR}*`}</Box>}
            </>
          ) : (
            <>
              <Box component='span' fontWeight={600}>
                {stageTime?.cleared ? strings.NOT_AVAILABLE : '—'}
              </Box>
              <IconTooltip
                title={
                  stageTime?.cleared
                    ? strings.TIME_IN_STAGE_NOT_AVAILABLE_TOOLTIP
                    : strings.TIME_IN_STAGE_NOT_APPLICABLE_TOOLTIP
                }
              />
            </>
          )}
        </Box>
      </TooltipWrapper>
    </Box>
  );
};

interface BatchTimeInStageProps {
  batch: Batch;
}

const BatchTimeInStage = ({ batch }: BatchTimeInStageProps): JSX.Element | null => {
  const theme = useTheme();
  const stages = useStages();
  const { timeInStage } = batch;

  // Legacy batches whose history can't be used have no timeInStage at all; there is nothing to show.
  const hasAnyValue = stages.some((stage) => {
    const stageTime = timeInStage?.[stage.key];
    return stageDays(stageTime) !== undefined || stageTime?.cleared === true;
  });

  if (!hasAnyValue) {
    return null;
  }

  const totalDays = stages.reduce((total, stage) => total + (stageDays(timeInStage?.[stage.key]) ?? 0), 0);

  const anyInProgress = stages.some((stage) => {
    const stageTime = timeInStage?.[stage.key];
    return stageTime?.inProgress === true && stageDays(stageTime) !== undefined;
  });

  return (
    <Grid size={12}>
      <Box
        sx={{
          backgroundColor: theme.palette.TwClrBg,
          borderRadius: '24px',
          padding: theme.spacing(3),
          width: '100%',
        }}
      >
        <Typography
          sx={{
            color: theme.palette.TwClrTxt,
            fontSize: '20px',
            fontWeight: 600,
            marginBottom: theme.spacing(2),
          }}
        >
          {strings.TIME_IN_STAGE_TITLE}{' '}
          <IconTooltip
            title={`${strings.TIME_IN_STAGE_TITLE_TOOLTIP}\n\n${strings.TIME_IN_STAGE_TITLE_TOOLTIP_COUNTING}`}
          />
        </Typography>
        <Box sx={{ display: 'flex', gap: theme.spacing(1), overflowX: 'auto' }}>
          {stages.map((stage) => (
            <StageSegment
              key={stage.key}
              stage={stage}
              stageTime={timeInStage?.[stage.key]}
              fillEvenly={totalDays === 0}
              inStage={stageQuantity(batch, stage.key)}
            />
          ))}
        </Box>
        {anyInProgress && (
          <Typography
            sx={{
              color: theme.palette.TwClrTxtSecondary,
              fontSize: '14px',
              fontWeight: 400,
              marginTop: theme.spacing(2),
            }}
          >
            {strings.TIME_IN_STAGE_IN_PROGRESS_FOOTNOTE}
          </Typography>
        )}
      </Box>
    </Grid>
  );
};

export default BatchTimeInStage;
