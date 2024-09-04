import { User } from 'src/types/User';
import { InternalInterest } from 'src/types/UserInternalInterests';

export type UserWithInternalnterests = User & {
  internalInterests: InternalInterest[];
};
