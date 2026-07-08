import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box } from '@mui/material';
import { getTodaysDateFormatted } from '@terraware/web-components/utils';

import TextWithLink from 'src/components/common/TextWithLink';
import { APP_PATHS } from 'src/constants';
import useInitializeUnits from 'src/hooks/useInitializeUnits';
import useInitializeUserTimeZone from 'src/hooks/useInitializeUserTimeZone';
import { useOrganization, useTimeZones, useUser } from 'src/providers';
import { PreferencesService } from 'src/services';
import strings from 'src/strings';
import { useSupportedLocales } from 'src/strings/locales';
import { ClientNotification } from 'src/types/Notifications';
import { TimeZoneDescription } from 'src/types/TimeZones';
import { weightSystemsNames } from 'src/units';
import { featureNotificationExpired } from 'src/utils/featureNotifications';
import { getTimeZone, getUTC } from 'src/utils/useTimeZoneUtils';

export default function useUserNotification(): ClientNotification | null {
  const supportedLocales = useSupportedLocales();
  const [unitNotification, setUnitNotification] = useState(false);
  const [unitNotificationRead, setUnitNotificationRead] = useState(false);
  const [timeZoneUserNotification, setTimeZoneUserNotification] = useState(false);
  const [timeZoneUserNotificationRead, setTimeZoneUserNotificationRead] = useState(false);
  const [userTimeZone, setUserTimeZone] = useState<string>();
  const { user, userPreferences, reloadUserPreferences } = useUser();
  const { selectedOrganization } = useOrganization();
  const timeZones = useTimeZones();

  const getTimeZoneById = useCallback(
    (id?: string): TimeZoneDescription => getTimeZone(timeZones, id) ?? getUTC(timeZones),
    [timeZones]
  );

  const defaultTimeZoneId = getTimeZoneById(Intl.DateTimeFormat().resolvedOptions().timeZone).id;

  const userTz = useInitializeUserTimeZone(defaultTimeZoneId);
  const userUnit = useInitializeUnits('metric');

  useEffect(() => {
    if (!userTz.timeZone) {
      return;
    }

    if (userTz.updated) {
      // getMyself is refetched automatically via the Users:ME tag invalidation on updateMyself
      return;
    }

    const notifyUser = userTz.timeZone && !featureNotificationExpired(userTz.timeZoneAcknowledgedOnMs);
    setUserTimeZone(getTimeZoneById(userTz.timeZone).longName);
    setTimeZoneUserNotification(!!notifyUser);

    if (userTz.timeZoneAcknowledgedOnMs) {
      setTimeZoneUserNotificationRead(true);
    } else {
      setTimeZoneUserNotificationRead(false);
    }
  }, [userTz, getTimeZoneById]);

  useEffect(() => {
    if (userUnit.updated) {
      reloadUserPreferences();
      return;
    }

    if (!userUnit.unitsAcknowledgedOnMs) {
      setUnitNotificationRead(false);
    } else {
      setUnitNotificationRead(true);
    }

    setUnitNotification(!featureNotificationExpired(userUnit.unitsAcknowledgedOnMs));
  }, [userUnit, reloadUserPreferences]);

  return useMemo(() => {
    if (unitNotification && timeZoneUserNotification) {
      return {
        id: -1,
        notificationCriticality: 'Info',
        organizationId: selectedOrganization?.id || -1,
        title: strings.REVIEW_YOUR_ACCOUNT_SETTING,
        body: (
          <Box>
            <ul>
              {user?.userType !== 'Funder' && (
                <li>
                  {strings.formatString(
                    strings.DEFAULT_LANGUAGE_SELECTED,
                    supportedLocales.find((sLocale) => sLocale.id === user?.locale)?.name || ''
                  )}
                </li>
              )}
              <li>{strings.formatString(strings.TIME_ZONE_SELECTED, userTimeZone || '')}</li>
              {user?.userType !== 'Funder' && (
                <li>
                  {strings.formatString(
                    strings.WEIGHT_SYSTEM_SELECTED,
                    weightSystemsNames().find((ws) => ws.value === userPreferences.preferredWeightSystem)?.label || ''
                  )}
                </li>
              )}
            </ul>
            <Box paddingTop={1}>
              {user?.userType === 'Funder' ? (
                <TextWithLink
                  text={strings.USER_NOTIFICATION_ACTION_SETTINGS}
                  href={APP_PATHS.SETTINGS}
                  fontSize='14px'
                />
              ) : (
                <TextWithLink text={strings.USER_NOTIFICATION_ACTION} href={APP_PATHS.MY_ACCOUNT} fontSize='14px' />
              )}
            </Box>
          </Box>
        ),
        localUrl: user?.userType === 'Funder' ? APP_PATHS.SETTINGS : APP_PATHS.MY_ACCOUNT,
        createdTime: getTodaysDateFormatted(),
        isRead:
          user?.userType === 'Funder'
            ? timeZoneUserNotificationRead
            : unitNotificationRead || timeZoneUserNotificationRead,
        markAsRead: async (read: boolean) => {
          await PreferencesService.updateUserPreferences({
            unitsAcknowledgedOnMs: read ? Date.now() : undefined,
            timeZoneAcknowledgedOnMs: read ? Date.now() : undefined,
          });

          // eslint-disable-next-line @typescript-eslint/await-thenable
          await reloadUserPreferences();
        },
      };
    }

    return null;
  }, [
    unitNotification,
    timeZoneUserNotification,
    reloadUserPreferences,
    selectedOrganization,
    user?.userType,
    user?.locale,
    userPreferences.preferredWeightSystem,
    userTimeZone,
    timeZoneUserNotificationRead,
    unitNotificationRead,
    supportedLocales,
  ]);
}
