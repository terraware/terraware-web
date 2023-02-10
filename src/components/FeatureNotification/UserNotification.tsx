import { Box } from '@mui/material';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { Notification } from 'src/types/Notifications';
import { weightSystemsNames } from 'src/units';
import { supportedLocales } from 'src/strings/locales';
import TextWithLink from 'src/components/common/TextWithLink';
import { useOrganization, useTimeZones, useUser } from 'src/providers';
import { getTodaysDateFormatted } from '@terraware/web-components/utils';
import { useEffect, useState } from 'react';
import isEnabled from 'src/features';
import { InitializedTimeZone, TimeZoneDescription } from 'src/types/TimeZones';
import { getTimeZone, getUTC } from 'src/utils/useTimeZoneUtils';
import { PreferencesService, UserService } from 'src/services';
import { InitializedUnits } from 'src/units';

export default function UserNotification(): Notification | undefined {
  const [unitNotification, setUnitNotification] = useState(false);
  const [timeZoneUserNotification, setTimeZoneUserNotification] = useState(false);
  const [userTimeZone, setUserTimeZone] = useState<string>();

  const timeZoneFeatureEnabled = isEnabled('Timezones');
  const weightUnitsEnabled = isEnabled('Weight units');

  const { user, reloadUser, userPreferences, reloadUserPreferences } = useUser();
  const { selectedOrganization } = useOrganization();
  const timeZones = useTimeZones();

  useEffect(() => {
    const getDefaultTimeZone = (): TimeZoneDescription => {
      const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return getTimeZone(timeZones, browserTimeZone) || getUTC(timeZones);
    };

    const notifyTimeZoneUpdates = (userTz: InitializedTimeZone) => {
      const notifyUser = userTz.timeZone && !userTz.timeZoneAcknowledgedOnMs;
      setUserTimeZone(userTz.timeZone);
      setTimeZoneUserNotification(!!notifyUser);
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
        setUnitNotification(true);
      } else {
        setUnitNotification(false);
      }
    };

    if (weightUnitsEnabled) {
      initializeWeightUnits();
    }
  }, [user, userPreferences, weightUnitsEnabled, reloadUserPreferences]);

  if (unitNotification || timeZoneUserNotification) {
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
      isRead: false,
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
}
