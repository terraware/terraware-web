import React, { type JSX, type ReactNode, useCallback, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';
import { DateTime } from 'luxon';

import { useLocalization } from 'src/providers';
import { EventLogEntryPayload } from 'src/queries/generated/events';

type EventLogProps = {
  /** Renders the event list expanded on mount instead of collapsed. */
  defaultExpanded?: boolean;
  /** Rendered in place of nothing when there are no events, e.g. for a standalone history tab. */
  emptyState?: ReactNode;
  events?: EventLogEntryPayload[];
  filterEvent?: (event: EventLogEntryPayload) => boolean;
  getUpdatedFieldLabel?: (event: EventLogEntryPayload) => ReactNode;
  /** Hides the "last modified" line and the expand/collapse toggle, leaving just the event list. */
  hideToggle?: boolean;
  isLoading?: boolean;
  renderEventDescription?: (event: EventLogEntryPayload) => ReactNode;
};

const EventLog = ({
  defaultExpanded,
  emptyState,
  events,
  filterEvent,
  getUpdatedFieldLabel,
  hideToggle,
  isLoading,
  renderEventDescription,
}: EventLogProps): JSX.Element | null => {
  const { strings } = useLocalization();
  const theme = useTheme();
  const [showEventLog, setShowEventLog] = useState(defaultExpanded ?? false);
  // Hiding the toggle removes the only way to expand, so that mode always shows the list.
  const eventsVisible = hideToggle || showEventLog;

  const lastEvent = useMemo(() => events?.[0], [events]);
  const filteredEvents = useMemo(() => (filterEvent ? events?.filter(filterEvent) : events), [events, filterEvent]);

  const toggleEventLog = useCallback(() => {
    setShowEventLog((prev) => !prev);
  }, []);

  const defaultRenderEventDescription = useCallback(
    (event: EventLogEntryPayload): ReactNode => {
      if (event.action.type === 'FieldUpdated') {
        return strings.formatString(
          strings.VALUE_CHANGED_FROM_TO,
          <Typography display='inline' textTransform='capitalize'>
            {getUpdatedFieldLabel?.(event) ?? event.subject.fullText}
          </Typography>,
          <Typography display='inline' color={theme.palette.TwClrTxtWarning} fontWeight={600}>
            {event.action.changedFrom?.toString() || strings.NONE}
          </Typography>,
          <Typography display='inline' color={theme.palette.TwClrTxtSuccess} fontWeight={600}>
            {event.action.changedTo?.toString() || strings.NONE}
          </Typography>
        );
      }
      if (event.action.type === 'Created') {
        if (
          event.subject.type === 'PlantingSeasonScheduledDateSpecies' ||
          event.subject.type === 'PlantingDateRequestSpecies'
        ) {
          return strings.formatString(strings.EVENT_ADDED, event.subject.fullText);
        }
        return strings.formatString(strings.EVENT_CREATED, event.subject.fullText);
      }
      if (event.action.type === 'Deleted') {
        return strings.formatString(strings.EVENT_DELETED, event.subject.fullText);
      }

      return null;
    },
    [getUpdatedFieldLabel, strings, theme.palette.TwClrTxtSuccess, theme.palette.TwClrTxtWarning]
  );

  if (!lastEvent) {
    return emptyState && !isLoading ? <Box>{emptyState}</Box> : null;
  }

  return (
    <Box>
      {!hideToggle && (
        <Box display='flex' alignItems='center'>
          <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrBaseBlack} marginRight='16px'>
            {strings.formatString(
              strings.LAST_MODIFIED_ON_BY,
              DateTime.fromMillis(new Date(lastEvent.timestamp).getTime()).toFormat('yyyy-MM-dd'),
              lastEvent.userName
            )}
          </Typography>
          <Button
            priority='ghost'
            label={strings.CHANGE_HISTORY}
            onClick={toggleEventLog}
            sx={{ fontWeight: '400 !important', '&:focus': { outline: 'none !important' } }}
            rightIcon={showEventLog ? 'chevronUp' : 'chevronDown'}
          />
        </Box>
      )}
      {eventsVisible && !isLoading && (
        <Box>
          {filteredEvents?.map((event, index) => {
            const dateModified = DateTime.fromMillis(new Date(event.timestamp).getTime()).toFormat('yyyy-MM-dd');
            return (
              <Box
                key={`${event.timestamp}-${event.subject.type}-${index}`}
                borderBottom={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
                display='flex'
                gap='24px'
                padding={2}
              >
                <Box sx={{ flexShrink: { xs: 1, sm: 0 } }}>
                  <Typography
                    color={theme.palette.TwClrTxtSecondary}
                    sx={{ whiteSpace: { xs: 'normal', sm: 'nowrap' } }}
                  >
                    {dateModified} {strings.BY} {event.userName}
                  </Typography>
                </Box>
                <Box flex={1}>{renderEventDescription?.(event) ?? defaultRenderEventDescription(event)}</Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default EventLog;
