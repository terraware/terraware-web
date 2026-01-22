import React, { type JSX, useCallback, useEffect, useState } from 'react';

import { selectUserAnalytics } from 'src/redux/features/user/userAnalyticsSelectors';
import { updateGtmInstrumented } from 'src/redux/features/user/userAnalyticsSlice';
import { requestUserCookieConsentUpdate } from 'src/redux/features/user/usersAsyncThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { PreferencesService, UserService } from 'src/services';
import { User } from 'src/types/User';
import { GlobalRolePermission, isAllowed as isAllowedACL } from 'src/utils/acl';
import { isTerraformationEmail } from 'src/utils/user';

import { PreferencesType, ProvidedUserData } from './DataTypes';
import { UserContext } from './contexts';

export type UserProviderProps = {
  children?: React.ReactNode;
};

export default function UserProvider({ children }: UserProviderProps): JSX.Element {
  const [user, setUser] = useState<User>();
  const [userPreferences, setUserPreferences] = useState<PreferencesType>();
  const userAnalyticsState = useAppSelector(selectUserAnalytics);
  const dispatch = useAppDispatch();

  const updateUserPreferences = useCallback(async (preferences: PreferencesType) => {
    const response = await PreferencesService.updateUserPreferences(preferences);
    if (response.requestSucceeded) {
      setUserPreferences(response.preferences ?? {});
    }

    return Promise.resolve(response.requestSucceeded);
  }, []);

  const reloadUserPreferences = useCallback(() => {
    const getUserPreferences = async () => {
      const response = await PreferencesService.getUserPreferences();

      setUserPreferences(response.preferences ?? {});
    };

    void getUserPreferences();
  }, [setUserPreferences]);

  const reloadUser = useCallback(() => {
    const populateUser = async () => {
      const response = await UserService.getUser();

      if (response.requestSucceeded) {
        setUser(response.user);
        if (response.user && !userAnalyticsState?.gtmInstrumented && (window as any).INIT_GTAG) {
          dispatch(updateGtmInstrumented({ gtmInstrumented: true }));

          // Put the language in the "lang" attribute of the <html> tag before initializing Google
          // Analytics because the cookie consent UI code will look there to determine which
          // language to use for the consent UI. This needs to happen before the call to INIT_GTAG,
          // so it lives here instead of in LocalizationProvider.
          const locale = response.user.locale;
          if (locale) {
            document.documentElement.setAttribute('lang', locale);
          }

          (window as any).INIT_GTAG(
            response.user.id.toString(),
            isTerraformationEmail(response.user.email) ? 'true' : 'false'
          );
        }
      }
    };

    void populateUser();
  }, [setUser, userAnalyticsState?.gtmInstrumented, dispatch]);

  const updateUserCookieConsent = useCallback(
    async (consent: boolean) => {
      await dispatch(requestUserCookieConsentUpdate({ cookiesConsented: consent }));
      reloadUser();
    },
    [dispatch, reloadUser]
  );

  const isAllowed = useCallback(
    (permission: GlobalRolePermission, metadata?: unknown): boolean => {
      if (!(userPreferences && user)) {
        return false;
      }

      return isAllowedACL(user, permission, metadata);
    },
    [user, userPreferences]
  );

  const [userData, setUserData] = useState<ProvidedUserData>({
    reloadUser,
    bootstrapped: false,
    userPreferences: {},
    reloadUserPreferences,
    updateUserCookieConsent,
    updateUserPreferences,
    isAllowed,
  });

  useEffect(() => {
    reloadUserPreferences();
  }, [reloadUserPreferences]);

  useEffect(() => {
    if (!user) {
      reloadUser();
    }
  }, [user, reloadUser]);

  useEffect(() => {
    setUserData((prev) => ({
      ...prev,
      user,
      userPreferences: userPreferences ?? {},
      reloadUserPreferences,
      bootstrapped: Boolean(userPreferences && user),
      isAllowed,
    }));
  }, [isAllowed, user, userPreferences, reloadUserPreferences]);

  return <UserContext.Provider value={userData}>{children}</UserContext.Provider>;
}
