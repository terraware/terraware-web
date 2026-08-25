import { useCallback, useEffect, useMemo } from 'react';

import { useOrganization } from 'src/providers/hooks';
import { useLazyListSpeciesQuery } from 'src/queries/generated/species';
import { Species } from 'src/types/Species';

export type UseOrganizationSpeciesArgs = {
  /** Organization whose species to load. Defaults to the selected organization. */
  organizationId?: number;
  /** When true, only species already in use by the organization are returned. */
  inUse?: boolean;
};

export type UseOrganizationSpeciesResult = {
  species: Species[];
  speciesById: Record<number, Species>;
  /** Resolves the fresh species record for an id, or undefined when the id is missing/unknown. */
  findSpeciesById: (speciesId?: number | null) => Species | undefined;
  isLoading: boolean;
  refetch: () => Promise<void>;
};

export const useOrganizationSpecies = (args?: UseOrganizationSpeciesArgs): UseOrganizationSpeciesResult => {
  const { selectedOrganization } = useOrganization();
  const organizationId = args?.organizationId ?? selectedOrganization?.id;
  const inUse = args?.inUse;

  const [listSpecies, { currentData, isFetching, isUninitialized }] = useLazyListSpeciesQuery();

  useEffect(() => {
    if (organizationId && organizationId > 0) {
      void listSpecies({ organizationId, inUse }, true);
    }
  }, [listSpecies, organizationId, inUse, isUninitialized]);

  const refetch = useCallback(async (): Promise<void> => {
    if (organizationId && organizationId > 0) {
      await listSpecies({ organizationId, inUse }, false);
    }
  }, [listSpecies, organizationId, inUse]);

  const species = useMemo<Species[]>(() => currentData?.species ?? [], [currentData]);

  const speciesById = useMemo<Record<number, Species>>(
    () => Object.fromEntries(species.map((s) => [s.id, s])),
    [species]
  );

  const findSpeciesById = useCallback(
    (speciesId?: number | null): Species | undefined =>
      speciesId === undefined || speciesId === null ? undefined : speciesById[speciesId],
    [speciesById]
  );

  return useMemo<UseOrganizationSpeciesResult>(
    () => ({
      species,
      speciesById,
      findSpeciesById,
      isLoading: isUninitialized || isFetching,
      refetch,
    }),
    [species, speciesById, findSpeciesById, isFetching, isUninitialized, refetch]
  );
};
