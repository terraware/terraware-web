import { createContext, useContext } from 'react';

import { UserWithInternalnterests } from 'src/scenes/AcceleratorRouter/People/UserWithInternalInterests';

export type PersonData = {
  setUserId: (userId: number) => void;
  userId: number;
  user?: UserWithInternalnterests;
};

// default values pointing to nothing
export const PersonContext = createContext<PersonData>({
  setUserId: () => {
    // no op for default
  },
  userId: -1,
});

export const usePersonData = () => useContext(PersonContext);
