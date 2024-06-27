import { createContext, useContext } from 'react';

import { DeliverableCategoryType } from 'src/types/Deliverables';
import { User } from 'src/types/User';

export type PersonData = {
  deliverableCategories?: DeliverableCategoryType[];
  isBusy?: boolean;
  setUserId: (userId: number) => void;
  userId: number;
  user?: User;
  update: (user: User, deliverableCategories: DeliverableCategoryType[], onSuccess: () => void) => void;
};

// default values pointing to nothing
export const PersonContext = createContext<PersonData>({
  setUserId: () => {},
  userId: -1,
  update: () => {},
});

export const usePersonData = () => useContext(PersonContext);
