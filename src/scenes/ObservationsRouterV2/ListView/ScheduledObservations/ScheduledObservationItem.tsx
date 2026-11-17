import React, { type JSX, type ReactNode, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { DateTime, Duration, Interval } from 'luxon';

import Link from 'src/components/common/Link';
import { useFeatureEnabled } from 'src/features';
import { useLocalization } from 'src/providers';
import { ObservationPayload } from 'src/queries/generated/observations';

import InlineRescheduleForm from './InlineRescheduleForm';

const URGENT_WITHIN_DAYS = 7;
const DAYS_BEFORE_MONTHS = 60;

type ObservationTag = {
  label: ReactNode;
  tone: 'inProgress' | 'neutral' | 'overdue' | 'urgent';
};

type ScheduledObservationItemProps = {
  canReschedule: boolean;
  isRescheduling: boolean;
  observation: ObservationPayload;
  onRescheduleEnd: () => void;
  onRescheduleStart: (observationId: number) => void;
  showSiteName: boolean;
};

const ScheduledObservationItem = ({
  canReschedule,
  isRescheduling,
  observation,
  onRescheduleEnd,
  onRescheduleStart,
  showSiteName,
}: ScheduledObservationItemProps): JSX.Element => {
  const { activeLocale, strings } = useLocalization();
  const theme = useTheme();
  const biomassSchedulingEnabled = useFeatureEnabled('Scheduled Biomass Monitoring Observations');

  const { dateRange, tag } = useMemo(() => {
    const locale = activeLocale || 'en-US';
    const today = DateTime.now().startOf('day').setLocale(locale);
    const start = DateTime.fromISO(observation.startDate).setLocale(locale);
    const end = DateTime.fromISO(observation.endDate).setLocale(locale);

    const daysOrMonths = (from: DateTime, to: DateTime): string => {
      const days = Math.max(Math.round(to.diff(from, 'days').days), 1);
      const duration =
        days < DAYS_BEFORE_MONTHS
          ? Duration.fromObject({ days })
          : Duration.fromObject({ months: Math.round(to.diff(from, 'months').months) });
      return duration.reconfigure({ locale }).toHuman();
    };

    const getTag = (): ObservationTag | undefined => {
      if (observation.state === 'InProgress') {
        return {
          label: end <= today ? strings.ENDS_TODAY : strings.formatString(strings.ENDS_IN_X, daysOrMonths(today, end)),
          tone: 'inProgress',
        };
      }
      if (observation.state === 'Overdue') {
        return { label: strings.formatString(strings.X_OVERDUE, daysOrMonths(end, today)), tone: 'overdue' };
      }

      const days = Math.round(start.diff(today, 'days').days);
      const label =
        days < 2
          ? start.toRelativeCalendar({ base: today, unit: 'days' })
          : start.toRelative({ base: today, unit: days < 14 ? 'days' : days < 60 ? 'weeks' : 'months' });
      return label ? { label, tone: days < URGENT_WITHIN_DAYS ? 'urgent' : 'neutral' } : undefined;
    };

    return {
      dateRange: Interval.fromDateTimes(start, end).toLocaleString(DateTime.DATE_MED),
      tag: getTag(),
    };
  }, [activeLocale, observation.endDate, observation.startDate, observation.state, strings]);

  const monitoringType = useMemo((): string => {
    const labels: Record<ObservationPayload['type'], string> = {
      'Baseline Survey': strings.BASELINE_SURVEY,
      'Biomass Measurements': strings.BIOMASS_MONITORING,
      Monitoring: strings.PLANT_MONITORING,
    };
    return labels[observation.type];
  }, [observation.type, strings]);

  const tagColors = useMemo(
    (): Record<ObservationTag['tone'], { backgroundColor?: string; color?: string }> => ({
      inProgress: { backgroundColor: theme.palette.TwClrBgSuccessTertiary, color: theme.palette.TwClrTxtSuccess },
      neutral: { backgroundColor: theme.palette.TwClrBgSecondary, color: theme.palette.TwClrTxtSecondary },
      overdue: { backgroundColor: theme.palette.TwClrBgDangerTertiary, color: theme.palette.TwClrTxtDanger },
      urgent: { backgroundColor: theme.palette.TwClrBaseOrange050, color: theme.palette.TwClrBaseOrange700 },
    }),
    [theme]
  );

  return (
    <Box>
      <Box sx={{ alignItems: 'flex-start', display: 'flex', gap: theme.spacing(1), justifyContent: 'space-between' }}>
        <Typography fontSize='16px' fontWeight={600} lineHeight='24px'>
          {showSiteName ? observation.plantingSiteName : dateRange}
        </Typography>
        {tag && (
          <Typography
            sx={{
              ...tagColors[tag.tone],
              borderRadius: '12px',
              flexShrink: 0,
              fontSize: '14px',
              fontWeight: 500,
              lineHeight: '20px',
              padding: theme.spacing(0.25, 1),
              whiteSpace: 'nowrap',
            }}
          >
            {tag.label}
          </Typography>
        )}
      </Box>
      {biomassSchedulingEnabled && (
        <Typography fontSize='14px' lineHeight='20px'>
          {monitoringType}
        </Typography>
      )}
      {isRescheduling && <InlineRescheduleForm observation={observation} onClose={onRescheduleEnd} />}
      {showSiteName && !isRescheduling && (
        <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px' lineHeight='20px'>
          {dateRange}
        </Typography>
      )}
      {canReschedule && !isRescheduling && (
        <Box marginTop={theme.spacing(0.5)}>
          <Link fontSize='14px' onClick={() => onRescheduleStart(observation.id)}>
            {strings.RESCHEDULE}
          </Link>
        </Box>
      )}
    </Box>
  );
};

export default ScheduledObservationItem;
