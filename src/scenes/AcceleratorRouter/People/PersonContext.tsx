import { createContext, useContext } from 'react';

import { UserWithDeliverableCategories } from 'src/scenes/AcceleratorRouter/People/UserWithDeliverableCategories';

export type PersonData = {
  setUserId: (userId: number) => void;
  userId: number;
  user?: UserWithDeliverableCategories;
};

// default values pointing to nothing
export const PersonContext = createContext<PersonData>({
  setUserId: () => {},
  userId: -1,
});

export const usePersonData = () => useContext(PersonContext);
