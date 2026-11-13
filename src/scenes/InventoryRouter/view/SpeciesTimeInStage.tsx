import React, { type JSX, useMemo } from 'react';

import { Box, Grid, Tooltip, Typography, useTheme } from '@mui/material';
import { IconTooltip } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import { SpeciesStageTimePayload, SpeciesTimeInStagePayload } from 'src/queries/generated/nurserySummaries';
import strings from 'src/strings';

type Stage = {
  key: keyof SpeciesTimeInStagePayload;
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

const stageDays = (days?: number): number | undefined => (days === null ? undefined : days);

const daysLabel = (days: number): string =>
  days === 0
    ? strings.LESS_THAN_ONE_DAY
    : strings.formatString(days === 1 ? strings.X_DAY : strings.X_DAYS, days).toString();

const batchesLabel = (batchCount: number): string =>
  strings.formatString(batchCount === 1 ? strings.BASED_ON_X_BATCH : strings.BASED_ON_X_BATCHES, batchCount).toString();

const notEnoughDataReason = (batchCount: number): string => {
  const shortfall =
    batchCount === 0
      ? strings.SPECIES_TIME_IN_STAGE_NO_BATCHES
      : batchCount === 1
        ? strings.SPECIES_TIME_IN_STAGE_ONLY_ONE_BATCH
        : strings.formatString(strings.SPECIES_TIME_IN_STAGE_ONLY_X_BATCHES, batchCount).toString();

  return `${shortfall}\n${strings.SPECIES_TIME_IN_STAGE_MIN_BATCHES}`;
};

const SegmentTooltip = ({ title, children }: { title: string; children: JSX.Element }): JSX.Element => {
  const theme = useTheme();

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
  stageTime: SpeciesStageTimePayload;
};

const StageSegment = ({ stage, stageTime }: StageSegmentProps): JSX.Element => {
  const theme = useTheme();
  const days = stageDays(stageTime.days);
  const typicalMin = stageDays(stageTime.typicalMinDays);
  const typicalMax = stageDays(stageTime.typicalMaxDays);

  const hasQuartiles = typicalMin !== undefined && typicalMax !== undefined;

  const typicalRange =
    hasQuartiles && typicalMin !== typicalMax
      ? // A quartile of 0 means less than a day, the same as the average does.
        strings
          .formatString(
            typicalMin === 0 ? strings.TYPICAL_UNDER_ONE_TO_X_DAYS : strings.TYPICAL_X_TO_Y_DAYS,
            ...(typicalMin === 0 ? [typicalMax] : [typicalMin, typicalMax])
          )
          .toString()
      : undefined;

  const tooltip =
    days === undefined
      ? notEnoughDataReason(stageTime.batchCount)
      : hasQuartiles
        ? batchesLabel(stageTime.batchCount)
        : `${batchesLabel(stageTime.batchCount)}\n${strings.SPECIES_TIME_IN_STAGE_RANGE_PENDING}`;

  const valueText =
    days === undefined ? strings.NOT_ENOUGH_DATA : [daysLabel(days), typicalRange].filter(Boolean).join(' \u00b7 ');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, flexShrink: 0, flexBasis: 'auto' }}>
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
      <SegmentTooltip title={tooltip}>
        <Box
          aria-label={`${stage.label}: ${valueText}`}
          tabIndex={0}
          sx={{
            alignItems: 'center',
            backgroundColor: days === undefined ? theme.palette.TwClrBgSecondary : stage.backgroundColor,
            borderRadius: '8px',
            color: days === undefined ? theme.palette.TwClrTxtSecondary : stage.color,
            display: 'flex',
            fontSize: '16px',
            gap: theme.spacing(0.5),
            minHeight: '56px',
            padding: theme.spacing(0, 2),
            whiteSpace: 'nowrap',
          }}
        >
          {days === undefined ? (
            <Box component='span'>{strings.NOT_ENOUGH_DATA}</Box>
          ) : (
            <>
              <Box component='span' fontWeight={600}>
                {daysLabel(days)}
              </Box>
              {typicalRange && <Box component='span'>{`\u00b7 ${typicalRange}`}</Box>}
            </>
          )}
        </Box>
      </SegmentTooltip>
    </Box>
  );
};

interface SpeciesTimeInStageProps {
  averageTimeInStage: SpeciesTimeInStagePayload;
}

const SpeciesTimeInStage = ({ averageTimeInStage }: SpeciesTimeInStageProps): JSX.Element | null => {
  const theme = useTheme();
  const stages = useStages();

  if (!stages.length) {
    return null;
  }

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
          {strings.SPECIES_TIME_IN_STAGE_TITLE}{' '}
          <IconTooltip
            title={`${strings.SPECIES_TIME_IN_STAGE_TITLE_TOOLTIP}\n\n${strings.SPECIES_TIME_IN_STAGE_TITLE_TOOLTIP_RANGE}`}
          />
        </Typography>
        <Box sx={{ display: 'flex', gap: theme.spacing(1), overflowX: 'auto' }}>
          {stages.map((stage) => (
            <StageSegment key={stage.key} stage={stage} stageTime={averageTimeInStage[stage.key]} />
          ))}
        </Box>
      </Box>
    </Grid>
  );
};

export default SpeciesTimeInStage;
