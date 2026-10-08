import React, { type JSX, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { DateTime, Interval } from 'luxon';

import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { ObservationPayload } from 'src/queries/generated/observations';

const URGENT_WITHIN_DAYS = 7;

type ScheduledObservationItemProps = {
  canReschedule: boolean;
  observation: ObservationPayload;
  showSiteName: boolean;
};

const ScheduledObservationItem = ({
  canReschedule,
  observation,
  showSiteName,
}: ScheduledObservationItemProps): JSX.Element => {
  const { activeLocale, strings } = useLocalization();
  const theme = useTheme();

  const { dateRange, daysUntilStart, timeUntilStart } = useMemo(() => {
    const locale = activeLocale || 'en-US';
    const today = DateTime.now().startOf('day').setLocale(locale);
    const start = DateTime.fromISO(observation.startDate).setLocale(locale);
    const end = DateTime.fromISO(observation.endDate).setLocale(locale);
    const days = Math.round(start.diff(today, 'days').days);

    return {
      dateRange: Interval.fromDateTimes(start, end).toLocaleString(DateTime.DATE_MED),
      daysUntilStart: days,
      timeUntilStart:
        days < 2
          ? start.toRelativeCalendar({ base: today, unit: 'days' })
          : start.toRelative({ base: today, unit: days < 14 ? 'days' : days < 60 ? 'weeks' : 'months' }),
    };
  }, [activeLocale, observation.endDate, observation.startDate]);

  const isUrgent = daysUntilStart < URGENT_WITHIN_DAYS;

  return (
    <Box>
      <Box sx={{ alignItems: 'flex-start', display: 'flex', gap: theme.spacing(1), justifyContent: 'space-between' }}>
        <Typography fontSize='16px' fontWeight={600} lineHeight='24px'>
          {showSiteName ? observation.plantingSiteName : dateRange}
        </Typography>
        {timeUntilStart && (
          <Typography
            sx={{
              backgroundColor: isUrgent ? theme.palette.TwClrBaseOrange050 : theme.palette.TwClrBgSecondary,
              borderRadius: '12px',
              color: isUrgent ? theme.palette.TwClrBaseOrange700 : theme.palette.TwClrTxtSecondary,
              flexShrink: 0,
              fontSize: '14px',
              fontWeight: 500,
              lineHeight: '20px',
              padding: theme.spacing(0.25, 1),
              whiteSpace: 'nowrap',
            }}
          >
            {timeUntilStart}
          </Typography>
        )}
      </Box>
      {showSiteName && (
        <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px' lineHeight='20px'>
          {dateRange}
        </Typography>
      )}
      {canReschedule && (
        <Box marginTop={theme.spacing(0.5)}>
          <Link
            fontSize='14px'
            to={APP_PATHS.RESCHEDULE_OBSERVATION.replace(':observationId', observation.id.toString())}
          >
            {strings.RESCHEDULE}
          </Link>
        </Box>
      )}
    </Box>
  );
};

export default ScheduledObservationItem;
