import { useEffect, useMemo } from 'react';

import { useOrganization } from 'src/providers';
import { SearchResponseAccession, useLazyGetAccessionForSpeciesQuery } from 'src/queries/search/accessions';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useAccessions = (record?: { accessionId?: number }, speciesId?: number, excludeUsedUp?: boolean) => {
  const { selectedOrganization } = useOrganization();

  const [fetchAccessions, accessionsResult] = useLazyGetAccessionForSpeciesQuery();
  useEffect(() => {
    if (selectedOrganization) {
      void fetchAccessions({ organizationId: selectedOrganization.id, speciesId: speciesId ?? -1 });
    }
  }, [fetchAccessions, selectedOrganization, speciesId]);

  const availableAccessions = useMemo(
    () =>
      (accessionsResult.data ?? []).filter(
        (accession) =>
          (accession.remainingUnits === 'Seeds' && Number(accession['remainingQuantity(raw)']) > 0) ||
          Number(accession['estimatedCount(raw)']) > 0
      ),
    [accessionsResult.data]
  );
  const accessionId = record?.accessionId;
  const selectedAccession = useMemo<SearchResponseAccession | undefined>(
    () =>
      availableAccessions && accessionId
        ? availableAccessions.find((accession: SearchResponseAccession) => accession.id === `${accessionId}`)
        : undefined,
    [availableAccessions, accessionId]
  );

  return { availableAccessions, selectedAccession };
};
