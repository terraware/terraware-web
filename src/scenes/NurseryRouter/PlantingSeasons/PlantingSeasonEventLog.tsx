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

const normalizeFieldName = (fieldName: string): string => fieldName.replace(/\s+/g, '').toLowerCase();

const isPlantingSeasonDateField = (fieldName: string): boolean => {
  const normalizedFieldName = normalizeFieldName(fieldName);

  return normalizedFieldName === 'enddate' || normalizedFieldName === 'startdate';
};

const getActionChangedTo = (event: EventLogEntryPayload, fallback?: string[]): string[] | undefined =>
  'changedTo' in event.action ? event.action.changedTo : fallback;

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

  const getPlantingSeasonFieldLabel = useCallback(
    (fieldName: string): string => {
      switch (normalizeFieldName(fieldName)) {
        case 'enddate':
          return strings.PLANTING_SEASON_FIELD_END_DATE;
        case 'name':
          return strings.PLANTING_SEASON_FIELD_NAME;
        case 'startdate':
          return strings.PLANTING_SEASON_FIELD_START_DATE;
        default:
          return fieldName;
      }
    },
    [strings]
  );

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

  const formatPlantingSeasonChangedValue = useCallback(
    (fieldName: string, values?: string[]): string[] | undefined => {
      if (!isPlantingSeasonDateField(fieldName)) {
        return values;
      }

      return values?.map((value) =>
        /^\d{4}-\d{2}-\d{2}/.test(value) && !Number.isNaN(new Date(value).getTime())
          ? getMediumDate(value, activeLocale)
          : value
      );
    },
    [activeLocale]
  );

  const renderPlantingSeasonEventDescription = useCallback(
    (event: EventLogEntryPayload): ReactNode => {
      if (event.subject.type !== 'PlantingSeason') {
        return null;
      }

      if (event.action.type === 'Created') {
        return strings.PLANTING_SEASON_EVENT_CREATED;
      }

      if (
        event.action.type === 'Deleted' ||
        (event.action.type === 'FieldUpdated' &&
          normalizeFieldName(event.action.fieldName) === 'status' &&
          event.action.changedTo?.[0] === 'Closed')
      ) {
        return strings.PLANTING_SEASON_EVENT_CLOSED;
      }

      if (event.action.type === 'FieldUpdated') {
        return strings.formatString<string | JSX.Element>(
          strings.PLANTING_SEASON_EVENT_FIELD_CHANGED,
          getPlantingSeasonFieldLabel(event.action.fieldName),
          renderChangedFrom(formatPlantingSeasonChangedValue(event.action.fieldName, event.action.changedFrom)),
          renderChangedTo(formatPlantingSeasonChangedValue(event.action.fieldName, event.action.changedTo))
        );
      }

      return null;
    },
    [formatPlantingSeasonChangedValue, getPlantingSeasonFieldLabel, renderChangedFrom, renderChangedTo, strings]
  );

  const renderEventDescription = useCallback(
    (event: EventLogEntryPayload): ReactNode => {
      const plantingSeasonEventDescription = renderPlantingSeasonEventDescription(event);

      if (plantingSeasonEventDescription) {
        return plantingSeasonEventDescription;
      }

      const eventDate = getMediumDate(event.timestamp, activeLocale);

      if (event.subject.type === 'PlantingDateRequest' && event.action.type === 'Created') {
        return strings.formatString(strings.PLANTING_DATE_ADDED, eventDate);
      }

      if (event.subject.type === 'PlantingDateRequestSpecies' && event.action.type === 'Created') {
        const scheduledDate = getMediumDate(event.timestamp, activeLocale);

        return strings.formatString(
          strings.PLANTING_DATE_SPECIES_ADDED,
          scheduledDate,
          event.subject.scientificName ?? event.subject.shortText,
          event.subject.substratumName
        );
      }

      if (event.subject.type === 'PlantingSeasonScheduledDate') {
        if (event.action.type === 'Created') {
          return strings.formatString(strings.PLANTING_DATE_ADDED, eventDate);
        }

        if (event.action.type === 'Deleted') {
          return strings.formatString(strings.PLANTING_DATE_DELETED, eventDate);
        }
      }

      if (event.subject.type === 'PlantingSeasonScheduledDateSpecies') {
        const scheduledDate = getMediumDate(event.subject.activeDate, activeLocale);
        const speciesName = event.subject.scientificName ?? event.subject.shortText;

        if (event.action.type === 'FieldUpdated') {
          return strings.formatString<string | JSX.Element>(
            strings.PLANTING_DATE_SPECIES_UPDATED,
            scheduledDate,
            speciesName,
            event.subject.substratumName,
            renderChangedFrom(event.action.changedFrom),
            renderChangedTo(event.action.changedTo)
          );
        }

        if (event.action.type === 'Created') {
          return strings.formatString<string | JSX.Element>(
            strings.PLANTING_DATE_SPECIES_ADDED_WITH_QUANTITY,
            scheduledDate,
            speciesName,
            event.subject.substratumName,
            renderChangedTo(getActionChangedTo(event))
          );
        }
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
    [activeLocale, renderChangedFrom, renderChangedTo, renderPlantingSeasonEventDescription, strings]
  );

  if (!events?.length) {
    return null;
  }

  return (
    <Card flushMobile radius={theme.spacing(1)}>
      <EventLog events={events} isLoading={isLoading} renderEventDescription={renderEventDescription} />
    </Card>
  );
};

export default PlantingSeasonEventLog;
