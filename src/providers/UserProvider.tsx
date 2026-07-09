import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import useUpdateUserPreferences from 'src/hooks/useUpdateUserPreferences';
import { useGetUserPreferencesQuery, useUpdateCookieConsentMutation } from 'src/queries/generated/preferences';
import { useGetMyselfQuery } from 'src/queries/generated/users';
import { selectUserAnalytics } from 'src/redux/features/user/userAnalyticsSelectors';
import { updateGtmInstrumented } from 'src/redux/features/user/userAnalyticsSlice';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { User } from 'src/types/User';
import { GlobalRolePermission, isAllowed as isAllowedACL } from 'src/utils/acl';
import { isTerraformationEmail } from 'src/utils/user';

import { PreferencesType, ProvidedUserData } from './DataTypes';
import { UserContext } from './contexts';
import { setCurrentUserSnapshot, setGlobalPreferencesSnapshot } from './currentUserStore';

export type UserProviderProps = {
  children?: React.ReactNode;
};

export default function UserProvider({ children }: UserProviderProps): JSX.Element {
  const userAnalyticsState = useAppSelector(selectUserAnalytics);
  const dispatch = useAppDispatch();

  const { currentData, refetch } = useGetMyselfQuery();
  // Latch the user into local state so it survives the RESET_APP store wipe that OrganizationProvider
  // dispatches on org change (which clears the RTK Query cache). Only populated, never cleared here —
  // effectively "only a logout/reload resets the user", matching the pre-RTK behavior.
  const [user, setUser] = useState<User>();

  useEffect(() => {
    if (currentData?.user) {
      setUser(currentData.user);
      // Mirror into the module snapshot for synchronous non-React readers (feature flags).
      setCurrentUserSnapshot(currentData.user);
    }
  }, [currentData]);

  const { currentData: preferencesData, refetch: refetchPreferences } = useGetUserPreferencesQuery(undefined);
  // Latch the global preferences (and the loaded flag) locally for the same reason as `user`: the
  // RESET_APP store wipe clears the RTK Query cache on org change, and bootstrapping must not regress
  // to a spinner. Only populated, never cleared here.
  const [userPreferences, setUserPreferences] = useState<PreferencesType>();
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  useEffect(() => {
    if (preferencesData) {
      const preferences = preferencesData.preferences ?? {};
      setUserPreferences(preferences);
      setPreferencesLoaded(true);
      // Mirror into the module snapshot for synchronous non-React readers (feature flags).
      setGlobalPreferencesSnapshot(preferences);
    }
  }, [preferencesData]);

  const updatePreferences = useUpdateUserPreferences();
  const [updateCookieConsent] = useUpdateCookieConsentMutation();

  const updateUserPreferences = useCallback(
    async (preferences: PreferencesType): Promise<boolean> => {
      try {
        await updatePreferences(preferences);
        return true;
      } catch {
        return false;
      }
    },
    [updatePreferences]
  );

  const reloadUserPreferences = useCallback(() => {
    void refetchPreferences();
  }, [refetchPreferences]);

  const reloadUser = useCallback(() => {
    void refetch();
  }, [refetch]);

  const updateUserCookieConsent = useCallback(
    async (consent: boolean) => {
      await updateCookieConsent({ cookiesConsented: consent }).unwrap();
      reloadUser();
    },
    [updateCookieConsent, reloadUser]
  );

  const isAllowed = useCallback(
    (permission: GlobalRolePermission, metadata?: unknown): boolean => {
      if (!(preferencesLoaded && user)) {
        return false;
      }

      return isAllowedACL(user, permission, metadata);
    },
    [user, preferencesLoaded]
  );

  const userData = useMemo<ProvidedUserData>(
    () => ({
      reloadUser,
      bootstrapped: Boolean(preferencesLoaded && user),
      user,
      userPreferences: userPreferences ?? {},
      reloadUserPreferences,
      updateUserCookieConsent,
      updateUserPreferences,
      isAllowed,
    }),
    [
      reloadUser,
      user,
      preferencesLoaded,
      userPreferences,
      reloadUserPreferences,
      updateUserCookieConsent,
      updateUserPreferences,
      isAllowed,
    ]
  );

  useEffect(() => {
    if (user && !userAnalyticsState?.gtmInstrumented && (window as any).INIT_GTAG) {
      dispatch(updateGtmInstrumented({ gtmInstrumented: true }));

      // Put the language in the "lang" attribute of the <html> tag before initializing Google
      // Analytics because the cookie consent UI code will look there to determine which
      // language to use for the consent UI. This needs to happen before the call to INIT_GTAG,
      // so it lives here instead of in LocalizationProvider.
      const locale = user.locale;
      if (locale) {
        document.documentElement.setAttribute('lang', locale);
      }

      (window as any).INIT_GTAG(user.id.toString(), isTerraformationEmail(user.email) ? 'true' : 'false');
    }
  }, [user, userAnalyticsState?.gtmInstrumented, dispatch]);

  return <UserContext.Provider value={userData}>{children}</UserContext.Provider>;
}
