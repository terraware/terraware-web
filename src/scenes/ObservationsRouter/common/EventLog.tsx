import React, { useEffect, useState } from 'react';

import { Box, Typography } from '@mui/material';
import { DateTime } from 'luxon';

import { useLocalization, useOrganization } from 'src/providers';
import {
  EventLogEntryPayload,
  ListEventLogEntriesRequestPayload,
  useListEventLogEntriesMutation,
} from 'src/queries/generated/events';
import { getDateTimeDisplayValue } from 'src/utils/dateFormatter';

type EventLogProps = {
  observationId: number;
  plotId: number;
};
const EventLog = ({ observationId, plotId }: EventLogProps) => {
  const { selectedOrganization } = useOrganization();
  const { strings } = useLocalization();

  const [list, listResult] = useListEventLogEntriesMutation();
  const [events, setEvents] = useState<EventLogEntryPayload[]>();

  useEffect(() => {
    if (listResult.isSuccess) {
      setEvents(listResult.data.events);
    }
  }, [listResult]);

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
      <Box display='grid' gap={'32px'} gridTemplateColumns='minmax(150px, 1fr) 3fr' justifyItems='start'>
        {events?.map((event, index) => {
          const dateModified = DateTime.fromMillis(new Date(event.timestamp).getTime()).toFormat('yyyy-MM-dd');
          return (
            <React.Fragment key={index}>
              <Box>
                <Typography>{dateModified}</Typography>
                <Typography>
                  {strings.BY} {event.userName}
                </Typography>
              </Box>
              <Box>{event.subject.fullText}</Box>
            </React.Fragment>
          );
        })}
      </Box>
    </Box>
  );
};

export default EventLog;
