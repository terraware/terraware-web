import { Box } from '@mui/material';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { Notification } from 'src/types/Notifications';
import TextWithLink from 'src/components/common/TextWithLink';
import { useOrganization, useTimeZones, useUser } from 'src/providers';
import { getTodaysDateFormatted } from '@terraware/web-components/utils';
import { useEffect, useMemo, useState } from 'react';
import { InitializedTimeZone, TimeZoneDescription } from 'src/types/TimeZones';
import { getTimeZone, getUTC } from 'src/utils/useTimeZoneUtils';
import { OrganizationService, PreferencesService, UserService } from 'src/services';
import { featureNotificationExpired } from 'src/utils/featureNotifications';

export default function OrganizationNotification(): Notification | null {
  const { selectedOrganization, reloadOrganizations } = useOrganization();

  const [timeZoneOrgNotification, setTimeZoneOrgNotification] = useState(false);
  const [timeZoneOrgNotificationRead, setTimeZoneOrgNotificationRead] = useState(false);
  const [orgTimeZone, setOrgTimeZone] = useState<string>();

  const { user, reloadUser, userPreferences, reloadUserPreferences } = useUser();
  const timeZones = useTimeZones();

  useEffect(() => {
    const getTimeZoneById = (id?: string): TimeZoneDescription => {
      return getTimeZone(timeZones, id) ?? getUTC(timeZones);
    };

    const getDefaultTimeZone = (): TimeZoneDescription => {
      const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return getTimeZoneById(browserTimeZone);
    };

    const notifyTimeZoneUpdates = (orgTz: InitializedTimeZone) => {
      const notifyOrg = orgTz.timeZone && !featureNotificationExpired(orgTz.timeZoneAcknowledgedOnMs);
      setOrgTimeZone(getTimeZoneById(orgTz.timeZone).longName);
      setTimeZoneOrgNotification(!!notifyOrg);

      if (orgTz.timeZoneAcknowledgedOnMs) {
        setTimeZoneOrgNotificationRead(true);
      } else {
        setTimeZoneOrgNotificationRead(false);
      }
    };

    const initializeTimeZones = async () => {
      if (!user) {
        return;
      }

      const userTz: InitializedTimeZone = await UserService.getInitializedTimeZone(user, getDefaultTimeZone().id);
      if (!userTz.timeZone) {
        return;
      }

      let orgTz: InitializedTimeZone = {};

      if (selectedOrganization.id !== -1) {
        orgTz = await OrganizationService.initializeTimeZone(selectedOrganization, userTz.timeZone);
      }

      if (orgTz.updated) {
        reloadOrganizations();
      }

      if (!orgTz.updated) {
        notifyTimeZoneUpdates(orgTz);
      }
    };

    initializeTimeZones();
  }, [reloadOrganizations, reloadUser, selectedOrganization, user, userPreferences, timeZones]);

  return useMemo(() => {
    if (timeZoneOrgNotification) {
      return {
        id: -2,
        notificationCriticality: 'Info',
        organizationId: selectedOrganization.id,
        title: strings.REVIEW_YOUR_ORGANIZATION_SETTING,
        body: (
          <div>
            <ul>
              <li>{strings.formatString(strings.TIME_ZONE_SELECTED, orgTimeZone || '')}</li>
            </ul>
            <Box paddingTop={1}>
              <TextWithLink text={strings.ORG_NOTIFICATION_ACTION} href={APP_PATHS.ORGANIZATION} fontSize='14px' />
            </Box>
          </div>
        ),
        localUrl: APP_PATHS.ORGANIZATION,
        createdTime: getTodaysDateFormatted(),
        isRead: timeZoneOrgNotificationRead,
        hideDate: true,
        markAsRead: async () => {
          await PreferencesService.updateUserOrgPreferences(selectedOrganization.id, {
            timeZoneAcknowledgedOnMs: Date.now(),
          });

          await reloadUserPreferences();
        },
      };
    }

    return null;
  }, [
    timeZoneOrgNotification,
    orgTimeZone,
    reloadUserPreferences,
    selectedOrganization.id,
    timeZoneOrgNotificationRead,
  ]);
}
