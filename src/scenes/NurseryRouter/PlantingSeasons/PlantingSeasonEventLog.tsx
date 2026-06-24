import React, { type JSX, useCallback, useEffect } from 'react';

import { useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import EventLog from 'src/components/common/EventLog';
import { useOrganization } from 'src/providers';
import { EventLogEntryPayload } from 'src/queries/generated/events';
import { useLazyListPlantingSeasonEventsQuery } from 'src/queries/plantingSeasons/events';

type PlantingSeasonEventLogProps = {
  plantingSeasonId: number;
};

const PlantingSeasonEventLog = ({ plantingSeasonId }: PlantingSeasonEventLogProps): JSX.Element | null => {
  const theme = useTheme();
  const { selectedOrganization } = useOrganization();
  const [listPlantingSeasonEvents, { data: events, isLoading }] = useLazyListPlantingSeasonEventsQuery();
  const organizationId = selectedOrganization?.id;

  useEffect(() => {
    if (organizationId !== undefined) {
      void listPlantingSeasonEvents({ organizationId, plantingSeasonId }, true);
    }
  }, [listPlantingSeasonEvents, organizationId, plantingSeasonId]);

  const getUpdatedFieldLabel = useCallback((event: EventLogEntryPayload) => {
    if (event.subject.type === 'PlantingSeason' && event.action.type === 'FieldUpdated') {
      return `${event.subject.fullText} ${event.action.fieldName}`;
    }

    return event.subject.fullText;
  }, []);

  if (!events?.length) {
    return null;
  }

  return (
    <Card flushMobile radius={theme.spacing(1)}>
      <EventLog events={events} getUpdatedFieldLabel={getUpdatedFieldLabel} isLoading={isLoading} />
    </Card>
  );
};

export default PlantingSeasonEventLog;
