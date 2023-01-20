import React, { useCallback, useEffect, useState } from 'react';
import { getUser } from 'src/api/user/user';
import { UserContext } from './contexts';
import { ProvidedUserData } from './DataTypes';
import { useRecoilState } from 'recoil';
import userAtom from 'src/state/user';

export type UserProviderProps = {
  children?: React.ReactNode;
};

export default function UserProvider({ children }: UserProviderProps): JSX.Element {
  const [userState, setUserState] = useRecoilState(userAtom);

  const reloadUser = useCallback(() => {
    const populateUser = async () => {
      const response = await getUser();
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

  const [userData, setUserData] = useState<ProvidedUserData>({ reloadUser, bootstrapped: false });

  useEffect(() => {
    if (userData.user) {
      return;
    }
    reloadUser();
  }, [userData.user, reloadUser]);

  return <UserContext.Provider value={userData}>{children}</UserContext.Provider>;
}
