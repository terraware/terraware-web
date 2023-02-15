import { Box } from '@mui/material';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { Notification } from 'src/types/Notifications';
import { weightSystemsNames } from 'src/units';
import { supportedLocales } from 'src/strings/locales';
import TextWithLink from 'src/components/common/TextWithLink';
import { useOrganization, useTimeZones, useUser } from 'src/providers';
import { getTodaysDateFormatted } from '@terraware/web-components/utils';
import { useEffect, useMemo, useState } from 'react';
import isEnabled from 'src/features';
import { InitializedTimeZone, TimeZoneDescription } from 'src/types/TimeZones';
import { getTimeZone, getUTC } from 'src/utils/useTimeZoneUtils';
import { PreferencesService, UserService } from 'src/services';
import { InitializedUnits } from 'src/units';
import { featureNotificationExpired } from 'src/utils/featureNotifications';

export default function UserNotification(): Notification | null {
  const [unitNotification, setUnitNotification] = useState(false);
  const [unitNotificationRead, setUnitNotificationRead] = useState(false);
  const [timeZoneUserNotification, setTimeZoneUserNotification] = useState(false);
  const [timeZoneUserNotificationRead, setTimeZoneUserNotificationRead] = useState(false);
  const [userTimeZone, setUserTimeZone] = useState<string>();

  const timeZoneFeatureEnabled = isEnabled('Timezones');
  const weightUnitsEnabled = isEnabled('Weight units');

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

    if (timeZoneFeatureEnabled) {
      initializeTimeZones();
    }
  }, [reloadUser, timeZoneFeatureEnabled, user, userPreferences, timeZones]);

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

    if (weightUnitsEnabled) {
      initializeWeightUnits();
    }
  }, [user, userPreferences, weightUnitsEnabled, reloadUserPreferences]);

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
              <li>
                {strings.formatString(
                  strings.DEFAULT_LANGUAGE_SELECTED,
                  supportedLocales.find((sLocale) => sLocale.id === user?.locale)?.name || ''
                )}
              </li>
              <li>{strings.formatString(strings.TIME_ZONE_SELECTED, userTimeZone || '')}</li>
              <li>
                {strings.formatString(
                  strings.WEIGHT_SYSTEM_SELECTED,
                  weightSystemsNames().find((ws) => ws.value === userPreferences.preferredWeightSystem)?.label || ''
                )}
              </li>
            </ul>
            <Box paddingTop={1}>
              <TextWithLink text={strings.USER_NOTIFICATION_ACTION} href={APP_PATHS.MY_ACCOUNT} />
            </Box>
          </Box>
        ),
        localUrl: APP_PATHS.MY_ACCOUNT,
        createdTime: getTodaysDateFormatted(),
        isRead: unitNotificationRead || timeZoneUserNotificationRead,
        hideDate: true,
        markAsRead: async () => {
          await PreferencesService.updateUserPreferences({
            unitsAcknowledgedOnMs: Date.now(),
            timeZoneAcknowledgedOnMs: Date.now(),
          });

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
    user?.locale,
    userPreferences.preferredWeightSystem,
    userTimeZone,
    timeZoneUserNotificationRead,
    unitNotificationRead,
  ]);
}
