import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTimeZones } from 'src/api/timezones/timezones';
import { updateUserProfile } from 'src/api/user/user';
import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';
import { UserContext } from './contexts';
import { ProvidedUserData } from './DataTypes';

export type UserProviderProps = {
  children?: React.ReactNode;
  data: ProvidedUserData;
};

export default function UserProvider({ children, data }: UserProviderProps): JSX.Element {
  const snackbar = useSnackbar();
  const timeZoneFeatureEnabled = isEnabled('Timezones');

  useEffect(() => {
    const populateTimeZone = async () => {
      if (data.user) {
        if (!data.user.timeZone) {
          // TODO Move this validation to Localization provider when this is ready
          const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const backendTimeZonesResponse = await getTimeZones();
          if (backendTimeZonesResponse.requestSucceeded) {
            const foundTimeZone =
              backendTimeZonesResponse.timeZones?.find((timeZone) => timeZone.id === browserTimeZone) ||
              backendTimeZonesResponse.timeZones?.find((timeZone) => timeZone.id === 'Etc/Utc');
            if (!foundTimeZone) {
              return;
            } // this should never happen
            const updateResponse = await updateUserProfile({
              ...data.user,
              timeZone: foundTimeZone.id,
            });
            if (updateResponse.requestSucceeded) {
              data.reloadUser();
              snackbar.pageSuccess(
                strings.formatString(
                  strings.UPDATED_TIMEZONE_MSG,
                  <Link to={APP_PATHS.MY_ACCOUNT}>{strings.MY_ACCOUNT}</Link>
                ),
                strings.formatString(strings.UPDATED_TIMEZONE_TITLE, foundTimeZone.longName)
              );
            }
          }
        }
      }
    };
    if (timeZoneFeatureEnabled) {
      populateTimeZone();
    }
  }, [data, snackbar, timeZoneFeatureEnabled]);

  return <UserContext.Provider value={data}>{children}</UserContext.Provider>;
}
