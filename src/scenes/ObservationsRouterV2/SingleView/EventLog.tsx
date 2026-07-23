import React, { useCallback, useEffect, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import EventLogView from 'src/components/common/EventLog';
import { useOrganizationSpecies } from 'src/hooks/useOrganizationSpecies';
import { useLocalization, useOrganization } from 'src/providers';
import { EventLogEntryPayload } from 'src/queries/generated/events';
import { ListObservationEventsArgs, useLazyListObservationEventsQuery } from 'src/queries/observations/observations';

type EventLogProps = {
  observationId: number;
  plotId: number;
  isBiomass?: boolean;
};
const EventLog = ({ observationId, plotId, isBiomass }: EventLogProps) => {
  const { selectedOrganization } = useOrganization();
  const { strings } = useLocalization();
  const { species } = useOrganizationSpecies();

  const [list, { data: events, isLoading }] = useLazyListObservationEventsQuery();

  const MangroveFields = useMemo(
    () => ['pH', 'salinity (ppt)', 'tide', 'tide measurement time', 'water depth (cm)'],
    []
  );

  const theme = useTheme();
  const getSpeciesName = useCallback(
    (speciesId?: number) => {
      if (speciesId) {
        const found = species.find((sp) => sp.id.toString() === speciesId.toString());
        return found?.scientificName || '';
      }
    },
    [species]
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

  const filterEvent = useCallback(
    (event: EventLogEntryPayload) =>
      !(
        event.action.type === 'FieldUpdated' &&
        MangroveFields.includes(event.action.fieldName) &&
        !event.action.changedTo
      ) &&
      !(event.action.type === 'Created' && (event.subject.type !== 'ObservationPlotMedia' || event.subject.isOriginal)),
    [MangroveFields]
  );

  const renderEventDescription = useCallback(
    (event: EventLogEntryPayload) => (
      <Box>
        {event.action.type === 'FieldUpdated' && (
          <Box>
            {event.subject.type === 'BiomassSpecies' ||
            event.subject.type === 'BiomassQuadratSpecies' ||
            event.subject.type === 'MonitoringSpecies'
              ? strings.formatString(
                  strings.SPECIES_VALUE_CHANGED_FROM_TO,
                  <Typography display='inline' textTransform='capitalize'>
                    {event.subject.scientificName || getSpeciesName(event.subject.speciesId)}
                  </Typography>,
                  <Typography display='inline' textTransform='capitalize'>
                    {event.action.fieldName}
                  </Typography>,
                  <Typography display='inline' color={theme.palette.TwClrTxtWarning} fontWeight={600}>
                    {event.action.changedFrom?.toString() || strings.NONE}
                  </Typography>,
                  <Typography display='inline' color={theme.palette.TwClrTxtSuccess} fontWeight={600}>
                    {event.action.changedTo?.toString() || strings.NONE}
                  </Typography>
                )
              : strings.formatString(
                  strings.VALUE_CHANGED_FROM_TO,
                  <Typography display='inline' textTransform='capitalize'>
                    {event.subject.type === 'ObservationPlotMedia'
                      ? `${event.subject.fileId} ${event.subject.mediaKind} ${event.action.fieldName}`
                      : event.action.fieldName}
                  </Typography>,
                  <Typography display='inline' color={theme.palette.TwClrTxtWarning} fontWeight={600}>
                    {event.action.changedFrom?.toString() || strings.NONE}
                  </Typography>,
                  <Typography display='inline' color={theme.palette.TwClrTxtSuccess} fontWeight={600}>
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
    ),
    [getSpeciesName, strings, theme.palette.TwClrTxtSuccess, theme.palette.TwClrTxtWarning]
  );

  return (
    <EventLogView
      events={events}
      filterEvent={filterEvent}
      isLoading={isLoading}
      renderEventDescription={renderEventDescription}
    />
  );
};

export default EventLog;
