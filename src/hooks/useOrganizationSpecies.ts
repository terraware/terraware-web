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
  isLoading: boolean;
  /** Forces a fresh fetch. Rarely needed — species mutations invalidate the cache automatically. */
  refetch: () => void;
};

/**
 * Loads an organization's species via RTK Query. Replaces the former SpeciesProvider/useSpeciesData
 * context: the species list is cached for the session (see the species extension's keepUnusedDataFor)
 * and refreshed by tag invalidation on species mutations.
 */
export const useOrganizationSpecies = (args?: UseOrganizationSpeciesArgs): UseOrganizationSpeciesResult => {
  const { selectedOrganization } = useOrganization();
  const organizationId = args?.organizationId ?? selectedOrganization?.id;
  const inUse = args?.inUse;

  const [listSpecies, { currentData, isFetching, isUninitialized }] = useLazyListSpeciesQuery();

  useEffect(() => {
    if (organizationId && organizationId > 0) {
      void listSpecies({ organizationId, inUse }, true);
    }
  }, [listSpecies, organizationId, inUse]);

  const refetch = useCallback(() => {
    if (organizationId && organizationId > 0) {
      void listSpecies({ organizationId, inUse }, false);
    }
  }, [listSpecies, organizationId, inUse]);

  return useMemo<UseOrganizationSpeciesResult>(() => {
    const species = currentData?.species ?? [];
    return {
      species,
      speciesById: Object.fromEntries(species.map((s) => [s.id, s])),
      isLoading: isUninitialized || isFetching,
      refetch,
    };
  }, [currentData, isFetching, isUninitialized, refetch]);
};
