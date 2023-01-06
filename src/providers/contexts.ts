import { createContext } from 'react';
import { ProvidedUserData } from './DataTypes';

export const UserContext = createContext<ProvidedUserData>({
  reloadUser: () => {
    // default no-op implementation
    return;
  },
});
