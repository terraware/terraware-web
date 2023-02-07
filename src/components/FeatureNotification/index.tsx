import UserNotification from './UserNotification';
import { Notification } from 'src/types/Notifications';
import { useEffect, useState } from 'react';
import isEnabled from 'src/features';
import { useOrganization, useTimeZones, useUser } from 'src/providers';
import { InitializedTimeZone, TimeZoneDescription } from 'src/types/TimeZones';
import { getTimeZone, getUTC } from 'src/utils/useTimeZoneUtils';
import { OrganizationService, UserService } from 'src/services';
import { InitializedUnits } from 'src/units';
import OrganizationNotification from './OrganizationNotification';

export default function useFeatureNotifications(): Notification[] {
  const [unitNotification, setUnitNotification] = useState(false);
  const [timeZoneUserNotification, setTimeZoneUserNotification] = useState(false);
  const [timeZoneOrgNotification, setTimeZoneOrgNotification] = useState(false);
  const [userTimeZone, setUserTimeZone] = useState<string>();
  const [orgTimeZone, setOrgTimeZone] = useState<string>();

  const timeZoneFeatureEnabled = isEnabled('Timezones');
  const weightUnitsEnabled = isEnabled('Weight units');

  const { user, reloadUser, userPreferences, reloadUserPreferences: reloadPreferences } = useUser();
  const { selectedOrganization, reloadOrganizations } = useOrganization();
  const timeZones = useTimeZones();

  useEffect(() => {
    const getDefaultTimeZone = (): TimeZoneDescription => {
      const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return getTimeZone(timeZones, browserTimeZone) || getUTC(timeZones);
    };

    const notifyTimeZoneUpdates = (userTz: InitializedTimeZone, orgTz: InitializedTimeZone) => {
      const notifyUser = userTz.timeZone && !userTz.timeZoneAcknowledgedOnMs;
      const notifyOrg = orgTz.timeZone && !orgTz.timeZoneAcknowledgedOnMs;
      setUserTimeZone(userTz.timeZone);
      setOrgTimeZone(orgTz.timeZone);
      setTimeZoneOrgNotification(!!notifyOrg);
      setTimeZoneUserNotification(!!notifyUser);
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

      if (userTz.updated) {
        reloadUser();
      }

      if (orgTz.updated) {
        reloadOrganizations();
      }

      if (!userTz.updated && !orgTz.updated) {
        notifyTimeZoneUpdates(userTz, orgTz);
      }
    };

    if (timeZoneFeatureEnabled) {
      initializeTimeZones();
    }
  }, [reloadOrganizations, reloadUser, selectedOrganization, timeZoneFeatureEnabled, user, userPreferences, timeZones]);

  useEffect(() => {
    const initializeWeightUnits = async () => {
      const userUnit: InitializedUnits = await UserService.initializeUnits('metric');
      if (!userUnit.units) {
        return;
      }

      if (userUnit.updated) {
        reloadPreferences();
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
  }, [user, userPreferences, weightUnitsEnabled, reloadPreferences]);

  const featureNotifications: Notification[] = [];

  if (unitNotification || timeZoneUserNotification) {
    featureNotifications.push(UserNotification(userTimeZone));
  }

  if (timeZoneOrgNotification) {
    featureNotifications.push(OrganizationNotification(orgTimeZone));
  }

  return featureNotifications;
}
