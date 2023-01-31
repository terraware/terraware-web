import React, { useCallback, useEffect, useState } from 'react';
import { PreferencesService, UserService } from 'src/services';
import { UserContext } from './contexts';
import { PreferencesType, ProvidedUserData } from './DataTypes';
import { useRecoilState } from 'recoil';
import userAtom from 'src/state/user';

export type UserProviderProps = {
  children?: React.ReactNode;
};

export default function UserProvider({ children }: UserProviderProps): JSX.Element {
  const [userState, setUserState] = useRecoilState(userAtom);
  const [userPreferences, setUserPreferences] = useState<PreferencesType>({});

  const reloadPreferences = useCallback(() => {
    const getUserPreferences = async () => {
      const response = await PreferencesService.getUserPreferences();
      if (response.requestSucceeded && response.preferences) {
        setUserPreferences(response.preferences);
      }
    };
    getUserPreferences();
  }, [setUserPreferences]);

  useEffect(() => {
    setUserData((prev) => ({
      ...prev,
      userPreferences,
      reloadPreferences,
    }));
  }, [userPreferences, reloadPreferences]);

  const reloadUser = useCallback(() => {
    const populateUser = async () => {
      const response = await UserService.getUser();
      if (response.requestSucceeded) {
        setUserData((previous: ProvidedUserData) => {
          return {
            ...previous,
            user: response.user!,
            bootstrapped: true,
          };
        });
        if (response.user && !userState?.gtmInstrumented && (window as any).INIT_GTAG) {
          setUserState({ gtmInstrumented: true });
          (window as any).INIT_GTAG(
            response.user.id.toString(),
            response.user.email?.toLowerCase()?.endsWith('@terraformation.com') ? 'true' : 'false'
          );
        }
      }
    };
    populateUser();
  }, [userState, setUserState]);

  useEffect(() => {
    reloadPreferences();
  }, [reloadPreferences]);

  const [userData, setUserData] = useState<ProvidedUserData>({
    reloadUser,
    bootstrapped: false,
    userPreferences,
    reloadPreferences,
  });

  useEffect(() => {
    if (userData.user) {
      return;
    }
    reloadUser();
  }, [userData.user, reloadUser]);

  return <UserContext.Provider value={userData}>{children}</UserContext.Provider>;
}
