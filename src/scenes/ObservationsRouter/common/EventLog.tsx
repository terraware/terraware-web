import React, { useEffect, useState } from 'react';

import { Box } from '@mui/material';

import { useLocalization, useOrganization } from 'src/providers';
import {
  EventLogEntryPayload,
  ListEventLogEntriesRequestPayload,
  useListEventLogEntriesMutation,
} from 'src/queries/generated/events';

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
      <Box display='grid' gap={2} gridTemplateColumns='repeat(2, 1fr)' justifyItems='start'>
        {events?.map((event) => {
          return (
            <>
              <Box>
                {event.timestamp}
                {strings.BY}
                {event.userName}
              </Box>
              <Box>{event.subject.fullText}</Box>
            </>
          );
        })}
      </Box>
    </Box>
  );
};

export default EventLog;
