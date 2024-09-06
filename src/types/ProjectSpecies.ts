import { DateTime } from 'luxon';

export type SpeciesDeliverable = {
  dueDate: DateTime;
  id: number;
  moduleEndDate: DateTime;
  moduleId: number;
  moduleStartDate: DateTime;
  projectId: number;
};
