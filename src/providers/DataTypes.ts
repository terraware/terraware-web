import { User } from 'src/types/User';

export type ProvidedUserData = {
  user?: User;
  reloadUser: () => void;
};
