import React, { type JSX, type ReactNode, useCallback, useEffect, useMemo } from 'react';

import { Typography, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import EventLog from 'src/components/common/EventLog';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { type EventLogEntryPayload } from 'src/queries/generated/events';
import { type PlantingSeasonPayload } from 'src/queries/generated/plantingSeasons';
import { type PlantingSitePayload } from 'src/queries/generated/plantingSites';
import { useLazyListInventoryPlanningEventsQuery } from 'src/queries/plantingSeasons/events';

type InventoryPlanningEventLogProps = {
  organizationId?: number;
  plantingSeasonId?: number;
  plantingSeasons?: PlantingSeasonPayload[];
  plantingSiteId?: number;
  plantingSites?: PlantingSitePayload[];
  speciesId?: number;
};

const InventoryPlanningEventLog = ({
  organizationId,
  plantingSeasonId,
  plantingSeasons,
  plantingSiteId,
  plantingSites,
  speciesId,
}: InventoryPlanningEventLogProps): JSX.Element | null => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const [listInventoryPlanningEvents, { data: events, isLoading }] = useLazyListInventoryPlanningEventsQuery();

  useEffect(() => {
    if (organizationId !== undefined) {
      void listInventoryPlanningEvents({ organizationId, plantingSeasonId, plantingSiteId, speciesId }, true);
    }
  }, [listInventoryPlanningEvents, organizationId, plantingSeasonId, plantingSiteId, speciesId]);

  const filteredEvents = useMemo(
    () =>
      events?.filter(
        (event) => !(event.subject.type === 'PlantingSeasonAllocatedSpecies' && event.action.type === 'Deleted')
      ),
    [events]
  );

  const plantingSeasonsById = useMemo(
    () => new Map(plantingSeasons?.map((season) => [season.id, season])),
    [plantingSeasons]
  );
  const plantingSitesById = useMemo(() => new Map(plantingSites?.map((site) => [site.id, site])), [plantingSites]);

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
      if (event.subject.type === 'PlantingSeasonAllocatedSpecies') {
        const season = plantingSeasonsById.get(event.subject.plantingSeasonId);
        const plantingSite = plantingSitesById.get(event.subject.plantingSiteId);
        const seasonName = season?.name ?? event.subject.shortText;
        const plantingSiteName = plantingSite?.name ?? event.subject.fullText;
        const seasonLink = (
          <Link
            fontSize='inherit'
            lineHeight='inherit'
            to={APP_PATHS.PLANTING_SEASONS_VIEW.replace(':plantingSeasonId', String(event.subject.plantingSeasonId))}
          >
            {seasonName}
          </Link>
        );

        if (event.action.type === 'Created') {
          const quantity = event.action.fields.find(({ fieldName }) => fieldName === 'quantity')?.value;

          return strings.formatString<string | JSX.Element>(
            strings.PLANTS_OF_SPECIES_ALLOCATED_TO_SEASON_FOR_SITE,
            renderChangedTo(quantity),
            event.subject.scientificName ?? event.subject.shortText,
            seasonLink,
            plantingSiteName
          );
        }

        if (event.action.type === 'FieldUpdated') {
          return strings.formatString<string | JSX.Element>(
            strings.PLANTS_OF_SPECIES_ALLOCATED_TO_SEASON_FOR_SITE_CHANGED,
            event.subject.scientificName ?? event.subject.shortText,
            seasonLink,
            plantingSiteName,
            renderChangedFrom(event.action.changedFrom),
            renderChangedTo(event.action.changedTo)
          );
        }
      }

      return null;
    },
    [plantingSeasonsById, plantingSitesById, renderChangedFrom, renderChangedTo, strings]
  );

  if (!filteredEvents?.length) {
    return null;
  }

  return (
    <Card style={{ marginTop: theme.spacing(3) }} radius={theme.spacing(1)}>
      <EventLog events={filteredEvents} isLoading={isLoading} renderEventDescription={renderEventDescription} />
    </Card>
  );
};

export default InventoryPlanningEventLog;
