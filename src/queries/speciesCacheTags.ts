import { QueryTagTypes } from './tags';

/**
 * Builds per-species cache tags for endpoints whose responses embed species data (a speciesId or
 * scientific name). Species mutations (update/delete) invalidate these tags, so cached copies of a
 * renamed or removed species refresh wherever they appear across the app.
 */
export const speciesCacheTags = (speciesIds: (number | undefined | null)[]) => {
  const uniqueIds = Array.from(new Set(speciesIds.filter((id): id is number => id !== null && id !== undefined)));
  return uniqueIds.map((id) => ({ type: QueryTagTypes.Species as const, id }));
};
