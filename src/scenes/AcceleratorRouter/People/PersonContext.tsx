import { createContext, useContext } from 'react';

import { User } from 'src/types/User';

export type PersonData = {
  userId: number;
  user?: User;
};

// default values pointing to nothing
export const PersonContext = createContext<PersonData>({
  userId: -1,
});

export const usePersonData = () => useContext(PersonContext);
