import { Box } from '@mui/material';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { Notification } from 'src/types/Notifications';
import TextWithLink from 'src/components/common/TextWithLink';
import { useOrganization, useTimeZones, useUser } from 'src/providers';
import { getTodaysDateFormatted } from '@terraware/web-components/utils';
import { useEffect, useState } from 'react';
import isEnabled from 'src/features';
import { InitializedTimeZone, TimeZoneDescription } from 'src/types/TimeZones';
import { getTimeZone, getUTC } from 'src/utils/useTimeZoneUtils';
import { OrganizationService, PreferencesService, UserService } from 'src/services';

export default function OrganizationNotification(): Notification | undefined {
  const { selectedOrganization, reloadOrganizations } = useOrganization();

  const [timeZoneOrgNotification, setTimeZoneOrgNotification] = useState(false);
  const [orgTimeZone, setOrgTimeZone] = useState<string>();

  const timeZoneFeatureEnabled = isEnabled('Timezones');

  const { user, reloadUser, userPreferences, reloadUserPreferences } = useUser();
  const timeZones = useTimeZones();

  useEffect(() => {
    const getDefaultTimeZone = (): TimeZoneDescription => {
      const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return getTimeZone(timeZones, browserTimeZone) || getUTC(timeZones);
    };

    const notifyTimeZoneUpdates = (orgTz: InitializedTimeZone) => {
      const notifyOrg = orgTz.timeZone && !orgTz.timeZoneAcknowledgedOnMs;
      setOrgTimeZone(orgTz.timeZone);
      setTimeZoneOrgNotification(!!notifyOrg);
    };

    const initializeTimeZones = async () => {
      if (!user) {
        return;
      }

      const userTz: InitializedTimeZone = await UserService.initializeTimeZone(user, getDefaultTimeZone().id);
      if (!userTz.timeZone) {
        return;
      }

      let orgTz: InitializedTimeZone = {};
      orgTz = await OrganizationService.initializeTimeZone(selectedOrganization, userTz.timeZone);

      if (orgTz.updated) {
        reloadOrganizations();
      }

      if (!orgTz.updated) {
        notifyTimeZoneUpdates(orgTz);
      }
    };

    if (timeZoneFeatureEnabled) {
      initializeTimeZones();
    }
  }, [reloadOrganizations, reloadUser, selectedOrganization, timeZoneFeatureEnabled, user, userPreferences, timeZones]);

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
            <TextWithLink text={strings.ORG_NOTIFICATION_ACTION} href={APP_PATHS.ORGANIZATION} />
          </Box>
        </div>
      ),
      localUrl: APP_PATHS.ORGANIZATION,
      createdTime: getTodaysDateFormatted(),
      isRead: false,
      hideDate: true,
      markAsRead: async () => {
        await PreferencesService.updateUserOrgPreferences(selectedOrganization.id, {
          timeZoneAcknowledgedOnMs: Date.now(),
        });

        await reloadUserPreferences();
      },
    };
  }
}
