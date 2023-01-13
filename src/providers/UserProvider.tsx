import React, { useCallback, useEffect, useState } from 'react';
import { getUser } from 'src/api/user/user';
import { UserContext } from './contexts';
import { ProvidedUserData } from './DataTypes';

export type UserProviderProps = {
  children?: React.ReactNode;
};

export default function UserProvider({ children }: UserProviderProps): JSX.Element {
  const reloadUser = useCallback(() => {
    const populateUser = async () => {
      const response = await getUser();
      if (response.requestSucceeded) {
        setUserData((previous: ProvidedUserData) => {
          return {
            ...previous,
            user: response.user ?? undefined,
            bootstrapped: true,
          };
        });
      }
    };
    populateUser();
  }, []);
  const [userData, setUserData] = useState<ProvidedUserData>({ reloadUser, bootstrapped: false });

  useEffect(() => {
    if (userData.user) {
      return;
    }
    reloadUser();
  }, [userData.user, reloadUser]);

  return <UserContext.Provider value={userData}>{children}</UserContext.Provider>;
}
