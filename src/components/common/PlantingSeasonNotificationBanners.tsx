import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Message } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import {
  PlantingSeasonNotificationGroupPayload,
  PlantingSeasonNotificationPayload,
  useDismissPlantingSeasonNotificationsMutation,
  useGetPlantingSeasonNotificationsQuery,
} from 'src/queries/generated/plantingSeasons';
import strings from 'src/strings';
import { getMediumDate } from 'src/utils/dateFormatter';
import useSnackbar from 'src/utils/useSnackbar';

type PlantingSeasonNotificationPage = PlantingSeasonNotificationGroupPayload['notificationPage'];
type PlantingSeasonNotificationType = PlantingSeasonNotificationPayload['type'];

type PlantingSeasonNotificationBannersProps = {
  organizationId?: number;
  plantingSeasonId?: number;
  notificationPage: PlantingSeasonNotificationPage;
  marginBottom?: string | number;
  marginTop?: string | number;
};

type NotificationBodyProps = {
  notification: PlantingSeasonNotificationPayload;
  notificationPage: PlantingSeasonNotificationPage;
  activeLocale: string | null;
};

type NotificationGroupBodyProps = {
  group: PlantingSeasonNotificationGroupPayload;
  activeLocale: string | null;
  showPageContext: boolean;
};

type PlantingSeasonNotificationPayloadWithRequestDetails = PlantingSeasonNotificationPayload & {
  date?: string;
  dates?: string[];
  nurseryRequestNotes?: string;
  notes?: string;
  scheduledPlantingDates?: string[];
};

const notificationSortOrder: Record<PlantingSeasonNotificationType, number> = {
  SpeciesTargetsAdded: 1,
  SpeciesTargetsUpdated: 2,
  PlantingSeasonClosed: 3,
  AllocationQuantitiesUpdated: 4,
  SeasonWithdrawalRecorded: 5,
  PlantingSeasonPastEndDate: 6,
  ScheduledPlantingDateRequested: 7,
};

const getSortedSpeciesNames = (notification: PlantingSeasonNotificationPayload, activeLocale: string | null) =>
  Array.from(new Set(notification.speciesScientificNames ?? [])).toSorted((a, b) =>
    a.localeCompare(b, activeLocale || undefined)
  );

const SpeciesNamesList = ({ names }: { names: string[] }): JSX.Element => (
  <Box component='span' sx={{ fontStyle: 'italic', fontWeight: 600 }}>
    {names.map((name, index) => (
      <React.Fragment key={name}>
        {index > 0 ? ', ' : ''}
        {name}
      </React.Fragment>
    ))}
  </Box>
);

const getScheduledPlantingDateLabels = (
  notification: PlantingSeasonNotificationPayloadWithRequestDetails,
  activeLocale: string | null
) => {
  const dates =
    notification.dates ?? notification.scheduledPlantingDates ?? (notification.date ? [notification.date] : []);

  return dates.toSorted().map((date) => getMediumDate(date, activeLocale));
};

const getScheduledPlantingDateRequestMessage = (
  notification: PlantingSeasonNotificationPayload,
  notificationPage: PlantingSeasonNotificationPage,
  activeLocale: string | null
) => {
  if (!['Inventory', 'Withdrawals'].includes(notificationPage)) {
    return strings.PLANTING_SEASON_NOTIFICATION_SCHEDULED_PLANTING_DATE_REQUESTED;
  }

  const notificationWithRequestDetails = notification as PlantingSeasonNotificationPayloadWithRequestDetails;
  const dateLabels = getScheduledPlantingDateLabels(notificationWithRequestDetails, activeLocale);
  const notes = notificationWithRequestDetails.notes ?? notificationWithRequestDetails.nurseryRequestNotes;

  return (
    <>
      {dateLabels.length > 0
        ? strings.formatString(
            strings.PLANTING_SEASON_NOTIFICATION_SCHEDULED_PLANTING_DATE_REQUESTED_INVENTORY_WITH_DATES,
            dateLabels.join(', ')
          )
        : strings.PLANTING_SEASON_NOTIFICATION_SCHEDULED_PLANTING_DATE_REQUESTED_INVENTORY}
      {notes && (
        <Box component='span' sx={{ display: 'block', marginTop: 0.5 }}>
          <Typography component='span' fontWeight={600}>
            {strings.NOTE_COLON}
          </Typography>
          {` ${notes}`}
        </Box>
      )}
    </>
  );
};

const ContextPrefix = ({ group }: { group: PlantingSeasonNotificationGroupPayload }): JSX.Element => {
  const label = `${group.plantingSiteName} \u00B7 ${group.plantingSeasonName}`;

  return (
    <>
      <Typography component='span' fontWeight={600}>
        {label}
      </Typography>
      {' \u2014 '}
    </>
  );
};

