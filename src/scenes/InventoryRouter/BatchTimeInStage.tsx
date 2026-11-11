import React, { type JSX, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
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
              label: strings.ACTIVE_GROWTH,
              backgroundColor: theme.palette.TwClrBaseGreen200 as string,
              color: theme.palette.TwClrTxt as string,
            },
            {
              key: 'hardeningOff',
              label: strings.HARDENING_OFF,
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
    ? strings.TIME_IN_STAGE_LESS_THAN_ONE_DAY
    : strings.formatString(days === 1 ? strings.TIME_IN_STAGE_DAYS_ONE : strings.TIME_IN_STAGE_DAYS, days).toString();

type StageSegmentProps = {
  stage: Stage;
  stageTime?: BatchStageTimePayload;
  isFirst: boolean;
  isLast: boolean;
};

const StageSegment = ({ stage, stageTime, isFirst, isLast }: StageSegmentProps): JSX.Element => {
  const theme = useTheme();
  const days = stageDays(stageTime);
  const hasDays = days !== undefined;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        // Segments with a value share the leftover width in proportion to their days; the rest stay
        // just wide enough for their text.
        flexGrow: hasDays ? days : 0,
        flexShrink: 0,
        flexBasis: 'auto',
        minWidth: 0,
      }}
    >
      <Typography
        sx={{
          color: theme.palette.TwClrTxtSecondary,
          fontSize: '14px',
          fontWeight: 500,
          marginBottom: theme.spacing(1),
          whiteSpace: 'nowrap',
        }}
      >
        {stage.label}
      </Typography>
      <Box
        sx={{
          alignItems: 'center',
          backgroundColor: stage.backgroundColor,
          borderBottomLeftRadius: isFirst ? '8px' : 0,
          borderBottomRightRadius: isLast ? '8px' : 0,
          borderTopLeftRadius: isFirst ? '8px' : 0,
          borderTopRightRadius: isLast ? '8px' : 0,
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
            {stageTime?.inProgress && <Box component='span'>{`${strings.TIME_IN_STAGE_SO_FAR}*`}</Box>}
          </>
        ) : (
          <>
            <Box component='span' fontWeight={600}>
              {stageTime?.cleared ? strings.TIME_IN_STAGE_NOT_AVAILABLE : '—'}
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

  const anyInProgress = stages.some((stage) => {
    const stageTime = timeInStage?.[stage.key];
    return stageTime?.inProgress === true && stageDays(stageTime) !== undefined;
  });

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.TwClrBg,
        borderRadius: '24px',
        marginBottom: theme.spacing(3),
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
        {strings.TIME_IN_STAGE_TITLE} <IconTooltip title={strings.TIME_IN_STAGE_TITLE_TOOLTIP} />
      </Typography>
      <Box sx={{ display: 'flex', overflowX: 'auto' }}>
        {stages.map((stage, index) => (
          <StageSegment
            key={stage.key}
            stage={stage}
            stageTime={timeInStage?.[stage.key]}
            isFirst={index === 0}
            isLast={index === stages.length - 1}
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
  );
};

export default BatchTimeInStage;
