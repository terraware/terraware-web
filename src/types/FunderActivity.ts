import { components } from 'src/api/types/generated-schema';

// FunderActivityObservationPayload contains summary metrics but no observationId.
// The `observationId?: never` intersection keeps the TypedActivity union type-safe
// when code accesses `.observation?.observationId` across all payload variants.
// TODO: funder read view should show inline metrics panel (observation.livePlants etc.) — design TBD
type FunderActivityObservation = components['schemas']['FunderActivityObservationPayload'] & { observationId?: never };

export type FunderActivity = Omit<components['schemas']['FunderActivityPayload'], 'observation'> & {
  observation?: FunderActivityObservation;
};
