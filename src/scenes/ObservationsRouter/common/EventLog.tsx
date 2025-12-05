import React, { useEffect, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { DateTime } from 'luxon';

import { useLocalization, useOrganization } from 'src/providers';
import { ListEventLogEntriesRequestPayload, useListEventLogEntriesMutation } from 'src/queries/generated/events';

type EventLogProps = {
  observationId: number;
  plotId: number;
};
const EventLog = ({ observationId, plotId }: EventLogProps) => {
  const { selectedOrganization } = useOrganization();
  const { strings } = useLocalization();

  const [list, listResult] = useListEventLogEntriesMutation();

  const theme = useTheme();

  const events = useMemo(() => (listResult.isSuccess ? listResult.data.events : undefined), [listResult]);

  useEffect(() => {
    const listEventLogPayload: ListEventLogEntriesRequestPayload = {
      monitoringPlotId: plotId,
      observationId,
      subjects: ['ObservationPlot', 'ObservationPlotMedia'],
      organizationId: selectedOrganization?.id || -1,
    };

    if (selectedOrganization) {
      void list(listEventLogPayload);
    }
  }, [list, observationId, plotId, selectedOrganization]);

  return (
    <Box>
      <Box>
        {events?.map((event, index) => {
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
                      event.action.fieldName,
                      event.action.changedFrom?.toString() || '',
                      event.action.changedTo?.toString() || ''
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
    </Box>
  );
};

export default EventLog;
