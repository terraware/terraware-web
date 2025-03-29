import React, { useEffect, useMemo, useState } from 'react';

import { Box } from '@mui/material';
import { getTodaysDateFormatted } from '@terraware/web-components/utils';

import TextWithLink from 'src/components/common/TextWithLink';
import { APP_PATHS } from 'src/constants';
import { useOrganization, useTimeZones, useUser } from 'src/providers';
import { PreferencesService, UserService } from 'src/services';
import strings from 'src/strings';
import { useSupportedLocales } from 'src/strings/locales';
import { Notification } from 'src/types/Notifications';
import { InitializedTimeZone, TimeZoneDescription } from 'src/types/TimeZones';
import { weightSystemsNames } from 'src/units';
import { InitializedUnits } from 'src/units';
import { featureNotificationExpired } from 'src/utils/featureNotifications';
import { getTimeZone, getUTC } from 'src/utils/useTimeZoneUtils';

export default function UserNotification(): Notification | null {
  const supportedLocales = useSupportedLocales();
  const [unitNotification, setUnitNotification] = useState(false);
  const [unitNotificationRead, setUnitNotificationRead] = useState(false);
  const [timeZoneUserNotification, setTimeZoneUserNotification] = useState(false);
  const [timeZoneUserNotificationRead, setTimeZoneUserNotificationRead] = useState(false);
  const [userTimeZone, setUserTimeZone] = useState<string>();
  const { user, reloadUser, userPreferences, reloadUserPreferences } = useUser();
  const { selectedOrganization } = useOrganization();
  const timeZones = useTimeZones();

  useEffect(() => {
    const getTimeZoneById = (id?: string): TimeZoneDescription => {
      return getTimeZone(timeZones, id) ?? getUTC(timeZones);
    };

    const getDefaultTimeZone = (): TimeZoneDescription => {
      const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return getTimeZoneById(browserTimeZone);
    };

    const notifyTimeZoneUpdates = (userTz: InitializedTimeZone) => {
      const notifyUser = userTz.timeZone && !featureNotificationExpired(userTz.timeZoneAcknowledgedOnMs);
      setUserTimeZone(getTimeZoneById(userTz.timeZone).longName);
      setTimeZoneUserNotification(!!notifyUser);

      if (userTz.timeZoneAcknowledgedOnMs) {
        setTimeZoneUserNotificationRead(true);
      } else {
        setTimeZoneUserNotificationRead(false);
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

      if (userTz.updated) {
        reloadUser();
      }

      if (!userTz.updated) {
        notifyTimeZoneUpdates(userTz);
      }
    };

    initializeTimeZones();
  }, [reloadUser, user, userPreferences, timeZones]);

  useEffect(() => {
    const initializeWeightUnits = async () => {
      const userUnit: InitializedUnits = await UserService.initializeUnits('metric');
      if (!userUnit.units) {
        return;
      }

      if (userUnit.updated) {
        reloadUserPreferences();
      }

      if (!userUnit.unitsAcknowledgedOnMs) {
        setUnitNotificationRead(false);
      } else {
        setUnitNotificationRead(true);
      }

      setUnitNotification(!featureNotificationExpired(userUnit.unitsAcknowledgedOnMs));
    };

    initializeWeightUnits();
  }, [user, userPreferences, reloadUserPreferences]);

  return useMemo(() => {
    if (unitNotification && timeZoneUserNotification) {
      return {
        id: -1,
        notificationCriticality: 'Info',
        organizationId: selectedOrganization.id,
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
        hideDate: true,
        markAsRead: async () => {
          await PreferencesService.updateUserPreferences({
            unitsAcknowledgedOnMs: Date.now(),
            timeZoneAcknowledgedOnMs: Date.now(),
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
    selectedOrganization.id,
    user?.userType,
    user?.locale,
    userPreferences.preferredWeightSystem,
    userTimeZone,
    timeZoneUserNotificationRead,
    unitNotificationRead,
    supportedLocales,
  ]);
}