const getNotificationMessage = ({
  notification,
  notificationPage,
  activeLocale,
}: NotificationBodyProps): JSX.Element => {
  const speciesNames = getSortedSpeciesNames(notification, activeLocale);
  const hasSpeciesNames = speciesNames.length > 0;
  const appendsSpeciesList =
    hasSpeciesNames && ['SpeciesTargetsAdded', 'SpeciesTargetsUpdated'].includes(notification.type);

  const message = (() => {
    switch (notification.type) {
      case 'AllocationQuantitiesUpdated':
        return strings.PLANTING_SEASON_NOTIFICATION_ALLOCATION_QUANTITIES_UPDATED;
      case 'PlantingSeasonClosed':
        return strings.PLANTING_SEASON_NOTIFICATION_PLANTING_SEASON_CLOSED;
      case 'PlantingSeasonPastEndDate':
        return strings.PLANTING_SEASON_NOTIFICATION_PLANTING_SEASON_PAST_END_DATE;
      case 'SeasonWithdrawalRecorded':
        return strings.PLANTING_SEASON_NOTIFICATION_SEASON_WITHDRAWAL_RECORDED;
      case 'ScheduledPlantingDateRequested':
        return getScheduledPlantingDateRequestMessage(notification, notificationPage, activeLocale);
      case 'SpeciesTargetsAdded':
        return hasSpeciesNames
          ? strings.formatString(
              strings.NEW_SPECIES_TARGETS_ADDED,
              <SpeciesNamesList key='species-names' names={speciesNames} />
            )
          : strings.PLANTING_SEASON_NOTIFICATION_SPECIES_TARGETS_ADDED_FOR_SEASON;
      case 'SpeciesTargetsUpdated':
        return hasSpeciesNames
          ? strings.formatString(
              strings.PLANTING_SEASON_NOTIFICATION_SPECIES_TARGETS_UPDATED,
              <SpeciesNamesList key='species-names' names={speciesNames} />
            )
          : strings.PLANTING_SEASON_NOTIFICATION_SPECIES_TARGETS_UPDATED_FOR_SEASON;
    }
  })();

  return (
    <>
      {message}
      {appendsSpeciesList ? '.' : ''}
    </>
  );
};

const NotificationGroupBody = ({ group, activeLocale, showPageContext }: NotificationGroupBodyProps): JSX.Element => {
  const sortedNotifications = group.notifications.toSorted(
    (a, b) => notificationSortOrder[a.type] - notificationSortOrder[b.type]
  );

  return (
    <Typography component='span' fontSize='16px' lineHeight='24px'>
      {showPageContext && <ContextPrefix group={group} />}
      {sortedNotifications.map((notification, index) => (
        <React.Fragment key={`${notification.type}-${index}`}>
          {index > 0 ? ' ' : ''}
          {getNotificationMessage({ notification, notificationPage: group.notificationPage, activeLocale })}
        </React.Fragment>
      ))}
    </Typography>
  );
};

const PlantingSeasonNotificationBanners = ({
  organizationId,
  plantingSeasonId,
  notificationPage,
  marginBottom,
  marginTop,
}: PlantingSeasonNotificationBannersProps): JSX.Element | null => {
  const theme = useTheme();
  const snackbar = useSnackbar();
  const { activeLocale } = useLocalization();
  const skip = organizationId === undefined && plantingSeasonId === undefined;
  const { data, refetch } = useGetPlantingSeasonNotificationsQuery(
    { organizationId, plantingSeasonId, notificationPage },
    { skip }
  );
  const [dismissPlantingSeasonNotifications] = useDismissPlantingSeasonNotificationsMutation();

  const notificationGroups = data?.notifications ?? [];

  if (notificationGroups.length === 0) {
    return null;
  }

  const dismissGroupNotifications = async (group: PlantingSeasonNotificationGroupPayload) => {
    try {
      await dismissPlantingSeasonNotifications({
        lastEventLogId: group.lastEventLogId,
        notificationPage: group.notificationPage,
        plantingSeasonId: group.plantingSeasonId,
      }).unwrap();
      void refetch();
    } catch (e) {
      snackbar.toastError();
    }
  };

  return (
    <Box display='flex' flexDirection='column' gap={theme.spacing(1)} marginBottom={marginBottom} marginTop={marginTop}>
      {notificationGroups.map((group) => (
        <Message
          key={`${group.plantingSeasonId}-${group.notificationPage}-${group.lastEventLogId}`}
          type='page'
          priority='info'
          body={
            <NotificationGroupBody
              group={group}
              activeLocale={activeLocale}
              showPageContext={plantingSeasonId === undefined}
            />
          }
          showCloseButton
          onClose={() => void dismissGroupNotifications(group)}
        />
      ))}
    </Box>
  );
};

export default PlantingSeasonNotificationBanners;
