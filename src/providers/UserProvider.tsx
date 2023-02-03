import React, { useCallback, useEffect, useState } from 'react';
import { User } from 'src/types/User';
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
  const [user, setUser] = useState<User>();
  const [userPreferences, setUserPreferences] = useState<PreferencesType>();

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

    getUserPreferences();
  }, [setUserPreferences]);

  const reloadUser = useCallback(() => {
    const populateUser = async () => {
      const response = await UserService.getUser();

      if (response.requestSucceeded) {
        setUser(response.user!);
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
  }, [setUser, setUserState, userState?.gtmInstrumented]);

  const [userData, setUserData] = useState<ProvidedUserData>({
    reloadUser,
    bootstrapped: false,
    userPreferences: {},
    reloadUserPreferences,
    updateUserPreferences,
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
    }));
  }, [user, userPreferences, reloadUserPreferences]);

  return <UserContext.Provider value={userData}>{children}</UserContext.Provider>;
}
