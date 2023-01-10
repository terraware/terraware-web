import React from 'react';
import { UserContext } from './contexts';
import { ProvidedUserData } from './DataTypes';

export type UserProviderProps = {
  children?: React.ReactNode;
  data: ProvidedUserData;
};

export default function UserProvider({ children, data }: UserProviderProps): JSX.Element {
  return <UserContext.Provider value={data}>{children}</UserContext.Provider>;
}
