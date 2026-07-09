import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box } from '@mui/material';
import { getTodaysDateFormatted } from '@terraware/web-components/utils';

import TextWithLink from 'src/components/common/TextWithLink';
import { APP_PATHS } from 'src/constants';
import useInitializeUserTimeZone from 'src/hooks/useInitializeUserTimeZone';
import useUpdateUserPreferences from 'src/hooks/useUpdateUserPreferences';
import { useOrganization, useTimeZones, useUser } from 'src/providers';
import { OrganizationService } from 'src/services';
import strings from 'src/strings';
import { ClientNotification } from 'src/types/Notifications';
import { InitializedTimeZone, TimeZoneDescription } from 'src/types/TimeZones';
import { featureNotificationExpired } from 'src/utils/featureNotifications';
import { getTimeZone, getUTC } from 'src/utils/useTimeZoneUtils';

export default function useOrganizationNotification(): ClientNotification | null {
  const { selectedOrganization, reloadOrganizations } = useOrganization();

  const [timeZoneOrgNotification, setTimeZoneOrgNotification] = useState(false);
  const [timeZoneOrgNotificationRead, setTimeZoneOrgNotificationRead] = useState(false);
  const [orgTimeZone, setOrgTimeZone] = useState<string>();

  const { reloadUserPreferences } = useUser();
  const timeZones = useTimeZones();
  const updateUserPreferences = useUpdateUserPreferences();

  const getTimeZoneById = useCallback(
    (id?: string): TimeZoneDescription => getTimeZone(timeZones, id) ?? getUTC(timeZones),
    [timeZones]
  );

  const defaultTimeZoneId = getTimeZoneById(Intl.DateTimeFormat().resolvedOptions().timeZone).id;

  const userTz = useInitializeUserTimeZone(defaultTimeZoneId);

  useEffect(() => {
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
      if (!userTz.timeZone) {
        return;
      }

      let orgTz: InitializedTimeZone = {};

      if (selectedOrganization) {
        orgTz = await OrganizationService.initializeTimeZone(selectedOrganization, userTz.timeZone);
      }

      if (orgTz.updated) {
        void reloadOrganizations();
      }

      if (!orgTz.updated) {
        notifyTimeZoneUpdates(orgTz);
      }
    };

    void initializeTimeZones();
  }, [userTz, reloadOrganizations, selectedOrganization, getTimeZoneById]);

  return useMemo(() => {
    if (timeZoneOrgNotification && selectedOrganization) {
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
        markAsRead: async (read: boolean) => {
          await updateUserPreferences(
            {
              timeZoneAcknowledgedOnMs: read ? Date.now() : undefined,
            },
            selectedOrganization.id
          );

          // eslint-disable-next-line @typescript-eslint/await-thenable
          await reloadUserPreferences();
        },
      };
    }

    return null;
  }, [
    timeZoneOrgNotification,
    orgTimeZone,
    reloadUserPreferences,
    selectedOrganization,
    timeZoneOrgNotificationRead,
    updateUserPreferences,
  ]);
}
