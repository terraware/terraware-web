import { components } from 'src/api/types/generated-schema';

// Funder payloads don't include observation-related fields. These intersections
// add `never`-typed stubs so the TypedActivity union stays type-safe when code
// accesses `.observationId` or `.observation` across all payload variants.
type FunderActivityMediaItem = components['schemas']['FunderActivityMediaFilePayload'] & { observation?: never };

export type FunderActivity = Omit<components['schemas']['FunderActivityPayload'], 'media'> & {
  observationId?: never;
  media: FunderActivityMediaItem[];
};
