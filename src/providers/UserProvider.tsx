import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { updateUserProfile } from 'src/api/user/user';
import { APP_PATHS } from 'src/constants';
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

  useEffect(() => {
    const populateTimeZone = async () => {
      if (data.user) {
        if (!data.user.timeZone) {
          // Should validate bowser time zone with supported time-zones returned by backend
          const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const updateResponse = await updateUserProfile({ ...data.user, timeZone: browserTimeZone });
          if (updateResponse.requestSucceeded) {
            data.reloadUser();
            snackbar.pageSuccess(
              strings.formatString(
                strings.UPDATED_TIMEZONE_MSG,
                <Link to={APP_PATHS.MY_ACCOUNT}>{strings.MY_ACCOUNT}</Link>
              ),
              strings.formatString(strings.UPDATED_TIMEZONE_TITLE, browserTimeZone)
            );
          }
        }
      }
    };
    populateTimeZone();
  }, [data.user]);

  return <UserContext.Provider value={data}>{children}</UserContext.Provider>;
}
