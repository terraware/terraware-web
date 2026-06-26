import React, { type JSX, type ReactNode, useCallback, useEffect } from 'react';

import { Typography, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import EventLog from 'src/components/common/EventLog';
import { useLocalization, useOrganization } from 'src/providers';
import { type EventLogEntryPayload } from 'src/queries/generated/events';
import { useLazyListPlantingSeasonEventsQuery } from 'src/queries/plantingSeasons/events';
import { getMediumDate } from 'src/utils/dateFormatter';

type PlantingSeasonEventLogProps = {
  plantingSeasonId: number;
};

const PlantingSeasonEventLog = ({ plantingSeasonId }: PlantingSeasonEventLogProps): JSX.Element | null => {
  const theme = useTheme();
  const { activeLocale, strings } = useLocalization();
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

  const renderChangedFrom = useCallback(
    (value?: string[]): JSX.Element => (
      <Typography display='inline' color={theme.palette.TwClrTxtWarning} fontWeight={600}>
        {value?.[0] || strings.NONE}
      </Typography>
    ),
    [strings.NONE, theme.palette.TwClrTxtWarning]
  );

  const renderChangedTo = useCallback(
    (value?: string[]): JSX.Element => (
      <Typography display='inline' color={theme.palette.TwClrTxtSuccess} fontWeight={600}>
        {value?.[0] || strings.NONE}
      </Typography>
    ),
    [strings.NONE, theme.palette.TwClrTxtSuccess]
  );

  const renderEventDescription = useCallback(
    (event: EventLogEntryPayload): ReactNode => {
      const eventDate = getMediumDate(event.timestamp, activeLocale);

      if (event.subject.type === 'PlantingDateRequest' && event.action.type === 'Created') {
        return strings.formatString(strings.PLANTING_DATE_ADDED, eventDate);
      }

      if (event.subject.type === 'PlantingSeasonScheduledDate') {
        if (event.action.type === 'Created') {
          return strings.formatString(strings.PLANTING_DATE_ADDED, eventDate);
        }

        if (event.action.type === 'Deleted') {
          return strings.formatString(strings.PLANTING_DATE_DELETED, eventDate);
        }
      }

      if (event.subject.type === 'PlantingSeasonScheduledDateSpecies' && event.action.type === 'FieldUpdated') {
        return strings.formatString(
          strings.PLANTING_DATE_SPECIES_UPDATED,
          <>{event.subject.scientificName ?? event.subject.shortText}</>,
          <>{event.subject.substratumName}</>,
          renderChangedFrom(event.action.changedFrom),
          renderChangedTo(event.action.changedTo)
        );
      }

      if (event.subject.type === 'PlantingSeasonSpeciesTarget') {
        const speciesName = event.subject.scientificName ?? event.subject.shortText;

        if (event.action.type === 'FieldUpdated') {
          return strings.formatString(
            strings.SPECIES_TARGET_UPDATED,
            <>{speciesName}</>,
            <>{event.subject.substratumName}</>,
            renderChangedFrom(event.action.changedFrom),
            renderChangedTo(event.action.changedTo)
          );
        }

        if (event.action.type === 'Deleted') {
          return strings.formatString(strings.SPECIES_TARGET_DELETED, speciesName, event.subject.substratumName);
        }

        if (event.action.type === 'Created') {
          return strings.formatString(strings.SPECIES_TARGET_ADDED, speciesName, event.subject.substratumName);
        }
      }

      return null;
    },
    [activeLocale, renderChangedFrom, renderChangedTo, strings]
  );

  if (!events?.length) {
    return null;
  }

  return (
    <Card flushMobile radius={theme.spacing(1)}>
      <EventLog
        events={events}
        getUpdatedFieldLabel={getUpdatedFieldLabel}
        isLoading={isLoading}
        renderEventDescription={renderEventDescription}
      />
    </Card>
  );
};

export default PlantingSeasonEventLog;
