import { FunderActivityObservationPayload, FunderActivityPayload } from 'src/queries/generated/funderActivities';

// FunderActivityObservationPayload contains summary metrics but no observationId.
// The `observationId?: never` intersection keeps the TypedActivity union type-safe
// when code accesses `.observation?.observationId` across all payload variants.
type FunderActivityObservation = FunderActivityObservationPayload & { observationId?: never };

export type FunderActivity = Omit<FunderActivityPayload, 'observation'> & {
  observation?: FunderActivityObservation;
};
