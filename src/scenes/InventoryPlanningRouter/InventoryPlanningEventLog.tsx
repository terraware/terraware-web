import React, { type JSX, useEffect } from 'react';

import { useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import EventLog from 'src/components/common/EventLog';
import { useLazyListInventoryPlanningEventsQuery } from 'src/queries/plantingSeasons/events';

type InventoryPlanningEventLogProps = {
  organizationId?: number;
  plantingSeasonId?: number;
  plantingSiteId?: number;
  speciesId?: number;
};

const InventoryPlanningEventLog = ({
  organizationId,
  plantingSeasonId,
  plantingSiteId,
  speciesId,
}: InventoryPlanningEventLogProps): JSX.Element | null => {
  const theme = useTheme();
  const [listInventoryPlanningEvents, { data: events, isLoading }] = useLazyListInventoryPlanningEventsQuery();

  useEffect(() => {
    if (organizationId !== undefined) {
      void listInventoryPlanningEvents({ organizationId, plantingSeasonId, plantingSiteId, speciesId }, true);
    }
  }, [listInventoryPlanningEvents, organizationId, plantingSeasonId, plantingSiteId, speciesId]);

  if (!events?.length) {
    return null;
  }

  return (
    <Card style={{ marginTop: theme.spacing(3) }} radius={theme.spacing(1)}>
      <EventLog events={events} isLoading={isLoading} />
    </Card>
  );
};

export default InventoryPlanningEventLog;
