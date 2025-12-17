import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';
import { DateTime } from 'luxon';

import { useLocalization, useOrganization } from 'src/providers';
import { ListObservationEventsArgs, useLazyListObservationEventsQuery } from 'src/queries/observations/observations';

type EventLogProps = {
  observationId: number;
  plotId: number;
  isBiomass?: boolean;
};
const EventLog = ({ observationId, plotId, isBiomass }: EventLogProps) => {
  const { selectedOrganization } = useOrganization();
  const { strings } = useLocalization();

  const [list, { data: events, isLoading }] = useLazyListObservationEventsQuery();
  const [showEventLog, setShowEventLog] = useState(true);

  const MangroveFields = useMemo(
    () => ['pH', 'salinity (ppt)', 'tide', 'tide measurement time', 'water depth (cm)'],
    []
  );

  const theme = useTheme();
  const lastEvent = useMemo(() => (events ? events[0] : undefined), [events]);
  const filteredEvents = useMemo(
    () =>
      events?.filter(
        (ev) =>
          !(
            ev.action.type === 'FieldUpdated' &&
            MangroveFields.includes(ev.action.fieldName) &&
            !ev.action.changedTo
          ) && !(ev.action.type === 'Created' && (ev.subject.type !== 'ObservationPlotMedia' || ev.subject.isOriginal))
      ),
    [MangroveFields, events]
  );

  useEffect(() => {
    const listEventLogPayload: ListObservationEventsArgs = {
      monitoringPlotId: plotId,
      observationId,
      isBiomass: !!isBiomass,
      organizationId: selectedOrganization?.id || -1,
    };

    if (selectedOrganization) {
      void list(listEventLogPayload);
    }
  }, [isBiomass, list, observationId, plotId, selectedOrganization]);

  const toggleEventLog = useCallback(() => {
    setShowEventLog((prev) => !prev);
  }, []);

  return (
    <Box>
      {lastEvent && (
        <Box display='flex' alignItems={'center'}>
          <Typography fontSize={'14px'} fontWeight={400} color={theme.palette.TwClrBaseBlack} marginRight={'16px'}>
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
            sx={{ fontWeight: '400 !important' }}
            rightIcon={showEventLog ? 'chevronUp' : 'chevronDown'}
          />
        </Box>
      )}
      {showEventLog && !isLoading && (
        <Box>
          {filteredEvents?.map((event, index) => {
            const dateModified = DateTime.fromMillis(new Date(event.timestamp).getTime()).toFormat('yyyy-MM-dd');
            return (
              <Box
                key={index}
                borderBottom={`1px solid ${theme.palette.TwClrBrdrSecondary}`}
                display='grid'
                gap={'32px'}
                gridTemplateColumns='minmax(150px, 1fr) 3fr'
                justifyItems='start'
                padding={2}
              >
                <Box>
                  <Typography color={theme.palette.TwClrTxtSecondary}>{dateModified}</Typography>
                  <Typography color={theme.palette.TwClrTxtSecondary}>
                    {strings.BY} {event.userName}
                  </Typography>
                </Box>
                <Box>
                  {event.action.type === 'FieldUpdated' && (
                    <Box>
                      {strings.formatString(
                        strings.VALUE_CHANGED_FROM_TO,
                        <Typography display={'inline'} textTransform={'capitalize'}>
                          {event.subject.type === 'ObservationPlotMedia'
                            ? `${event.subject.fileId} ${event.action.fieldName}`
                            : event.action.fieldName}
                        </Typography>,
                        <Typography display={'inline'} color={theme.palette.TwClrTxtWarning} fontWeight={600}>
                          {event.action.changedFrom?.toString() || strings.NONE}
                        </Typography>,
                        <Typography display={'inline'} color={theme.palette.TwClrTxtSuccess} fontWeight={600}>
                          {event.action.changedTo?.toString() || strings.NONE}
                        </Typography>
                      )}
                    </Box>
                  )}
                  {event.action.type === 'Created' && (
                    <Box>{strings.formatString(strings.EVENT_CREATED, event.subject.fullText)}</Box>
                  )}
                  {event.action.type === 'Deleted' && (
                    <Box>{strings.formatString(strings.EVENT_DELETED, event.subject.fullText)}</Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default EventLog;
