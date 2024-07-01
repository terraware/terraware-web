import { DeliverableCategoryType } from 'src/types/Deliverables';
import { User } from 'src/types/User';

export type UserWithDeliverableCategories = User & {
  deliverableCategories: DeliverableCategoryType[];
};
