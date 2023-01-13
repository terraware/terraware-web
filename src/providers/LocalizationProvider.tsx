import React, { useEffect, useState } from 'react';
import { LocalizationContext } from './contexts';
import { getTimeZones } from 'src/api/timezones/timezones';
import { TimeZoneDescription } from 'src/types/TimeZones';
import strings, { stringsMap } from 'src/strings';
import { useUser } from '.';
import { updateUserProfile } from 'src/api/user/user';
import isEnabled from 'src/features';
import useSnackbar from 'src/utils/useSnackbar';
import { Link } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';

export type LocalizationProviderProps = {
  children?: React.ReactNode;
  locale: string;
};

export default function LocalizationProvider({ children, locale }: LocalizationProviderProps): JSX.Element {
  const [timeZones, setTimeZones] = useState<TimeZoneDescription[]>([]);
  const { user, reloadUser } = useUser();
  const snackbar = useSnackbar();
  const timeZoneFeatureEnabled = isEnabled('Timezones');

  useEffect(() => {
    const fetchTimeZones = async () => {
      const timeZoneResponse = await getTimeZones(locale);
      if (!timeZoneResponse.error && timeZoneResponse.timeZones) {
        setTimeZones(timeZoneResponse.timeZones.sort((a, b) => a.longName.localeCompare(b.longName, locale)));
      }
    };

    fetchTimeZones();
  }, [locale]);

  useEffect(() => {
    const populateTimeZone = async () => {
      if (user && !user.timeZone) {
        const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const foundTimeZone =
          timeZones.find((timeZone) => timeZone.id === browserTimeZone) ||
          timeZones.find((timeZone) => timeZone.id === 'Etc/Utc');
        if (!foundTimeZone) {
          return;
        } // this should never happen

        const updateResponse = await updateUserProfile({
          ...user,
          timeZone: foundTimeZone.id,
        });
        if (updateResponse.requestSucceeded) {
          snackbar.pageSuccess(
            strings.formatString(
              strings.UPDATED_TIMEZONE_MSG,
              <Link to={APP_PATHS.MY_ACCOUNT}>{strings.MY_ACCOUNT}</Link>
            ),
            strings.formatString(strings.UPDATED_TIMEZONE_TITLE, foundTimeZone.longName)
          );
          reloadUser();
        }
      }
    };
    if (timeZoneFeatureEnabled) {
      populateTimeZone();
    }
  }, [timeZones, user, snackbar, reloadUser, timeZoneFeatureEnabled]);

  return (
    <LocalizationContext.Provider
      value={{
        supportedTimeZones: timeZones,
        strings: stringsMap[locale],
        bootstrapped: !!stringsMap[locale],
      }}
    >
      {children}
    </LocalizationContext.Provider>
  );
}
